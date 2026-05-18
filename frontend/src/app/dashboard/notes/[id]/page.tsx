"use client";

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/prism';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  Eye,
  Edit3,
  Save,
  Pin,
  Loader2,
  Check,
  Sparkles,
  BookMarked,
  X,
  Wand2,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { toast } from 'sonner';
import { formatDistanceToNow, isSameDay, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Note {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  tags: string;
  category: string;
  createdAt: string;
  updatedAt: string | null;
}

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: string;
  createdAt: string;
}

interface DictionaryTerm {
  id: string;
  term: string;
  definition: string;
  category: string;
}

const CATEGORIES = ['Genel', 'Mimari', 'Algoritma', 'DevOps', 'Frontend', 'Backend', 'Veritabanı', 'Güvenlik'];

export default function NoteEditorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [category, setCategory] = useState('Genel');
  const [isPinned, setIsPinned] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);

  const [suggestingTags, setSuggestingTags] = useState(false);
  const [aiDrawer, setAiDrawer] = useState<{ open: boolean; title: string; content: string; loading: boolean }>({
    open: false, title: '', content: '', loading: false,
  });

  const [sameDayJournals, setSameDayJournals] = useState<JournalEntry[]>([]);
  const [dictTerms, setDictTerms] = useState<DictionaryTerm[]>([]);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchNote = useCallback(async () => {
    try {
      const res = await api.get('/notes');
      const found: Note = res.data.find((n: Note) => n.id === id);
      if (!found) { router.push('/dashboard/notes'); return; }
      setNote(found);
      setTitle(found.title);
      setContent(found.content);
      setTags(found.tags ?? '');
      setCategory(found.category ?? 'Genel');
      setIsPinned(found.isPinned ?? false);

      // Fetch same-day journals
      try {
        const jres = await api.get('/journals');
        const noteDate = parseISO(found.createdAt);
        const matches = (jres.data as JournalEntry[]).filter(j => isSameDay(parseISO(j.createdAt), noteDate));
        setSameDayJournals(matches);
      } catch { /* silent */ }

      // Fetch dictionary terms for auto-link
      try {
        const dres = await api.get('/dictionary');
        setDictTerms(dres.data);
      } catch { /* silent */ }
    } catch {
      toast.error('Not yüklenemedi.');
      router.push('/dashboard/notes');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => { fetchNote(); }, [fetchNote]);

  const save = useCallback(async (silent = false) => {
    if (!id) return;
    setIsSaving(true);
    try {
      await api.put(`/notes/${id}`, { id, title, content, tags, category });
      setSavedAt(new Date());
      setIsDirty(false);
      if (!silent) toast.success('Not kaydedildi.');
    } catch {
      if (!silent) toast.error('Kaydedilemedi.');
    } finally {
      setIsSaving(false);
    }
  }, [id, title, content, tags, category]);

  useEffect(() => {
    if (!isDirty) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => save(true), 2000);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [isDirty, save]);

  const markDirty = () => setIsDirty(true);

  const handleTogglePin = async () => {
    try {
      const res = await api.patch(`/notes/${id}/pin`);
      setIsPinned(res.data.isPinned);
      toast.success(res.data.isPinned ? 'Not sabitlendi.' : 'Sabitleme kaldırıldı.');
    } catch {
      toast.error('Güncelleme başarısız.');
    }
  };

  const handleSuggestTags = async () => {
    if (!content.trim()) { toast.error('Önce içerik yazmalısın.'); return; }
    setSuggestingTags(true);
    try {
      const res = await api.post('/ai/suggest-tags', { content });
      const suggested: string = res.data.result ?? '';
      const newTagSet = new Set(
        [...tags.split(','), ...suggested.split(',')]
          .map(t => t.trim())
          .filter(Boolean)
      );
      setTags(Array.from(newTagSet).join(', '));
      setIsDirty(true);
      toast.success('AI etiketleri eklendi.');
    } catch {
      toast.error('AI etiketleri alınamadı.');
    } finally {
      setSuggestingTags(false);
    }
  };

  const handleExplainCode = async (code: string, language: string) => {
    setAiDrawer({ open: true, title: `Kod açıklaması (${language || 'metin'})`, content: '', loading: true });
    try {
      const res = await api.post('/ai/explain-code', { code, language: language || 'text' });
      setAiDrawer(s => ({ ...s, content: res.data.result ?? '', loading: false }));
    } catch {
      setAiDrawer(s => ({ ...s, content: 'AI açıklaması alınamadı.', loading: false }));
    }
  };

  // Dictionary auto-link: builds a regex of all terms once
  const termRegex = useMemo(() => {
    if (dictTerms.length === 0) return null;
    const sorted = [...dictTerms].sort((a, b) => b.term.length - a.term.length);
    const escaped = sorted.map(t => t.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    return new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi');
  }, [dictTerms]);

  const renderWithGlossary = (text: string): React.ReactNode => {
    if (!termRegex || !text) return text;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;
    termRegex.lastIndex = 0;
    while ((match = termRegex.exec(text)) !== null) {
      if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
      const term = dictTerms.find(t => t.term.toLowerCase() === match![0].toLowerCase());
      if (term) {
        parts.push(
          <span
            key={`${match.index}-${term.id}`}
            className="underline decoration-dotted decoration-primary/60 cursor-help"
            title={term.definition}
          >
            {match[0]}
          </span>
        );
      } else {
        parts.push(match[0]);
      }
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) parts.push(text.slice(lastIndex));
    return <>{parts}</>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!note) return null;

  const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
  const dateToShow = note.updatedAt ?? note.createdAt;

  return (
    <div className="min-h-full flex flex-col">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 glass border-b border-white/5 px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/dashboard/notes')}
            className="rounded-xl"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="text-sm text-muted-foreground hidden sm:block">
            {isSaving ? (
              <span className="flex items-center gap-1.5"><Loader2 className="w-3 h-3 animate-spin" /> Kaydediliyor...</span>
            ) : savedAt ? (
              <span className="flex items-center gap-1.5 text-accent"><Check className="w-3 h-3" /> {formatDistanceToNow(savedAt, { addSuffix: true, locale: tr })} kaydedildi</span>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTogglePin}
            className={cn(
              "p-2 rounded-xl transition-colors",
              isPinned ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary hover:bg-primary/10"
            )}
            title={isPinned ? 'Sabitlemeyi kaldır' : 'Sabitle'}
          >
            <Pin className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsPreview(!isPreview)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors",
              isPreview ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            )}
          >
            {isPreview ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span className="hidden sm:inline">{isPreview ? 'Düzenle' : 'Önizle'}</span>
          </button>
          <Button
            onClick={() => save()}
            disabled={isSaving}
            className="h-9 px-4 rounded-xl bg-primary hover:bg-primary-dark gap-2"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span className="hidden sm:inline">Kaydet</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Editor / Preview */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <input
              type="text"
              value={title}
              onChange={e => { setTitle(e.target.value); markDirty(); }}
              className="w-full text-4xl font-black bg-transparent outline-none border-none placeholder:text-muted-foreground/40 mb-6"
              placeholder="Başlık..."
            />

            <div className="flex items-center gap-3 mb-8 flex-wrap">
              {note.category && (
                <span className="text-xs bg-primary/10 text-primary border border-primary/20 rounded-md px-2 py-1">
                  {category}
                </span>
              )}
              {tagList.map(tag => (
                <span key={tag} className="text-xs text-muted-foreground bg-white/5 border border-white/10 rounded-md px-2 py-1">
                  #{tag}
                </span>
              ))}
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(dateToShow), { addSuffix: true, locale: tr })}
              </span>
            </div>

            {isPreview ? (
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => <p>{React.Children.map(children, c => typeof c === 'string' ? renderWithGlossary(c) : c)}</p>,
                    li: ({ children }) => <li>{React.Children.map(children, c => typeof c === 'string' ? renderWithGlossary(c) : c)}</li>,
                    code({ className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      const codeText = String(children).replace(/\n$/, '');
                      const isBlock = codeText.includes('\n');
                      if (match || isBlock) {
                        const language = match?.[1] ?? 'text';
                        return (
                          <div className="relative group my-3">
                            <button
                              onClick={() => handleExplainCode(codeText, language)}
                              className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 px-2 py-1 rounded-md bg-primary/20 hover:bg-primary/30 text-primary text-xs"
                              title="AI'a sor"
                            >
                              <Sparkles className="w-3 h-3" />
                              AI'a sor
                            </button>
                            <SyntaxHighlighter
                              style={vscDarkPlus as Record<string, React.CSSProperties>}
                              language={language}
                              PreTag="div"
                              className="rounded-xl !text-sm"
                            >
                              {codeText}
                            </SyntaxHighlighter>
                          </div>
                        );
                      }
                      return (
                        <code className="bg-white/10 px-1.5 py-0.5 rounded text-primary text-sm" {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>
            ) : (
              <textarea
                value={content}
                onChange={e => { setContent(e.target.value); markDirty(); }}
                className="w-full min-h-[60vh] bg-transparent outline-none resize-none text-sm leading-relaxed font-mono placeholder:text-muted-foreground/40"
                placeholder="Markdown desteklenir... ```kod bloğu```, # Başlık, **kalın**, vb."
              />
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <aside className="w-72 shrink-0 border-l border-white/5 p-5 space-y-6 hidden lg:block overflow-y-auto">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Kategori</label>
            <select
              value={category}
              onChange={e => { setCategory(e.target.value); markDirty(); }}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Etiketler</label>
              <button
                onClick={handleSuggestTags}
                disabled={suggestingTags || !content.trim()}
                className="flex items-center gap-1 text-xs text-primary hover:bg-primary/10 px-2 py-1 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="AI ile etiket öner"
              >
                {suggestingTags ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                AI
              </button>
            </div>
            <input
              type="text"
              value={tags}
              onChange={e => { setTags(e.target.value); markDirty(); }}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
              placeholder="react, api, design..."
            />
            {tagList.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tagList.map(tag => (
                  <span key={tag} className="text-xs text-muted-foreground bg-white/5 border border-white/10 rounded px-1.5 py-0.5">#{tag}</span>
                ))}
              </div>
            )}
          </div>

          {/* Same-day journal entries */}
          {sameDayJournals.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <BookMarked className="w-3 h-3" /> Aynı Gün Günlük
              </label>
              <div className="space-y-2">
                {sameDayJournals.map(j => (
                  <button
                    key={j.id}
                    onClick={() => router.push('/dashboard/journal')}
                    className="w-full text-left p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
                  >
                    <p className="text-xs font-medium line-clamp-1 group-hover:text-primary transition-colors">{j.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{j.content}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Bilgiler</label>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>Oluşturulma: {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true, locale: tr })}</p>
              {note.updatedAt && <p>Güncelleme: {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true, locale: tr })}</p>}
              <p>{content.split(/\s+/).filter(Boolean).length} kelime</p>
              <p>{content.length} karakter</p>
              {dictTerms.length > 0 && <p className="text-primary/70">📖 {dictTerms.length} sözlük terimi otomatik bağlanıyor</p>}
            </div>
          </div>
        </aside>
      </div>

      {/* AI Drawer */}
      <AnimatePresence>
        {aiDrawer.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={() => setAiDrawer(s => ({ ...s, open: false }))}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30 }}
              onClick={e => e.stopPropagation()}
              className="absolute right-0 top-0 h-full w-full max-w-md glass border-l border-white/10 p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  {aiDrawer.title}
                </h3>
                <button
                  onClick={() => setAiDrawer(s => ({ ...s, open: false }))}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {aiDrawer.loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiDrawer.content}</ReactMarkdown>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
