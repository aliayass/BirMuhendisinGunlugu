"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { EditorCanvas, type EditorCanvasSaveData } from '@/components/editor/EditorCanvas';
import api from '@/lib/api';

export default function NewNotePage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (data: EditorCanvasSaveData) => {
    const title = data.title.trim();
    if (!title) return;
    setIsSaving(true);
    try {
      const res = await api.post('/notes', {
        title,
        content: JSON.stringify(data.content),
        parentId: null,
        category: data.category,
        tags: data.tags,
      });
      toast.success('Not oluşturuldu!');
      router.push(`/dashboard/notes/${res.data.id}`);
    } catch {
      toast.error('Not oluşturulamadı.');
      setIsSaving(false);
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

  return (
    <EditorCanvas
      onSave={handleSave}
      onCancel={() => router.push('/dashboard/notes')}
      onSuggestTags={handleSuggestTags}
      isSaving={isSaving}
    />
  );
}
