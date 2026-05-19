"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { JSONContent } from '@tiptap/react';
import { toast } from 'sonner';
import { Loader2, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { EditorCanvas, type EditorCanvasSaveData } from '@/components/editor/EditorCanvas';
import api from '@/lib/api';

interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string | null;
}

/** Backend'den gelen string content'i TipTap JSON'a çevirir (legacy markdown desteği ile). */
function parseContent(raw: string): JSONContent | null {
  if (!raw?.trim()) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.type === 'doc') return parsed as JSONContent;
  } catch { /* JSON değil — legacy plain/markdown */ }
  return {
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text: raw }] }],
  };
}

export default function NoteEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  const dirty = useRef<EditorCanvasSaveData | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Notu yükle
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get('/notes');
        const found = (res.data as Note[]).find(n => n.id === id);
        if (!found) {
          toast.error('Not bulunamadı.');
          router.push('/dashboard/notes');
          return;
        }
        if (!cancelled) {
          setNote(found);
          setIsPinned(found.isPinned);
        }
      } catch {
        if (!cancelled) {
          toast.error('Not yüklenemedi.');
          router.push('/dashboard/notes');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, router]);

  // Auto-save için debounce timer'ı temizle
  useEffect(() => () => { if (saveTimer.current) clearTimeout(saveTimer.current); }, []);

  const save = useCallback(async (silent: boolean) => {
    if (!id || !dirty.current) return;
    const data = dirty.current;
    setIsSaving(true);
    try {
      await api.put(`/notes/${id}`, {
        id,
        title: data.title,
        content: JSON.stringify(data.content),
        category: data.category,
        tags: data.tags,
      });
      setSavedAt(new Date());
      dirty.current = null;
      if (!silent) toast.success('Not kaydedildi.');
    } catch {
      if (!silent) toast.error('Kaydedilemedi.');
    } finally {
      setIsSaving(false);
    }
  }, [id]);

  const handleChange = useCallback((data: EditorCanvasSaveData) => {
    dirty.current = data;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => save(true), 2000);
  }, [save]);

  const handleManualSave = (data: EditorCanvasSaveData) => {
    dirty.current = data;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    return save(false);
  };

  const handleTogglePin = async () => {
    if (!id) return;
    try {
      const res = await api.patch(`/notes/${id}/pin`);
      setIsPinned(res.data.isPinned);
      toast.success(res.data.isPinned ? 'Sabitlendi.' : 'Sabitleme kaldırıldı.');
    } catch {
      toast.error('Güncellenemedi.');
    }
  };

  const handleSuggestTags = async (text: string): Promise<string> => {
    try {
      const res = await api.post('/ai/suggest-tags', { content: text });
      return res.data.result ?? '';
    } catch {
      toast.error('AI etiketleri alınamadı.');
      return '';
    }
  };

  if (loading || !note) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const statusSlot = isSaving ? (
    <span className="flex items-center gap-1.5">
      <Loader2 className="w-3 h-3 animate-spin" /> Kaydediliyor...
    </span>
  ) : savedAt ? (
    <span className="flex items-center gap-1.5 text-accent">
      <Check className="w-3 h-3" />
      {formatDistanceToNow(savedAt, { addSuffix: true, locale: tr })} kaydedildi
    </span>
  ) : null;

  return (
    <EditorCanvas
      noteId={id}
      initialTitle={note.title}
      initialContent={parseContent(note.content)}
      initialCategory={note.category || 'Genel'}
      initialTags={note.tags || ''}
      createdAt={note.createdAt}
      updatedAt={note.updatedAt}
      isPinned={isPinned}
      isSaving={isSaving}
      statusSlot={statusSlot}
      onSave={handleManualSave}
      onCancel={() => router.push('/dashboard/notes')}
      onChange={handleChange}
      onTogglePin={handleTogglePin}
      onSuggestTags={handleSuggestTags}
    />
  );
}
