"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core';
import {
  CheckSquare,
  Plus,
  Loader2,
  X,
  Trash2,
  Calendar,
  Flag,
  GripVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { format, isPast, isToday } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'sonner';

type TaskStatus = 'Todo' | 'InProgress' | 'Done';
type TaskPriority = 'Low' | 'Medium' | 'High';

interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  projectId: string;
  projectName: string | null;
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
}

const COLUMNS: { id: TaskStatus; label: string; color: string; bg: string }[] = [
  { id: 'Todo', label: 'Bekliyor', color: 'text-muted-foreground', bg: 'bg-white/5' },
  { id: 'InProgress', label: 'Devam Ediyor', color: 'text-secondary', bg: 'bg-secondary/5' },
  { id: 'Done', label: 'Tamamlandı', color: 'text-accent', bg: 'bg-accent/5' },
];

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; cls: string; dot: string }> = {
  Low: { label: 'Düşük', cls: 'text-muted-foreground border-white/20', dot: 'bg-muted-foreground' },
  Medium: { label: 'Orta', cls: 'text-secondary border-secondary/40', dot: 'bg-secondary' },
  High: { label: 'Yüksek', cls: 'text-destructive border-destructive/40', dot: 'bg-destructive' },
};

function TaskCard({ task, onDelete }: { task: Task; onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });
  const pc = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.Medium;
  const dueDateObj = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDateObj && !isToday(dueDateObj) && isPast(dueDateObj) && task.status !== 'Done';

  return (
    <div
      ref={setNodeRef}
      style={transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined}
      className={cn(
        "glass border border-white/5 rounded-xl p-4 space-y-3 cursor-grab active:cursor-grabbing group",
        isDragging && "opacity-40"
      )}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between gap-2">
        <p className={cn("text-sm font-medium leading-snug flex-1", task.status === 'Done' && "text-muted-foreground line-through")}>
          {task.title}
        </p>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
          className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-destructive hover:bg-destructive/10 transition-all shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className={cn("inline-flex items-center gap-1.5 text-xs border rounded-md px-2 py-0.5", pc.cls)}>
          <span className={cn("w-1.5 h-1.5 rounded-full", pc.dot)} />
          {pc.label}
        </span>
        {task.projectName && (
          <span className="text-xs text-muted-foreground bg-white/5 px-2 py-0.5 rounded-md truncate max-w-[120px]">
            {task.projectName}
          </span>
        )}
      </div>

      {dueDateObj && (
        <div className={cn("flex items-center gap-1.5 text-xs", isOverdue ? "text-destructive" : "text-muted-foreground")}>
          <Calendar className="w-3 h-3" />
          {format(dueDateObj, 'dd MMM', { locale: tr })}
          {isOverdue && <span className="text-xs font-medium">(Gecikmiş)</span>}
        </div>
      )}
    </div>
  );
}

