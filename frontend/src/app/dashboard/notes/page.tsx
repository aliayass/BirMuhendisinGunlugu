"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Plus, 
  Loader2, 
  X,
  Trash2,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'sonner';
import { useSearch } from '@/context/SearchContext';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { searchQuery } = useSearch();

  const fetchNotes = async () => {
    try {
      const response = await api.get('/notes');
      setNotes(response.data);
    } catch {
      toast.error('Notlar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotes(); }, []);

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = newNoteTitle.trim();
    const content = newNoteContent.trim();
    if (!title || !content) return;

    setIsSubmitting(true);
    try {
      await api.post('/notes', { title, content, parentId: null });
      toast.success('Not kaydedildi!');
      setIsNoteModalOpen(false);
      setNewNoteTitle('');
      setNewNoteContent('');
      await fetchNotes();
    } catch {
      toast.error('Not kaydedilemedi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
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

  const q = searchQuery.toLowerCase();
  const filteredNotes = q ? notes.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)) : notes;

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Teknik Notlar</h1>
          <p className="text-muted-foreground">
            {searchQuery ? `"${searchQuery}" için ${filteredNotes.length} sonuç` : `${notes.length} not`}
          </p>
        </div>
        <Button 
          onClick={() => setIsNoteModalOpen(true)}
          className="h-12 px-6 rounded-xl bg-primary hover:bg-primary-dark gap-2 shadow-lg shadow-primary/20"
        >
          <Plus className="w-5 h-5" /> Yeni Not Ekle
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.length === 0 ? (
          <div className="col-span-full text-center py-12 glass rounded-3xl border border-white/5">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              {searchQuery ? 'Aramayla eşleşen not bulunamadı.' : 'Henüz hiç not eklemediniz.'}
            </p>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <motion.div 
              key={note.id}
              layout
              className="glass border border-white/5 rounded-2xl p-6 transition-all hover:border-white/10 group flex flex-col h-[250px]"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold line-clamp-2 pr-4">{note.title}</h3>
                <button 
                  onClick={() => handleDeleteNote(note.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-destructive hover:bg-destructive/10 rounded-full transition-all shrink-0"
                  title="Notu Sil"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex-1 overflow-hidden relative">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{note.content}</p>
                {/* Fade out effect for long text */}
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#0a0a0a] to-transparent opacity-80" />
              </div>

              <div className="pt-4 mt-auto flex items-center text-xs text-muted-foreground gap-2">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true, locale: tr })}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Create Note Modal */}
      <AnimatePresence>
        {isNoteModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass border border-white/10 rounded-3xl p-6 w-full max-w-2xl relative shadow-2xl flex flex-col h-[80vh] max-h-[600px]"
            >
              <button 
                onClick={() => setIsNoteModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h2 className="text-2xl font-bold mb-6">Yeni Not Ekle</h2>
              
              <form onSubmit={handleCreateNote} className="flex flex-col flex-1 overflow-hidden space-y-4">
                <div className="space-y-2 shrink-0">
                  <input 
                    type="text" 
                    required
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors text-lg font-medium"
                    placeholder="Not Başlığı..."
                  />
                </div>

                <div className="space-y-2 flex-1 flex flex-col">
                  <textarea 
                    required
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    className="w-full flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors resize-none"
                    placeholder="Not içeriğini buraya yazın... (Markdown desteği yakında eklenecek)"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting || !newNoteTitle.trim() || !newNoteContent.trim()}
                  className="w-full h-12 rounded-xl bg-primary hover:bg-primary-dark mt-4 shrink-0"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Kaydet'}
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
