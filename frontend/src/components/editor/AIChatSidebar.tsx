"use client";

import { useState, useRef, useEffect } from 'react';
import {
  X, Send, Sparkles, FileText, Wand2, Loader2, Check, XCircle,
  Replace, Plus, type LucideIcon,
} from 'lucide-react';
import type { JSONContent } from '@tiptap/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import {
  chatWithNoteContext, jsonToText, parseProposal,
  type ChatTurn, type ProposalAction,
} from '@/lib/ai';

type ProposalStatus = 'pending' | 'applied' | 'rejected';

interface Proposal {
  action: ProposalAction;
  content: string;
  status: ProposalStatus;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  proposal?: Proposal;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'welcome',
    role: 'assistant',
    content:
      'Merhaba! Bu not hakkında sana nasıl yardımcı olabilirim?\n\n*"Notu Özetle"* veya *"Notu İyileştir"* hızlı aksiyonlarını kullanabilir; ya da sohbet üzerinden değişiklik isteyebilirsin (örn: "şu paragrafı daha resmi yap").',
  },
];

const MIN_WIDTH = 320;
const MAX_WIDTH = 800;
const DEFAULT_WIDTH = 420;

interface AIChatSidebarProps {
  open: boolean;
  onClose: () => void;
  noteTitle: string;
  noteContent: JSONContent | null;
  onApplyProposal?: (action: ProposalAction, markdown: string) => void;
}

