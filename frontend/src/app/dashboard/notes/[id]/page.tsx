"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SyntaxHighlighterProps } from 'react-syntax-highlighter';
import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/prism';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  ArrowLeft,
  Eye,
  Edit3,
  Save,
  Pin,
  Tag,
  Loader2,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
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

  // Auto-save with debounce
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
            {/* Title */}
            <input
              type="text"
              value={title}
              onChange={e => { setTitle(e.target.value); markDirty(); }}
              className="w-full text-4xl font-black bg-transparent outline-none border-none placeholder:text-muted-foreground/40 mb-6"
              placeholder="Başlık..."
            />

            {/* Tags row */}
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

            {/* Content */}
            {isPreview ? (
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      const isBlock = String(children).includes('\n');
                      return match || isBlock ? (
                        <SyntaxHighlighter
                          style={vscDarkPlus as Record<string, React.CSSProperties>}
                          language={match?.[1] ?? 'text'}
                          PreTag="div"
                          className="rounded-xl !text-sm"
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
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

        {/* Right sidebar: metadata */}
        <aside className="w-64 shrink-0 border-l border-white/5 p-5 space-y-6 hidden lg:block overflow-y-auto">
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
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Etiketler</label>
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

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Bilgiler</label>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>Oluşturulma: {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true, locale: tr })}</p>
              {note.updatedAt && <p>Güncelleme: {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true, locale: tr })}</p>}
              <p>{content.split(/\s+/).filter(Boolean).length} kelime</p>
              <p>{content.length} karakter</p>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Markdown İpuçları</label>
            <div className="space-y-1 text-xs text-muted-foreground font-mono">
              <p># Başlık 1</p>
              <p>## Başlık 2</p>
              <p>**kalın** *italik*</p>
              <p>```js kod```</p>
              <p>- [ ] görev</p>
              <p>| tablo | satır |</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
