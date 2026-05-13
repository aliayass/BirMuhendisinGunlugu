"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookMarked,
  Plus,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
} from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'sonner';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: string;
  createdAt: string;
}

const MOODS = [
  { key: 'harika', emoji: '🚀', label: 'Harika' },
  { key: 'iyi', emoji: '😊', label: 'İyi' },
  { key: 'normal', emoji: '😐', label: 'Normal' },
  { key: 'kötü', emoji: '😞', label: 'Kötü' },
  { key: 'stresli', emoji: '😤', label: 'Stresli' },
];

function getMoodEmoji(mood: string): string {
  return MOODS.find(m => m.key === mood)?.emoji ?? '📝';
}

function getMoodLabel(mood: string): string {
  return MOODS.find(m => m.key === mood)?.label ?? mood;
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newMood, setNewMood] = useState('iyi');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchEntries = useCallback(async () => {
    try {
      const res = await api.get('/journals');
      setEntries(res.data);
    } catch {
      toast.error('Günlük girişleri yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = newTitle.trim();
    const content = newContent.trim();
    if (!title || !content) return;
    setIsSubmitting(true);
    try {
      const res = await api.post('/journals', { title, content, mood: newMood });
      setEntries(prev => [res.data, ...prev]);
      toast.success('Günlük girişi kaydedildi!');
      setIsModalOpen(false);
      setNewTitle(''); setNewContent(''); setNewMood('iyi');
    } catch {
      toast.error('Günlük kaydedilemedi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calendar
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDow = monthStart.getDay(); // 0=Sun
  const calendarPad = (startDow + 6) % 7; // Monday-first grid

  const hasEntry = (date: Date) => entries.some(e => isSameDay(parseISO(e.createdAt), date));
  const entriesForDate = (date: Date) => entries.filter(e => isSameDay(parseISO(e.createdAt), date));

  // Timeline: group by date, filtered by selectedDate or show last 30 days
  const timelineEntries = selectedDate
    ? entriesForDate(selectedDate)
    : entries;

  const groupedByDate = timelineEntries.reduce<Record<string, JournalEntry[]>>((acc, entry) => {
    const key = format(parseISO(entry.createdAt), 'yyyy-MM-dd');
    if (!acc[key]) acc[key] = [];
    acc[key].push(entry);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

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
          <h1 className="text-3xl font-black tracking-tight">Mühendis Günlüğü</h1>
          <p className="text-muted-foreground">
            {entries.length} giriş
            {selectedDate && <span className="ml-2 text-primary">· {format(selectedDate, 'd MMMM yyyy', { locale: tr })} seçili</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedDate && (
            <Button variant="ghost" onClick={() => setSelectedDate(null)} className="h-10 px-4 rounded-xl gap-2 text-muted-foreground">
              <X className="w-4 h-4" /> Filtreyi kaldır
            </Button>
          )}
          <Button
            onClick={() => setIsModalOpen(true)}
            className="h-12 px-6 rounded-xl bg-primary hover:bg-primary-dark gap-2 shadow-lg shadow-primary/20"
          >
            <Plus className="w-5 h-5" /> Yeni Giriş
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar */}
        <div className="lg:col-span-1">
          <div className="glass border border-white/5 rounded-2xl p-5 sticky top-4">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentMonth(m => subMonths(m, 1))}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h3 className="font-bold text-sm">
                {format(currentMonth, 'MMMM yyyy', { locale: tr })}
              </h3>
              <button
                onClick={() => setCurrentMonth(m => addMonths(m, 1))}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Day names */}
            <div className="grid grid-cols-7 mb-2">
              {['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'].map(d => (
                <div key={d} className="text-center text-xs text-muted-foreground font-medium py-1">{d}</div>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-y-1">
              {Array.from({ length: calendarPad }).map((_, i) => <div key={`pad-${i}`} />)}
              {daysInMonth.map(day => {
                const active = hasEntry(day);
                const selected = selectedDate && isSameDay(day, selectedDate);
                const today = isToday(day);
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(selected ? null : day)}
                    className={cn(
                      "w-8 h-8 mx-auto flex items-center justify-center rounded-lg text-sm transition-all relative",
                      selected && "bg-primary text-white",
                      !selected && today && "border border-primary text-primary",
                      !selected && !today && active && "bg-primary/10 text-primary",
                      !selected && !today && !active && "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                    )}
                  >
                    {format(day, 'd')}
                    {active && !selected && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Mood summary */}
            {entries.length > 0 && (
              <div className="mt-5 pt-5 border-t border-white/5">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-3">Ruh Hali Özeti</p>
                <div className="space-y-2">
                  {MOODS.map(mood => {
                    const count = entries.filter(e => e.mood === mood.key).length;
                    if (!count) return null;
                    return (
                      <div key={mood.key} className="flex items-center gap-2 text-sm">
                        <span>{mood.emoji}</span>
                        <span className="text-muted-foreground flex-1">{mood.label}</span>
                        <span className="text-xs font-medium">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {sortedDates.length === 0 ? (
            <div className="text-center py-16 glass rounded-3xl border border-white/5">
              <BookMarked className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">
                {selectedDate ? 'Bu tarihte giriş bulunamadı.' : 'Henüz günlük girişi yok.'}
              </p>
            </div>
          ) : (
            sortedDates.map(dateKey => (
              <motion.div
                key={dateKey}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-primary">
                    <Calendar className="w-4 h-4" />
                    {format(parseISO(dateKey), 'd MMMM yyyy, EEEE', { locale: tr })}
                  </div>
                  <div className="flex-1 h-px bg-white/5" />
                </div>

                {groupedByDate[dateKey].map(entry => (
                  <div key={entry.id} className="glass border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl" title={getMoodLabel(entry.mood)}>
                          {getMoodEmoji(entry.mood)}
                        </span>
                        <div>
                          <h3 className="font-bold leading-tight">{entry.title}</h3>
                          <span className="text-xs text-muted-foreground">{getMoodLabel(entry.mood)}</span>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {format(parseISO(entry.createdAt), 'HH:mm')}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{entry.content}</p>
                  </div>
                ))}
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Create Entry Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget) setIsModalOpen(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass border border-white/10 rounded-3xl p-6 w-full max-w-lg relative shadow-2xl"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-bold mb-1">Günlük Girişi</h2>
              <p className="text-sm text-muted-foreground mb-6">
                {format(new Date(), 'd MMMM yyyy, EEEE', { locale: tr })}
              </p>

              <form onSubmit={handleCreate} className="space-y-5">
                {/* Mood selection */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">Bugün nasılsın?</label>
                  <div className="flex gap-2 flex-wrap">
                    {MOODS.map(mood => (
                      <button
                        key={mood.key}
                        type="button"
                        onClick={() => setNewMood(mood.key)}
                        className={cn(
                          "flex flex-col items-center gap-1 p-3 rounded-xl border text-xs transition-all",
                          newMood === mood.key
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-white/10 text-muted-foreground hover:border-white/30"
                        )}
                      >
                        <span className="text-xl">{mood.emoji}</span>
                        <span>{mood.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors font-medium"
                    placeholder="Bugün ne öğrendim..."
                  />
                </div>

                <div>
                  <textarea
                    required
                    rows={6}
                    value={newContent}
                    onChange={e => setNewContent(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors resize-none text-sm leading-relaxed"
                    placeholder="Bugün neler yaptım, ne öğrendim, neler düşündüm..."
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || !newTitle.trim() || !newContent.trim()}
                  className="w-full h-12 rounded-xl bg-primary hover:bg-primary-dark"
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
