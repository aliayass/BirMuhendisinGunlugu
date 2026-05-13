"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  CheckCircle2,
  Clock,
  TrendingUp,
  Plus,
  Loader2,
  X,
  BookOpen,
  ListTodo,
  NotebookPen,
  FolderPlus,
  BarChart3,
  Target,
  Zap,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { formatDistanceToNow, format } from 'date-fns';
import { tr } from 'date-fns/locale';
import Link from 'next/link';
import { toast } from 'sonner';
import { useSearch } from '@/context/SearchContext';

// ─── Types ───────────────────────────────────────────────────────────────────

interface DashboardData {
  totalNotes: number;
  completedTasks: number;
  activeProjects: number;
  blogReadCount: number;
  recentNotes: Array<{ id: string; title: string; createdAt: string }>;
  pendingTasks: Array<{ id: string; title: string; status: string }>;
  tasksPending: number;
  notesThisWeek: number;
  completionRate: number;
  tasksDoneToday: number;
}

interface ChartPoint { date: string; count: number }
interface ChartsData {
  notesByDay: ChartPoint[];
  tasksCreatedByDay: ChartPoint[];
  tasksCompletedByDay: ChartPoint[];
  days: number;
}

interface Project { id: string; name: string }

const MOODS = ['Harika', 'İyi', 'Nötr', 'Yorgun', 'Zor'];
const CHART_DAYS = [7, 14, 30] as const;

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [charts, setCharts] = useState<ChartsData | null>(null);
  const [chartDays, setChartDays] = useState<7 | 14 | 30>(7);
  const [chartsLoading, setChartsLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isProjectModalOpen, setProjectModalOpen] = useState(false);
  const [isNoteModalOpen, setNoteModalOpen] = useState(false);
  const [isTaskModalOpen, setTaskModalOpen] = useState(false);
  const [isJournalModalOpen, setJournalModalOpen] = useState(false);

  // Form state
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskProjectId, setNewTaskProjectId] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [journalTitle, setJournalTitle] = useState('');
  const [journalContent, setJournalContent] = useState('');
  const [journalMood, setJournalMood] = useState('Nötr');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { searchQuery } = useSearch();

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await api.get('/dashboard/summary');
      setData(response.data);
    } catch {
      toast.error('Dashboard verileri yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCharts = useCallback(async (days: number) => {
    setChartsLoading(true);
    try {
      const response = await api.get(`/dashboard/charts?days=${days}`);
      setCharts(response.data);
    } catch {
      toast.error('Grafik verileri yüklenemedi.');
    } finally {
      setChartsLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);
  useEffect(() => { fetchCharts(chartDays); }, [fetchCharts, chartDays]);

  const fetchProjects = async () => {
    setProjectsLoading(true);
    try {
      const response = await api.get('/projects');
      setProjects(response.data);
      if (response.data.length > 0) setNewTaskProjectId(response.data[0].id);
    } catch {
      toast.error('Projeler yüklenemedi.');
    } finally {
      setProjectsLoading(false);
    }
  };

  const openTaskModal = () => { setTaskModalOpen(true); fetchProjects(); };

  const toggleTask = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Done' ? 'Todo' : 'Done';
    if (data) {
      setData({
        ...data,
        pendingTasks: data.pendingTasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t),
        completedTasks: newStatus === 'Done' ? data.completedTasks + 1 : data.completedTasks - 1,
      });
    }
    try {
      await api.patch(`/tasks/${taskId}/toggle`);
    } catch {
      toast.error('Görev durumu güncellenemedi.');
      fetchDashboardData();
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newProjectName.trim();
    if (!name) return;
    setIsSubmitting(true);
    try {
      await api.post('/projects', { name, description: newProjectDesc.trim() });
      toast.success('Proje oluşturuldu!');
      setProjectModalOpen(false);
      setNewProjectName(''); setNewProjectDesc('');
      await fetchDashboardData();
    } catch { toast.error('Proje oluşturulamadı.'); }
    finally { setIsSubmitting(false); }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = newNoteTitle.trim();
    const content = newNoteContent.trim();
    if (!title || !content) return;
    setIsSubmitting(true);
    try {
      await api.post('/notes', { title, content, parentId: null });
      toast.success('Not kaydedildi!');
      setNoteModalOpen(false);
      setNewNoteTitle(''); setNewNoteContent('');
      await fetchDashboardData();
    } catch { toast.error('Not kaydedilemedi.'); }
    finally { setIsSubmitting(false); }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = newTaskTitle.trim();
    if (!title || !newTaskProjectId) return;
    setIsSubmitting(true);
    try {
      await api.post('/tasks', { title, projectId: newTaskProjectId, description: '' });
      toast.success('Görev eklendi!');
      setTaskModalOpen(false);
      setNewTaskTitle('');
      await fetchDashboardData();
    } catch { toast.error('Görev eklenemedi.'); }
    finally { setIsSubmitting(false); }
  };

  const handleCreateJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = journalTitle.trim();
    const content = journalContent.trim();
    if (!title || !content) return;
    setIsSubmitting(true);
    try {
      await api.post('/journals', { title, content, mood: journalMood });
      toast.success('Günlük yazısı kaydedildi!');
      setJournalModalOpen(false);
      setJournalTitle(''); setJournalContent(''); setJournalMood('Nötr');
    } catch { toast.error('Günlük kaydedilemedi.'); }
    finally { setIsSubmitting(false); }
  };

  // Merge chart data for recharts
  const chartData = charts?.notesByDay.map((point, i) => ({
    date: format(new Date(point.date), 'd MMM', { locale: tr }),
    'Not': point.count,
    'Görev Oluşturma': charts.tasksCreatedByDay[i]?.count ?? 0,
    'Görev Tamamlama': charts.tasksCompletedByDay[i]?.count ?? 0,
  })) ?? [];

  const q = searchQuery.toLowerCase();
  const filteredNotes = q ? data?.recentNotes.filter(n => n.title.toLowerCase().includes(q)) : data?.recentNotes;
  const filteredTasks = q ? data?.pendingTasks.filter(t => t.title.toLowerCase().includes(q)) : data?.pendingTasks;

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Hoş Geldin, Mühendis!</h1>
          <p className="text-muted-foreground">
            {searchQuery ? `"${searchQuery}" için arama sonuçları` : 'İşte bugünlük genel bakışın.'}
          </p>
        </div>
        <Button
          onClick={() => setProjectModalOpen(true)}
          className="h-12 px-6 rounded-xl bg-primary hover:bg-primary-dark gap-2 shadow-lg shadow-primary/20"
        >
          <FolderPlus className="w-5 h-5" /> Yeni Proje
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <QuickActionButton
          icon={<BookOpen className="w-5 h-5" />}
          label="Yeni Not"
          description="Teknik not ekle"
          color="from-primary/20 to-primary/5 border-primary/20 hover:border-primary/50"
          onClick={() => setNoteModalOpen(true)}
        />
        <QuickActionButton
          icon={<ListTodo className="w-5 h-5" />}
          label="Yeni Görev"
          description="Projeye görev ekle"
          color="from-secondary/20 to-secondary/5 border-secondary/20 hover:border-secondary/50"
          onClick={openTaskModal}
        />
        <QuickActionButton
          icon={<NotebookPen className="w-5 h-5" />}
          label="Günlük Yaz"
          description="Günü kaydet"
          color="from-accent/20 to-accent/5 border-accent/20 hover:border-accent/50"
          onClick={() => setJournalModalOpen(true)}
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<FileText className="text-primary" />} label="Toplam Not" value={data?.totalNotes ?? 0} sub={`Bu hafta: ${data?.notesThisWeek ?? 0}`} />
        <StatCard icon={<CheckCircle2 className="text-accent" />} label="Biten Görevler" value={data?.completedTasks ?? 0} sub={`Bugün: ${data?.tasksDoneToday ?? 0}`} />
        <StatCard icon={<Target className="text-secondary" />} label="Tamamlanma" value={`%${data?.completionRate ?? 0}`} sub={`${data?.tasksPending ?? 0} görev bekliyor`} />
        <StatCard icon={<Clock className="text-orange-500" />} label="Aktif Projeler" value={data?.activeProjects ?? 0} sub={`${data?.tasksPending ?? 0} açık görev`} />
      </div>

      {/* Chart */}
      <div className="glass p-6 rounded-3xl border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Aktivite Grafiği</h2>
          </div>
          <div className="flex gap-2">
            {CHART_DAYS.map(d => (
              <button
                key={d}
                onClick={() => setChartDays(d)}
                className={cn(
                  "px-3 py-1.5 text-xs font-bold rounded-lg transition-all",
                  chartDays === d
                    ? "bg-primary text-white"
                    : "bg-white/5 text-muted-foreground hover:bg-white/10"
                )}
              >
                {d}G
              </button>
            ))}
          </div>
        </div>
        {chartsLoading ? (
          <div className="h-48 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorNot" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorGorev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: 'rgba(10,10,20,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: '#fff', fontWeight: 700 }}
              />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
              <Area type="monotone" dataKey="Not" stroke="var(--color-primary)" fill="url(#colorNot)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="Görev Tamamlama" stroke="var(--color-accent)" fill="url(#colorGorev)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Notes */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Son Notların</h2>
            <Link href="/dashboard/notes" className="text-sm text-primary hover:underline">
              Tümünü gör
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredNotes && filteredNotes.length > 0 ? (
              filteredNotes.map((note) => (
                <RecentNoteCard
                  key={note.id}
                  title={note.title}
                  date={formatDistanceToNow(new Date(note.createdAt), { addSuffix: true, locale: tr })}
                  category="Genel"
                  searchQuery={q}
                />
              ))
            ) : (
              <p className="text-muted-foreground text-sm p-4">
                {q ? 'Aramayla eşleşen not bulunamadı.' : 'Henüz not eklemedin.'}
              </p>
            )}
          </div>
        </div>

        {/* Tasks Summary */}
        <div className="glass p-6 rounded-3xl border-white/5 h-fit space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Görevlerim</h2>
            <button
              onClick={openTaskModal}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-primary"
              title="Yeni görev ekle"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            {filteredTasks && filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  label={task.title}
                  done={task.status === 'Done'}
                  onClick={() => toggleTask(task.id, task.status)}
                  searchQuery={q}
                />
              ))
            ) : (
              <p className="text-muted-foreground text-sm">
                {q ? 'Aramayla eşleşen görev bulunamadı.' : 'Bekleyen görev bulunmuyor. Harika!'}
              </p>
            )}
          </div>
          <Link href="/dashboard/projects" className="block">
            <Button variant="outline" className="w-full rounded-xl border-white/10 glass">
              Tüm Görevleri Gör
            </Button>
          </Link>
        </div>
      </div>

      {/* Modals */}
      <Modal isOpen={isProjectModalOpen} onClose={() => setProjectModalOpen(false)} title="Yeni Proje Oluştur">
        <form onSubmit={handleCreateProject} className="space-y-4">
          <Field label="Proje Adı" required>
            <input type="text" required maxLength={100} value={newProjectName} onChange={e => setNewProjectName(e.target.value)} className={inputCls} placeholder="Örn: Portfolyo V2" />
          </Field>
          <Field label="Açıklama">
            <textarea value={newProjectDesc} onChange={e => setNewProjectDesc(e.target.value)} className={`${inputCls} min-h-[100px] resize-none`} placeholder="Proje detayları..." maxLength={500} />
          </Field>
          <SubmitButton loading={isSubmitting} disabled={!newProjectName.trim()} label="Oluştur" />
        </form>
      </Modal>

      <Modal isOpen={isNoteModalOpen} onClose={() => setNoteModalOpen(false)} title="Yeni Not Ekle">
        <form onSubmit={handleCreateNote} className="space-y-4">
          <Field label="Başlık" required>
            <input type="text" required maxLength={200} value={newNoteTitle} onChange={e => setNewNoteTitle(e.target.value)} className={inputCls} placeholder="Not başlığı..." />
          </Field>
          <Field label="İçerik" required>
            <textarea required value={newNoteContent} onChange={e => setNewNoteContent(e.target.value)} className={`${inputCls} min-h-[140px] resize-none`} placeholder="Notunuzu buraya yazın..." />
          </Field>
          <SubmitButton loading={isSubmitting} disabled={!newNoteTitle.trim() || !newNoteContent.trim()} label="Kaydet" />
        </form>
      </Modal>

      <Modal isOpen={isTaskModalOpen} onClose={() => setTaskModalOpen(false)} title="Yeni Görev Ekle">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Field label="Görev Başlığı" required>
            <input type="text" required maxLength={200} value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} className={inputCls} placeholder="Görev başlığı..." />
          </Field>
          <Field label="Proje" required>
            {projectsLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground text-sm py-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Projeler yükleniyor...
              </div>
            ) : projects.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                Henüz proje yok.{' '}
                <button type="button" className="text-primary hover:underline" onClick={() => { setTaskModalOpen(false); setProjectModalOpen(true); }}>
                  Önce proje oluştur.
                </button>
              </p>
            ) : (
              <select value={newTaskProjectId} onChange={e => setNewTaskProjectId(e.target.value)} className={`${inputCls} cursor-pointer`}>
                {projects.map(p => <option key={p.id} value={p.id} className="bg-background">{p.name}</option>)}
              </select>
            )}
          </Field>
          <SubmitButton loading={isSubmitting} disabled={!newTaskTitle.trim() || !newTaskProjectId || projects.length === 0} label="Ekle" />
        </form>
      </Modal>

      <Modal isOpen={isJournalModalOpen} onClose={() => setJournalModalOpen(false)} title="Günlük Yaz">
        <form onSubmit={handleCreateJournal} className="space-y-4">
          <Field label="Başlık" required>
            <input type="text" required maxLength={200} value={journalTitle} onChange={e => setJournalTitle(e.target.value)} className={inputCls} placeholder="Bugün nasıldı?" />
          </Field>
          <Field label="Ruh Hali">
            <div className="flex flex-wrap gap-2">
              {MOODS.map(mood => (
                <button key={mood} type="button" onClick={() => setJournalMood(mood)}
                  className={cn("px-3 py-1.5 rounded-lg text-sm font-medium border transition-all",
                    journalMood === mood ? "bg-primary border-primary text-white" : "border-white/10 hover:border-white/30 text-muted-foreground hover:text-foreground"
                  )}>
                  {mood}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Günlük" required>
            <textarea required value={journalContent} onChange={e => setJournalContent(e.target.value)} className={`${inputCls} min-h-[160px] resize-none`} placeholder="Bugün ne yaptın? Neler öğrendin? Yarın ne yapacaksın?" />
          </Field>
          <SubmitButton loading={isSubmitting} disabled={!journalTitle.trim() || !journalContent.trim()} label="Kaydet" />
        </form>
      </Modal>
    </div>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputCls = "w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors text-sm";

// ─── Sub-components ──────────────────────────────────────────────────────────

function QuickActionButton({ icon, label, description, color, onClick }: {
  icon: React.ReactNode; label: string; description: string; color: string; onClick: () => void;
}) {
  return (
    <motion.button whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }} onClick={onClick}
      className={cn("flex items-center gap-4 p-5 rounded-2xl border bg-gradient-to-br transition-all text-left w-full", color)}>
      <div className="p-2.5 bg-white/10 rounded-xl">{icon}</div>
      <div>
        <p className="font-bold text-sm">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </motion.button>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: number | string; sub: string }) {
  return (
    <motion.div whileHover={{ y: -4 }} className="glass p-5 rounded-3xl border-white/5 space-y-3">
      <div className="p-2.5 bg-white/5 rounded-2xl w-fit">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <h3 className="text-2xl font-black">{value}</h3>
        <p className="text-xs text-muted-foreground mt-1">{sub}</p>
      </div>
    </motion.div>
  );
}

function highlight(text: string, query: string) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query);
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-primary/30 text-foreground rounded px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