export function AIChatSidebar({
  open, onClose, noteTitle, noteContent, onApplyProposal,
}: AIChatSidebarProps) {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [resizing, setResizing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => () => abortRef.current?.abort(), []);

  useEffect(() => {
    if (!resizing) return;
    const onMove = (e: MouseEvent) => {
      const w = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, window.innerWidth - e.clientX));
      setWidth(w);
    };
    const onUp = () => setResizing(false);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [resizing]);

  /** Ortak: kullanıcı mesajı ekler, AI çağrısı yapar, sonucu mesaj olarak ekler. */
  const ask = async (
    userVisible: string,
    apiPrompt: string,
    forceProposal: ProposalAction | null = null,
  ) => {
    if (loading) return;

    setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'user', content: userVisible }]);
    setLoading(true);

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const history: ChatTurn[] = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({
          role: m.role,
          content: m.proposal ? m.proposal.content : m.content,
        }));

      const reply = await chatWithNoteContext({
        context: { title: noteTitle, text: jsonToText(noteContent) },
        history,
        message: apiPrompt,
        signal: ctrl.signal,
      });

      const parsed = parseProposal(reply);
      let msg: Message;
      if (forceProposal) {
        // Quick action: yanıtı her zaman öneri olarak işaretle
        msg = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: '',
          proposal: {
            action: forceProposal,
            content: parsed.proposal?.content ?? parsed.text,
            status: 'pending',
          },
        };
      } else if (parsed.proposal) {
        msg = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: '',
          proposal: { ...parsed.proposal, status: 'pending' },
        };
      } else {
        msg = { id: crypto.randomUUID(), role: 'assistant', content: parsed.text };
      }
      setMessages(prev => [...prev, msg]);
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      const errMsg = err instanceof Error ? err.message : 'Bilinmeyen hata';
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `⚠️ Hata: ${errMsg}`,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const send = () => {
    const v = input.trim();
    if (!v) return;
    setInput('');
    ask(v, v);
  };

  const handleSummarize = () =>
    ask(
      'Notu özetle',
      'Yukarıdaki notu kısa, net ve madde madde özetle. Ana fikirleri çıkar.',
      'replace',
    );

  const handleImprove = () =>
    ask(
      'Notu iyileştir',
      'Yukarıdaki notu daha akıcı, profesyonel ve organize hale getir. İçeriği değiştirme — sadece dil, akış ve yapıyı iyileştir.',
      'replace',
    );

  const setProposalStatus = (msgId: string, status: ProposalStatus) =>
    setMessages(prev => prev.map(m =>
      m.id === msgId && m.proposal ? { ...m, proposal: { ...m.proposal, status } } : m,
    ));

  const applyProposal = (msgId: string) => {
    const msg = messages.find(m => m.id === msgId);
    if (!msg?.proposal) return;
    onApplyProposal?.(msg.proposal.action, msg.proposal.content);
    setProposalStatus(msgId, 'applied');
  };

  const rejectProposal = (msgId: string) => setProposalStatus(msgId, 'rejected');

  return (
    <aside
      aria-hidden={!open}
      style={{ width: `min(100vw, ${width}px)` }}
      className={cn(
        'fixed top-0 right-0 bottom-0 z-30 glass border-l border-white/10 flex flex-col',
        resizing ? '' : 'transition-transform duration-300 ease-out',
        open ? 'translate-x-0' : 'translate-x-full pointer-events-none',
      )}
    >
      <div
        onMouseDown={(e) => { e.preventDefault(); setResizing(true); }}
        className={cn(
          'absolute left-0 top-0 bottom-0 w-1 cursor-col-resize z-40',
          'hover:bg-primary/40 transition-colors',
          resizing && 'bg-primary/60',
        )}
        title="Sürükle: genişliği değiştir"
      />

      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
          </div>
          <h2 className="font-semibold text-sm">AI Asistan</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Kapat"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map(m => (
          m.proposal ? (
            <ProposalCard
              key={m.id}
              proposal={m.proposal}
              onApply={() => applyProposal(m.id)}
              onReject={() => rejectProposal(m.id)}
            />
          ) : (
            <MessageBubble key={m.id} message={m} />
          )
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">düşünüyor...</span>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 pt-3 pb-2 border-t border-white/5 flex gap-2 shrink-0">
        <QuickAction icon={FileText} label="Notu Özetle" onClick={handleSummarize} disabled={loading} />
        <QuickAction icon={Wand2} label="Notu İyileştir" onClick={handleImprove} disabled={loading} />
      </div>

      <div className="px-4 pb-4 pt-2 shrink-0">
        <div className="relative">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            disabled={loading}
            rows={1}
            placeholder="Bir şey sor veya değişiklik öner..."
            className="w-full pl-4 pr-11 py-2.5 bg-black/30 border border-white/10 rounded-xl outline-none focus:border-primary transition-colors text-sm resize-none placeholder:text-muted-foreground/50 disabled:opacity-60"
          />
          <button
            type="button"
            onClick={send}
            disabled={!input.trim() || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-primary text-white shadow-md shadow-primary/30 hover:bg-primary-dark disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Gönder"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground/60 mt-1.5 px-1">
          Enter ile gönder · Shift+Enter ile yeni satır
        </p>
      </div>
    </aside>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] px-3.5 py-2 text-sm leading-relaxed',
          isUser
            ? 'bg-primary text-white rounded-2xl rounded-br-sm shadow-md shadow-primary/20'
            : 'bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm',
        )}
      >
        {isUser ? (
          message.content
        ) : (
          <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-pre:my-2 prose-headings:my-2">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

function ProposalCard({
  proposal, onApply, onReject,
}: {
  proposal: Proposal;
  onApply: () => void;
  onReject: () => void;
}) {
  const ActionIcon = proposal.action === 'replace' ? Replace : Plus;
  const actionLabel = proposal.action === 'replace' ? 'Notu değiştir' : 'Paragraf ekle';

  return (
    <div className={cn(
      'rounded-2xl border overflow-hidden',
      proposal.status === 'pending' && 'bg-primary/5 border-primary/30 shadow-lg shadow-primary/10',
      proposal.status === 'applied' && 'bg-green-500/5 border-green-500/30',
      proposal.status === 'rejected' && 'bg-white/3 border-white/10 opacity-60',
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <ActionIcon className={cn(
            'w-3.5 h-3.5',
            proposal.status === 'applied' ? 'text-green-400' : 'text-primary',
          )} />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            AI Önerisi
          </span>
          <span className="text-[10px] text-muted-foreground/70">· {actionLabel}</span>
        </div>
        {proposal.status === 'applied' && (
          <span className="flex items-center gap-1 text-[11px] text-green-400 font-medium">
            <Check className="w-3 h-3" /> Uygulandı
          </span>
        )}
        {proposal.status === 'rejected' && (
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
            <XCircle className="w-3 h-3" /> Reddedildi
          </span>
        )}
      </div>

      {/* Preview */}
      <div className="px-3.5 py-2.5 max-h-64 overflow-y-auto">
        <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-pre:my-2 prose-headings:my-2">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{proposal.content}</ReactMarkdown>
        </div>
      </div>

      {/* Actions */}
      {proposal.status === 'pending' && (
        <div className="flex gap-2 px-3.5 py-2.5 bg-black/20 border-t border-white/5">
          <button
            type="button"
            onClick={onReject}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-medium text-muted-foreground transition-colors"
          >
            <XCircle className="w-3.5 h-3.5" />
            Reddet
          </button>
          <button
            type="button"
            onClick={onApply}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white shadow-md shadow-primary/30 hover:bg-primary-dark text-xs font-semibold transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            Değişiklikleri Onayla
          </button>
        </div>
      )}
    </div>
  );
}

function QuickAction({
  icon: Icon, label, onClick, disabled,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-primary/40 hover:bg-primary/5 hover:text-primary text-xs font-medium text-muted-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}
