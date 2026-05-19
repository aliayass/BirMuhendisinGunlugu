"use client";

import React, { useState, useRef, useEffect, useCallback, ReactNode } from 'react';
import type { JSONContent } from '@tiptap/react';
import {
  ArrowLeft, Save, Loader2, Sparkles, Pin, Wand2, BookOpen,
} from 'lucide-react';
import { marked } from 'marked';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { stripOuterFence, jsonToText, type ProposalAction } from '@/lib/ai';
import { Button } from '@/components/ui/button';
import { RichTextEditor, type RichTextEditorHandle } from './RichTextEditor';
import { AIChatSidebar } from './AIChatSidebar';
import { cn } from '@/lib/utils';

const CATEGORIES = ['Genel', 'Mimari', 'Algoritma', 'DevOps', 'Frontend', 'Backend', 'Veritabanı', 'Güvenlik'];
const EMPTY_DOC: JSONContent = { type: 'doc', content: [{ type: 'paragraph' }] };

export interface EditorCanvasSaveData {
  title: string;
  content: JSONContent;
  category: string;
  tags: string;
}

interface EditorCanvasProps {
  noteId?: string;
  initialTitle?: string;
  initialContent?: JSONContent | null;
  initialCategory?: string;
  initialTags?: string;

  createdAt?: string;
  updatedAt?: string | null;

  onSave: (data: EditorCanvasSaveData) => void | Promise<void>;
  onCancel?: () => void;
  /** Title/content/category/tags değiştiğinde tetiklenir — auto-save için */
  onChange?: (data: EditorCanvasSaveData) => void;
  onTogglePin?: () => Promise<void> | void;
  /** AI etiket önerisi — mevcut not metnini alır, virgülle ayrılmış öneri döner */
  onSuggestTags?: (currentText: string) => Promise<string>;

  isSaving?: boolean;
  isPinned?: boolean;
  saveDisabled?: boolean;
  statusSlot?: ReactNode;
}