function RecentNoteCard({ title, date, category, searchQuery }: { title: string; date: string; category: string; searchQuery: string }) {
  return (
    <div className="p-5 rounded-2xl glass border-white/5 hover:border-primary/20 transition-all cursor-pointer group">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-primary px-2 py-1 bg-primary/10 rounded-md">{category}</span>
        <span className="text-xs text-muted-foreground">{date}</span>
      </div>
      <h4 className="font-bold group-hover:text-primary transition-colors">{highlight(title, searchQuery)}</h4>
    </div>
  );
}

function TaskItem({ label, done, onClick, searchQuery }: { label: string; done: boolean; onClick?: () => void; searchQuery: string }) {
  return (
    <div className="flex items-center gap-3 cursor-pointer group" onClick={onClick}>
      <div className={cn("w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0",
        done ? "bg-accent border-accent" : "border-white/20 group-hover:border-white/50")}>
        {done && <CheckCircle2 className="w-3 h-3 text-white" />}
      </div>
      <span className={cn("text-sm transition-all", done && "text-muted-foreground line-through")}>
        {highlight(label, searchQuery)}
      </span>
    </div>
  );
}

function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            className="glass border border-white/10 rounded-3xl p-6 w-full max-w-md relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold mb-6">{title}</h2>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">
        {label}{required && <span className="text-primary ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

function SubmitButton({ loading, disabled, label }: { loading: boolean; disabled: boolean; label: string }) {
  return (
    <Button type="submit" disabled={loading || disabled} className="w-full h-12 rounded-xl bg-primary hover:bg-primary-dark mt-4">
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : label}
    </Button>
  );
}
