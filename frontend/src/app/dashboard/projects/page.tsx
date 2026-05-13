"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Folder,
  ChevronDown,
  CheckCircle2,
  Loader2,
  X,
  Trash2,
  Clock,
  Circle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'sonner';

type TaskStatus = 'Todo' | 'InProgress' | 'Done';
type FilterChip = 'Tümü' | TaskStatus;

interface Task {
  id: string;
  title: string;
  status: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

const STATUS_CONFIG: Record<TaskStatus, { label: string; icon: React.ReactNode; cls: string }> = {
  Todo: { label: 'Bekliyor', icon: <Circle className="w-3 h-3" />, cls: 'text-muted-foreground border-white/20' },
  InProgress: { label: 'Devam Ediyor', icon: <Clock className="w-3 h-3 text-secondary" />, cls: 'text-secondary border-secondary/40' },
  Done: { label: 'Tamamlandı', icon: <CheckCircle2 className="w-3 h-3 text-accent" />, cls: 'text-accent border-accent/40' },
};

const FILTER_CHIPS: FilterChip[] = ['Tümü', 'Todo', 'InProgress', 'Done'];
const FILTER_LABELS: Record<FilterChip, string> = {
  'Tümü': 'Tümü',
  'Todo': 'Bekliyor',
  'InProgress': 'Devam',
  'Done': 'Tamamlandı',
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  const [projectTasks, setProjectTasks] = useState<Record<string, Task[]>>({});
  const [taskFilter, setTaskFilter] = useState<Record<string, FilterChip>>({});

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [activeProjectIdForTask, setActiveProjectIdForTask] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data);
    } catch {
      toast.error('Projeler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const fetchTasksForProject = async (projectId: string) => {
    try {
      const response = await api.get(`/tasks/project/${projectId}`);
      setProjectTasks(prev => ({ ...prev, [projectId]: response.data }));
    } catch {
      toast.error('Görevler yüklenemedi.');
    }
  };

  const toggleProject = (projectId: string) => {
    if (expandedProjectId === projectId) {
      setExpandedProjectId(null);
    } else {
      setExpandedProjectId(projectId);
      if (!projectTasks[projectId]) fetchTasksForProject(projectId);
    }
  };

  const toggleTaskStatus = async (projectId: string, taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Done' ? 'Todo' : 'Done';
    setProjectTasks(prev => ({
      ...prev,
      [projectId]: prev[projectId].map(t => t.id === taskId ? { ...t, status: newStatus } : t),
    }));
    try {
      await api.patch(`/tasks/${taskId}/toggle`);
    } catch {
      toast.error('Görev güncellenemedi.');
      fetchTasksForProject(projectId);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = newTaskTitle.trim();
    if (!title || !activeProjectIdForTask) return;
    setIsSubmittingTask(true);
    try {
      await api.post('/tasks', { title, description: '', projectId: activeProjectIdForTask });
      toast.success('Görev eklendi!');
      setIsTaskModalOpen(false);
      setNewTaskTitle('');
      await fetchTasksForProject(activeProjectIdForTask);
    } catch {
      toast.error('Görev eklenemedi.');
    } finally {
      setIsSubmittingTask(false);
    }
  };

  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toast('Bu projeyi ve tüm görevlerini silmek istediğinize emin misiniz?', {
      action: {
        label: 'Evet, Sil',
        onClick: async () => {
          try {
            await api.delete(`/projects/${projectId}`);
            setProjects(prev => prev.filter(p => p.id !== projectId));
            toast.success('Proje silindi.');
          } catch {
            toast.error('Proje silinemedi.');
          }
        },
      },
      cancel: { label: 'Vazgeç', onClick: () => {} },
    });
  };

  const openTaskModal = (projectId: string) => {
    setActiveProjectIdForTask(projectId);
    setIsTaskModalOpen(true);
  };

  const getFilter = (projectId: string): FilterChip => taskFilter[projectId] ?? 'Tümü';

  const getFilteredTasks = (projectId: string): Task[] => {
    const tasks = projectTasks[projectId] ?? [];
    const filter = getFilter(projectId);
    if (filter === 'Tümü') return tasks;
    return tasks.filter(t => t.status === filter);
  };

  const getTaskCounts = (projectId: string) => {
    const tasks = projectTasks[projectId] ?? [];
    return {
      total: tasks.length,
      done: tasks.filter(t => t.status === 'Done').length,
      pending: tasks.filter(t => t.status !== 'Done').length,
    };
  };

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
          <h1 className="text-3xl font-black tracking-tight">Projelerim</h1>
          <p className="text-muted-foreground">
            {projects.length} proje · Tüm projelerinizi ve görevlerinizi buradan yönetin.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {projects.length === 0 ? (
          <div className="text-center py-12 glass rounded-3xl border border-white/5">
            <Folder className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">Henüz bir proje oluşturmamışsınız.</p>
            <p className="text-sm text-muted-foreground mt-2">Genel Bakış sayfasından yeni bir proje oluşturabilirsiniz.</p>
          </div>
        ) : (
          projects.map((project) => {
            const counts = getTaskCounts(project.id);
            const isExpanded = expandedProjectId === project.id;

            return (
              <motion.div
                key={project.id}
                layout
                className="glass border border-white/5 rounded-2xl overflow-hidden transition-all hover:border-white/10"
              >
                <div
                  className="p-6 flex items-center justify-between cursor-pointer"
                  onClick={() => toggleProject(project.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <Folder className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{project.name}</h3>
                      <p className="text-sm text-muted-foreground">{project.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {isExpanded && counts.total > 0 && (
                      <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-lg font-medium hidden sm:inline-block">
                        {counts.done}/{counts.total}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground bg-white/5 px-3 py-1 rounded-full hidden sm:inline-block">
                      {format(new Date(project.createdAt), 'dd MMM yyyy', { locale: tr })}
                    </span>
                    <button
                      onClick={(e) => handleDeleteProject(project.id, e)}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                      title="Projeyi Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronDown className={cn(
                      "w-5 h-5 text-muted-foreground transition-transform duration-300",
                      isExpanded && "rotate-180"
                    )} />
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/5 bg-black/20"
                    >
                      <div className="p-6 space-y-4">
                        {/* Filter chips + add button */}
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex gap-1.5 flex-wrap">
                            {FILTER_CHIPS.map(chip => (
                              <button
                                key={chip}
                                onClick={() => setTaskFilter(prev => ({ ...prev, [project.id]: chip }))}
                                className={cn(
                                  "px-3 py-1 text-xs font-medium rounded-lg border transition-all",
                                  getFilter(project.id) === chip
                                    ? "bg-primary border-primary text-white"
                                    : "border-white/10 text-muted-foreground hover:border-white/30 hover:text-foreground"
                                )}
                              >
                                {FILTER_LABELS[chip]}
                                {chip !== 'Tümü' && projectTasks[project.id] && (
                                  <span className="ml-1 opacity-70">
                                    ({projectTasks[project.id].filter(t => t.status === chip).length})
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-primary hover:bg-primary/10"
                            onClick={() => openTaskModal(project.id)}
                          >
                            <Plus className="w-4 h-4 mr-1" /> Görev Ekle
                          </Button>
                        </div>

                        <div className="space-y-2">
                          {!projectTasks[project.id] ? (
                            <div className="flex justify-center py-4">
                              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                            </div>
                          ) : getFilteredTasks(project.id).length === 0 ? (
                            <p className="text-sm text-muted-foreground py-2">
                              {getFilter(project.id) === 'Tümü'
                                ? 'Bu projeye ait görev bulunmuyor.'
                                : `"${FILTER_LABELS[getFilter(project.id)]}" statüsünde görev yok.`}
                            </p>
                          ) : (
                            getFilteredTasks(project.id).map(task => {
                              const statusCfg = STATUS_CONFIG[task.status as TaskStatus] ?? STATUS_CONFIG.Todo;
                              return (
                                <div
                                  key={task.id}
                                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
                                  onClick={() => toggleTaskStatus(project.id, task.id, task.status)}
                                >
                                  <div className={cn(
                                    "w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0",
                                    task.status === 'Done' ? "bg-accent border-accent" : "border-white/20 group-hover:border-white/50"
                                  )}>
                                    {task.status === 'Done' && <CheckCircle2 className="w-3 h-3 text-white" />}
                                  </div>
                                  <span className={cn(
                                    "text-sm transition-all flex-1",
                                    task.status === 'Done' && "text-muted-foreground line-through"
                                  )}>
                                    {task.title}
                                  </span>
                                  <span className={cn(
                                    "hidden sm:flex items-center gap-1 text-xs border rounded-md px-2 py-0.5 shrink-0",
                                    statusCfg.cls
                                  )}>
                                    {statusCfg.icon}
                                    {statusCfg.label}
                                  </span>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Create Task Modal */}
      <AnimatePresence>
        {isTaskModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget) setIsTaskModalOpen(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass border border-white/10 rounded-3xl p-6 w-full max-w-md relative shadow-2xl"
            >
              <button
                onClick={() => setIsTaskModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-bold mb-6">Yeni Görev Ekle</h2>

              <form onSubmit={handleCreateTask} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Görev Adı <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={200}
                    value={newTaskTitle}
                    onChange={e => setNewTaskTitle(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors text-sm"
                    placeholder="Örn: Veritabanı modelini oluştur"
                    autoFocus
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmittingTask || !newTaskTitle.trim()}
                  className="w-full h-12 rounded-xl bg-primary hover:bg-primary-dark mt-4"
                >
                  {isSubmittingTask ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Ekle'}
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