export function EditorCanvas({
  noteId,
  initialTitle = '',
  initialContent = null,
  initialCategory = 'Genel',
  initialTags = '',
  createdAt,
  updatedAt,
  onSave,
  onCancel,
  onChange,
  onTogglePin,
  onSuggestTags,
  isSaving = false,
  isPinned = false,
  saveDisabled = false,
  statusSlot,
}: EditorCanvasProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState<JSONContent | null>(initialContent);
  const [category, setCategory] = useState(initialCategory);
  const [tags, setTags] = useState(initialTags);
  const [aiOpen, setAiOpen] = useState(false);
  const [suggestingTags, setSuggestingTags] = useState(false);

  const editorRef = useRef<RichTextEditorHandle>(null);
  const isInitial = useRef(true);

  // onChange — yalnızca kullanıcı değişikliklerinde
  useEffect(() => {
    if (isInitial.current) {
      isInitial.current = false;
      return;
    }
    onChange?.({ title, content: content ?? EMPTY_DOC, category, tags });
  }, [title, content, category, tags, onChange]);

  const applyProposal = useCallback((action: ProposalAction, markdown: string) => {
    const md = stripOuterFence(markdown);
    const html = marked.parse(md, { async: false }) as string;
    if (action === 'replace') editorRef.current?.setContent(html);
    else editorRef.current?.insertContent(html);
  }, []);

  const handleSuggest = async () => {
    if (!onSuggestTags || !content) return;
    const text = jsonToText(content);
    if (!text.trim()) return;
    setSuggestingTags(true);
    try {
      const suggested = await onSuggestTags(text);
      const merged = Array.from(new Set(
        [...tags.split(','), ...suggested.split(',')]
          .map(t => t.trim())
          .filter(Boolean),
      ));
      setTags(merged.join(', '));
    } finally {
      setSuggestingTags(false);
    }
  };

  const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
  const wordCount = content ? jsonToText(content).split(/\s+/).filter(Boolean).length : 0;
  const charCount = content ? jsonToText(content).length : 0;

  return (
    <div className="min-h-full flex flex-col">
      <header className="sticky top-0 z-20 glass border-b border-white/5 px-6 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="rounded-xl shrink-0"
            aria-label="Geri"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          {statusSlot && <div className="text-sm text-muted-foreground hidden sm:block truncate">{statusSlot}</div>}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {noteId && onTogglePin && (
            <button
              type="button"
              onClick={onTogglePin}
              className={cn(
                'p-2 rounded-xl transition-colors',
                isPinned
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-primary hover:bg-primary/10',
              )}
              title={isPinned ? 'Sabitlemeyi kaldır' : 'Sabitle'}
            >
              <Pin className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setAiOpen(o => !o)}
            className={cn(
              'flex items-center gap-1.5 px-3 h-10 rounded-xl text-sm font-medium transition-colors border',
              aiOpen
                ? 'bg-primary/15 text-primary border-primary/30'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/5 border-transparent',
            )}
            aria-label="AI Asistan"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">AI</span>
          </button>

          <Button
            onClick={() => onSave({ title, content: content ?? EMPTY_DOC, category, tags })}
            disabled={isSaving || saveDisabled || !title.trim()}
            className="h-10 px-5 rounded-xl bg-primary hover:bg-primary-dark gap-2 shadow-lg shadow-primary/20"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Kaydet</span>
          </Button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div
            className={cn(
              'max-w-3xl px-6 sm:px-10 py-16 sm:py-24 transition-[margin] duration-300 ease-out',
              aiOpen ? 'ml-8 sm:ml-16 lg:ml-32 mr-auto' : 'mx-auto',
            )}
          >
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Başlıksız"
              autoFocus
              className="w-full text-4xl sm:text-5xl font-black tracking-tight bg-transparent outline-none border-none placeholder:text-muted-foreground/25 mb-6"
            />

            {/* Title altı bilgi şeridi */}
            <div className="flex items-center gap-2 flex-wrap mb-10 text-xs">
              <span className="bg-primary/10 text-primary border border-primary/20 rounded-md px-2 py-0.5">
                {category}
              </span>
              {tagList.slice(0, 5).map(t => (
                <span key={t} className="text-muted-foreground bg-white/5 border border-white/10 rounded-md px-2 py-0.5">
                  #{t}
                </span>
              ))}
              {(createdAt || updatedAt) && (
                <span className="text-muted-foreground">
                  {formatDistanceToNow(new Date(updatedAt ?? createdAt!), { addSuffix: true, locale: tr })}
                </span>
              )}
            </div>

            <RichTextEditor
              ref={editorRef}
              initialContent={initialContent}
              onChange={setContent}
            />
          </div>
        </div>

        {/* Metadata sidebar — AI açıkken otomatik gizlenir */}
        <aside
          className={cn(
            'shrink-0 hidden lg:block overflow-y-auto transition-all duration-300',
            aiOpen
              ? 'lg:w-0 lg:opacity-0 lg:border-l-0'
              : 'lg:w-72 lg:opacity-100 lg:border-l lg:border-white/5',
          )}
        >
          <div className="p-5 space-y-6 min-w-[18rem]">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                Kategori
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Etiketler
                </label>
                {onSuggestTags && (
                  <button
                    type="button"
                    onClick={handleSuggest}
                    disabled={suggestingTags || !content}
                    className="flex items-center gap-1 text-xs text-primary hover:bg-primary/10 px-2 py-1 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    title="AI ile etiket öner"
                  >
                    {suggestingTags ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                    AI
                  </button>
                )}
              </div>
              <input
                type="text"
                value={tags}
                onChange={e => setTags(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
                placeholder="react, api, design..."
              />
              {tagList.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {tagList.map(t => (
                    <span key={t} className="text-xs text-muted-foreground bg-white/5 border border-white/10 rounded px-1.5 py-0.5">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3 h-3" /> Bilgiler
              </label>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                {createdAt && (
                  <p>Oluşturulma: {formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: tr })}</p>
                )}
                {updatedAt && (
                  <p>Güncelleme: {formatDistanceToNow(new Date(updatedAt), { addSuffix: true, locale: tr })}</p>
                )}
                <p>{wordCount} kelime · {charCount} karakter</p>
              </div>
            </div>
          </div>
        </aside>
      </main>

      <AIChatSidebar
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        noteTitle={title}
        noteContent={content}
        onApplyProposal={applyProposal}
      />
    </div>
  );
}