function KanbanColumn({
  column,
  tasks,
  onDelete,
  onAddTask,
}: {
  column: typeof COLUMNS[0];
  tasks: Task[];
  onDelete: (id: string) => void;
  onAddTask: (status: TaskStatus) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div className="flex flex-col flex-1 min-w-[280px] max-w-sm">
      <div className={cn("flex items-center justify-between px-4 py-3 rounded-t-2xl border border-b-0 border-white/5", column.bg)}>
        <div className="flex items-center gap-2">
          <span className={cn("font-semibold text-sm", column.color)}>{column.label}</span>
          <span className="text-xs bg-white/10 text-muted-foreground rounded-full px-2 py-0.5">{tasks.length}</span>
        </div>
        <button
          onClick={() => onAddTask(column.id)}
          className="p-1 rounded-lg hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 rounded-b-2xl border border-white/5 p-3 space-y-3 min-h-[400px] transition-colors",
          isOver ? "bg-white/5 border-white/20" : "bg-black/20"
        )}
      >
        <AnimatePresence>
          {tasks.map(task => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <TaskCard task={task} onDelete={onDelete} />
            </motion.div>
          ))}
        </AnimatePresence>
        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm opacity-50">
            Görev yok
          </div>
        )}
      </div>
    </div>
  );
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>('Todo');
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('Medium');
  const [newProjectId, setNewProjectId] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const fetchTasks = useCallback(async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data);
    } catch {
      toast.error('Görevler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchTasks(); fetchProjects(); }, [fetchTasks, fetchProjects]);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    setActiveTask(task ?? null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const newStatus = over.id as TaskStatus;
    const taskId = active.id as string;
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === newStatus) return;

    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
    } catch {
      toast.error('Görev güncellenemedi.');
      fetchTasks();
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title || !newProjectId) return;
    setIsSubmitting(true);
    try {
      const res = await api.post('/tasks', {
        title,
        description: '',
        projectId: newProjectId,
        priority: newPriority,
        dueDate: newDueDate || null,
      });
      const created = res.data;
      setTasks(prev => [...prev, { ...created, status: defaultStatus }]);
      if (created.status !== defaultStatus) {
        await api.patch(`/tasks/${created.id}/status`, { status: defaultStatus });
      }
      toast.success('Görev eklendi!');
      setIsModalOpen(false);
      setNewTitle('');
      setNewPriority('Medium');
      setNewDueDate('');
      await fetchTasks();
    } catch {
      toast.error('Görev eklenemedi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (taskId: string) => {
    toast('Görevi silmek istediğinize emin misiniz?', {
      action: {
        label: 'Evet, Sil',
        onClick: async () => {
          try {
            await api.delete(`/tasks/${taskId}`);
            setTasks(prev => prev.filter(t => t.id !== taskId));
            toast.success('Görev silindi.');
          } catch {
            toast.error('Görev silinemedi.');
          }
        },
      },
      cancel: { label: 'Vazgeç', onClick: () => {} },
    });
  };

  const openModal = (status: TaskStatus) => {
    setDefaultStatus(status);
    setIsModalOpen(true);
  };

  const columnTasks = (status: TaskStatus) => tasks.filter(t => t.status === status);

  const done = tasks.filter(t => t.status === 'Done').length;
  const total = tasks.length;

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
          <h1 className="text-3xl font-black tracking-tight">Görev Panosu</h1>
          <p className="text-muted-foreground">
            {total} görev · {done} tamamlandı
            {total > 0 && <span className="ml-2 text-accent font-medium">%{Math.round(done * 100 / total)}</span>}
          </p>
        </div>
        <Button
          onClick={() => openModal('Todo')}
          className="h-12 px-6 rounded-xl bg-primary hover:bg-primary-dark gap-2 shadow-lg shadow-primary/20"
        >
          <Plus className="w-5 h-5" /> Yeni Görev
        </Button>
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map(col => (
            <KanbanColumn
              key={col.id}
              column={col}
              tasks={columnTasks(col.id)}
              onDelete={handleDelete}
              onAddTask={openModal}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="glass border border-white/20 rounded-xl p-4 shadow-2xl rotate-2 opacity-90">
              <p className="text-sm font-medium">{activeTask.title}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Create Task Modal */}
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
              className="glass border border-white/10 rounded-3xl p-6 w-full max-w-md relative shadow-2xl"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-bold mb-1">Yeni Görev</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Kolon: <span className="text-primary font-medium">{COLUMNS.find(c => c.id === defaultStatus)?.label}</span>
              </p>

              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Görev Adı *</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className="mt-1.5 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors text-sm"
                    placeholder="Görev başlığı..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Öncelik</label>
                    <select
                      value={newPriority}
                      onChange={e => setNewPriority(e.target.value as TaskPriority)}
                      className="mt-1.5 w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 outline-none focus:border-primary transition-colors text-sm"
                    >
                      <option value="Low">Düşük</option>
                      <option value="Medium">Orta</option>
                      <option value="High">Yüksek</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Son Tarih</label>
                    <input
                      type="date"
                      value={newDueDate}
                      onChange={e => setNewDueDate(e.target.value)}
                      className="mt-1.5 w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 outline-none focus:border-primary transition-colors text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Proje *</label>
                  <select
                    required
                    value={newProjectId}
                    onChange={e => setNewProjectId(e.target.value)}
                    className="mt-1.5 w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 outline-none focus:border-primary transition-colors text-sm"
                  >
                    <option value="">Proje seçin...</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || !newTitle.trim() || !newProjectId}
                  className="w-full h-12 rounded-xl bg-primary hover:bg-primary-dark mt-2"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Görevi Ekle'}
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
