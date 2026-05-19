"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Plus,
  Loader2,
  Trash2,
  Clock,
  Pin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'sonner';
import { useSearch } from '@/context/SearchContext';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string | null;
  isPinned: boolean;
  tags: string;
  category: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { searchQuery } = useSearch();
  const router = useRouter();

  const fetchNotes = useCallback(async () => {
    try {
      const res = await api.get('/notes');
      setNotes(res.data);
    } catch {
      toast.error('Notlar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const handleTogglePin = async (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await api.patch(`/notes/${noteId}/pin`);
      setNotes(prev => prev.map(n => n.id === noteId ? { ...n, isPinned: res.data.isPinned } : n));
    } catch {
      toast.error('Not güncellenemedi.');
    }
  };

  const handleDelete = async (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toast('Bu notu silmek istediğinize emin misiniz?', {
      action: {
        label: 'Evet, Sil',
        onClick: async () => {
          try {
            await api.delete(`/notes/${noteId}`);
            setNotes(prev => prev.filter(n => n.id !== noteId));
            toast.success('Not silindi.');
          } catch {
            toast.error('Not silinemedi.');
          }
        },
      },
      cancel: { label: 'Vazgeç', onClick: () => {} },
    });
  };

  const allCategories = Array.from(new Set(notes.map(n => n.category).filter(Boolean)));
  const q = searchQuery.toLowerCase();

  let filtered = notes;
  if (q) filtered = filtered.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.tags.toLowerCase().includes(q));
  if (activeCategory) filtered = filtered.filter(n => n.category === activeCategory);

  const pinned = filtered.filter(n => n.isPinned);
  const unpinned = filtered.filter(n => !n.isPinned);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Teknik Notlar</h1>
          <p className="text-muted-foreground">
            {searchQuery ? `"${searchQuery}" için ${filtered.length} sonuç` : `${notes.length} not · ${pinned.length} sabitlenmiş`}
          </p>
        </div>
        <Button
          onClick={() => router.push('/dashboard/notes/new')}
          className="h-12 px-6 rounded-xl bg-primary hover:bg-primary-dark gap-2 shadow-lg shadow-primary/20"
        >
          <Plus className="w-5 h-5" /> Yeni Not
        </Button>
      </div>

      {/* Category Filter */}
      {allCategories.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveCategory(null)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-lg border transition-all",
              !activeCategory
                ? "bg-primary border-primary text-white"
                : "border-white/10 text-muted-foreground hover:border-white/30 hover:text-foreground"
            )}
          >
            Tümü ({notes.length})
          </button>
          {allCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-lg border transition-all",
                activeCategory === cat
                  ? "bg-primary border-primary text-white"
                  : "border-white/10 text-muted-foreground hover:border-white/30 hover:text-foreground"
              )}
            >
              {cat} ({notes.filter(n => n.category === cat).length})
            </button>
          ))}
        </div>
      )}

      {/* Pinned section */}
      {pinned.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Pin className="w-4 h-4" /> Sabitlenmiş
          </h2>
          <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
            {pinned.map(note => (
              <NoteCard key={note.id} note={note} onPin={handleTogglePin} onDelete={handleDelete} onClick={() => router.push(`/dashboard/notes/${note.id}`)} />
            ))}
          </div>
        </div>
      )}

      {/* All notes */}
      {unpinned.length > 0 && (
        <div>
          {pinned.length > 0 && (
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Diğer Notlar</h2>
          )}
          <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
            {unpinned.map(note => (
              <NoteCard key={note.id} note={note} onPin={handleTogglePin} onDelete={handleDelete} onClick={() => router.push(`/dashboard/notes/${note.id}`)} />
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-16 glass rounded-3xl border border-white/5">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">
            {searchQuery || activeCategory ? 'Eşleşen not bulunamadı.' : 'Henüz hiç not eklemediniz.'}
          </p>
        </div>
      )}

    </div>
  );
}

function NoteCard({
  note,
  onPin,
  onDelete,
  onClick,
}: {
  note: Note;
  onPin: (id: string, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onClick: () => void;
}) {
  const tags = note.tags ? note.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
  const dateToShow = note.updatedAt ?? note.createdAt;

  return (
    <motion.div
      layout
      onClick={onClick}
      className="break-inside-avoid glass border border-white/5 rounded-2xl p-5 transition-all hover:border-white/15 hover:shadow-lg cursor-pointer group mb-4"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="font-bold text-base leading-tight line-clamp-2 flex-1">{note.title}</h3>
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={e => onPin(note.id, e)}
            className={cn("p-1.5 rounded-lg transition-colors", note.isPinned ? "text-primary" : "text-muted-foreground hover:text-primary hover:bg-primary/10")}
            title={note.isPinned ? 'Sabitlemeyi kaldır' : 'Sabitle'}
          >
            <Pin className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={e => onDelete(note.id, e)}
            className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground line-clamp-4 leading-relaxed mb-3">{note.content}</p>

      <div className="flex items-center gap-2 flex-wrap">
        {note.category && (
          <span className="text-xs bg-primary/10 text-primary border border-primary/20 rounded-md px-2 py-0.5">
            {note.category}
          </span>
        )}
        {tags.slice(0, 3).map(tag => (
          <span key={tag} className="text-xs text-muted-foreground bg-white/5 border border-white/10 rounded-md px-2 py-0.5">
            #{tag}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-3 pt-3 border-t border-white/5">
        <Clock className="w-3 h-3" />
        {formatDistanceToNow(new Date(dateToShow), { addSuffix: true, locale: tr })}
      </div>
    </motion.div>
  );
}
