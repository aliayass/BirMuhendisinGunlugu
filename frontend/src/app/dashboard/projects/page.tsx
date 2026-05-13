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
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

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

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  const [projectTasks, setProjectTasks] = useState<Record<string, Task[]>>({});
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [activeProjectIdForTask, setActiveProjectIdForTask] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Projeler getirilirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchTasksForProject = async (projectId: string) => {
    try {
      const response = await api.get(`/tasks/project/${projectId}`);
      setProjectTasks(prev => ({ ...prev, [projectId]: response.data }));
    } catch (error) {
      console.error('Görevler getirilirken hata:', error);
    }
  };

  const toggleProject = (projectId: string) => {
    if (expandedProjectId === projectId) {
      setExpandedProjectId(null);
    } else {
      setExpandedProjectId(projectId);
      if (!projectTasks[projectId]) {
        fetchTasksForProject(projectId);
      }
    }
  };

  const toggleTaskStatus = async (projectId: string, taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Done' ? 'Todo' : 'Done';
    
    // Optimistic Update
    setProjectTasks(prev => ({
      ...prev,
      [projectId]: prev[projectId].map(t => 
        t.id === taskId ? { ...t, status: newStatus } : t
      )
    }));

    try {
      await api.patch(`/tasks/${taskId}/toggle`);
    } catch (error) {
      console.error('Görev güncellenirken hata:', error);
      fetchTasksForProject(projectId); // Revert on error
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle || !activeProjectIdForTask) return;

    setIsSubmittingTask(true);
    try {
      await api.post('/tasks', {
        title: newTaskTitle,
        description: '', // Optional for now
        projectId: activeProjectIdForTask
      });
      setIsTaskModalOpen(false);
      setNewTaskTitle('');
      await fetchTasksForProject(activeProjectIdForTask);
    } catch (error) {
      console.error('Görev oluşturulurken hata:', error);
    } finally {
      setIsSubmittingTask(false);
    }
  };

  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Expand olmasını engellemek için
    if (!window.confirm('Bu projeyi ve içindeki tüm görevleri silmek istediğinize emin misiniz?')) return;

    try {
      await api.delete(`/projects/${projectId}`);
      setProjects(projects.filter(p => p.id !== projectId));
    } catch (error) {
      console.error('Proje silinirken hata:', error);
    }
  };

  const openTaskModal = (projectId: string) => {
    setActiveProjectIdForTask(projectId);
    setIsTaskModalOpen(true);
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
          <p className="text-muted-foreground">Tüm projelerinizi ve alt görevlerini buradan yönetin.</p>
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
          projects.map((project) => (
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
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground bg-white/5 px-3 py-1 rounded-full hidden sm:inline-block">
                    {format(new Date(project.createdAt), 'dd MMM yyyy', { locale: tr })}
                  </span>
                  <button 
                    onClick={(e) => handleDeleteProject(project.id, e)}
                    className="p-2 text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                    title="Projeyi Sil"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <ChevronDown className={cn(
                    "w-5 h-5 text-muted-foreground transition-transform duration-300",
                    expandedProjectId === project.id && "rotate-180"
                  )} />
                </div>
              </div>

              <AnimatePresence>
                {expandedProjectId === project.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-white/5 bg-black/20"
                  >
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Görevler</h4>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-primary hover:text-primary hover:bg-primary/10"
                          onClick={() => openTaskModal(project.id)}
                        >
                          <Plus className="w-4 h-4 mr-2" /> Görev Ekle
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {!projectTasks[project.id] ? (
                          <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
                        ) : projectTasks[project.id].length === 0 ? (
                          <p className="text-sm text-muted-foreground py-2">Bu projeye ait görev bulunmuyor.</p>
                        ) : (
                          projectTasks[project.id].map(task => (
                            <div 
                              key={task.id} 
                              className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
                              onClick={() => toggleTaskStatus(project.id, task.id, task.status)}
                            >
                              <div className={cn(
                                "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                                task.status === 'Done' ? "bg-accent border-accent" : "border-white/20 group-hover:border-white/50"
                              )}>
                                {task.status === 'Done' && <CheckCircle2 className="w-3 h-3 text-white" />}
                              </div>
                              <span className={cn("text-sm transition-all", task.status === 'Done' && "text-muted-foreground line-through")}>
                                {task.title}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
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
                  <label className="text-sm font-medium text-muted-foreground">Görev Adı</label>
                  <input 
                    type="text" 
                    required
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors"
                    placeholder="Örn: Veritabanı modelini oluştur"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmittingTask || !newTaskTitle}
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
