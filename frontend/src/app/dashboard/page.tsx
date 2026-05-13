"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  Plus,
  Loader2,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import Link from 'next/link';

interface DashboardData {
  totalNotes: number;
  completedTasks: number;
  activeProjects: number;
  blogReadCount: number;
  recentNotes: Array<{
    id: string;
    title: string;
    createdAt: string;
  }>;
  pendingTasks: Array<{
    id: string;
    title: string;
    status: string;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/summary');
      setData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const toggleTask = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Done' ? 'Todo' : 'Done';
    
    // Optimistic Update
    const updatedTasks = data?.pendingTasks.map(t => 
      t.id === taskId ? { ...t, status: newStatus } : t
    );
    if (data && updatedTasks) {
      setData({ ...data, pendingTasks: updatedTasks, completedTasks: newStatus === 'Done' ? data.completedTasks + 1 : data.completedTasks - 1 });
    }
    
    try {
      await api.patch(`/tasks/${taskId}/toggle`);
    } catch (e) {
      console.error(e);
      // Revert if failed
      fetchDashboardData();
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName) return;
    
    setIsSubmitting(true);
    try {
      await api.post('/projects', { name: newProjectName, description: newProjectDesc });
      setIsProjectModalOpen(false);
      setNewProjectName('');
      setNewProjectDesc('');
      await fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Hoş Geldin, Mühendis!</h1>
          <p className="text-muted-foreground">İşte bugünlük genel bakışın.</p>
        </div>
        <Button 
          onClick={() => setIsProjectModalOpen(true)}
          className="h-12 px-6 rounded-xl bg-primary hover:bg-primary-dark gap-2 shadow-lg shadow-primary/20"
        >
          <Plus className="w-5 h-5" /> Yeni Proje
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<FileText className="text-primary" />} label="Toplam Not" value={data?.totalNotes || 0} trend="+0" />
        <StatCard icon={<CheckCircle2 className="text-accent" />} label="Biten Görevler" value={data?.completedTasks || 0} trend="+0" />
        <StatCard icon={<Clock className="text-secondary" />} label="Aktif Projeler" value={data?.activeProjects || 0} trend="0" />
        <StatCard icon={<TrendingUp className="text-orange-500" />} label="Blog Okunma" value={data?.blogReadCount || 0} trend="0" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold">Son Notların</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data?.recentNotes && data.recentNotes.length > 0 ? (
              data.recentNotes.map((note) => (
                <RecentNoteCard 
                  key={note.id} 
                  title={note.title} 
                  date={formatDistanceToNow(new Date(note.createdAt), { addSuffix: true, locale: tr })} 
                  category="Genel" 
                />
              ))
            ) : (
              <p className="text-muted-foreground text-sm p-4">Henüz not eklemedin.</p>
            )}
          </div>
        </div>

        {/* Tasks Summary */}
        <div className="glass p-6 rounded-3xl border-white/5 h-fit space-y-6">
          <h2 className="text-xl font-bold">Görevlerim</h2>
          <div className="space-y-4">
            {data?.pendingTasks && data.pendingTasks.length > 0 ? (
              data.pendingTasks.map((task) => (
                <TaskItem 
                  key={task.id} 
                  label={task.title} 
                  done={task.status === 'Done'} 
                  onClick={() => toggleTask(task.id, task.status)}
                />
              ))
            ) : (
              <p className="text-muted-foreground text-sm">Bekleyen görev bulunmuyor. Harika!</p>
            )}
          </div>
          <Link href="/dashboard/projects" className="block">
            <Button variant="outline" className="w-full rounded-xl border-white/10 glass">
              Tüm Görevleri Gör
            </Button>
          </Link>
        </div>
      </div>

      {/* Create Project Modal */}
      <AnimatePresence>
        {isProjectModalOpen && (
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
              className="glass border border-white/10 rounded-3xl p-6 w-full max-w-md relative shadow-2xl"
            >
              <button 
                onClick={() => setIsProjectModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h2 className="text-2xl font-bold mb-6">Yeni Proje Oluştur</h2>
              
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Proje Adı</label>
                  <input 
                    type="text" 
                    required
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors"
                    placeholder="Örn: Portfolyo V2"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Açıklama</label>
                  <textarea 
                    value={newProjectDesc}
                    onChange={(e) => setNewProjectDesc(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors min-h-[100px] resize-none"
                    placeholder="Proje detayları..."
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting || !newProjectName}
                  className="w-full h-12 rounded-xl bg-primary hover:bg-primary-dark mt-4"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Oluştur'}
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ icon, label, value, trend }: any) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="glass p-6 rounded-3xl border-white/5 space-y-4"
    >
      <div className="p-3 bg-white/5 rounded-2xl w-fit">{icon}</div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="flex items-end justify-between">
          <h3 className="text-3xl font-black">{value}</h3>
          <span className="text-xs font-bold text-accent px-2 py-1 bg-accent/10 rounded-lg">{trend}</span>
        </div>
      </div>
    </motion.div>
  );
}

function RecentNoteCard({ title, date, category }: any) {
  return (
    <div className="p-5 rounded-2xl glass border-white/5 hover:border-primary/20 transition-all cursor-pointer group">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-primary px-2 py-1 bg-primary/10 rounded-md">
          {category}
        </span>
        <span className="text-xs text-muted-foreground">{date}</span>
      </div>
      <h4 className="font-bold group-hover:text-primary transition-colors">{title}</h4>
    </div>
  );
}

function TaskItem({ label, done, onClick }: { label: string, done: boolean, onClick?: () => void }) {
  return (
    <div className="flex items-center gap-3 cursor-pointer group" onClick={onClick}>
      <div className={cn(
        "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
        done ? "bg-accent border-accent" : "border-white/20 group-hover:border-white/50"
      )}>
        {done && <CheckCircle2 className="w-3 h-3 text-white" />}
      </div>
      <span className={cn("text-sm transition-all", done && "text-muted-foreground line-through")}>{label}</span>
    </div>
  );
}
