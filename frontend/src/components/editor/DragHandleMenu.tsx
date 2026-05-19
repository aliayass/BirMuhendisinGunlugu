"use client";

import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { Editor } from '@tiptap/core';
import type { Node as PMNode } from '@tiptap/pm/model';
import DragHandle from '@tiptap/extension-drag-handle-react';
import { Copy, Trash2, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DragHandleMenu({ editor }: { editor: Editor | null }) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const currentNode = useRef<{ node: PMNode | null; pos: number }>({ node: null, pos: -1 });
  const handleBtnRef = useRef<HTMLButtonElement | null>(null);

  if (!editor) return null;

  const onTrigger = () => {
    const btn = handleBtnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    setMenuPos({ x: rect.right + 6, y: rect.top });
    setOpen(true);
  };

  const handleDelete = () => {
    const { pos, node } = currentNode.current;
    if (!node || pos < 0) return;
    editor.chain().focus().setNodeSelection(pos).deleteSelection().run();
    setOpen(false);
  };

  const handleDuplicate = () => {
    const { pos, node } = currentNode.current;
    if (!node || pos < 0) return;
    editor.chain().focus().insertContentAt(pos + node.nodeSize, node.toJSON()).run();
    setOpen(false);
  };

  return (
    <>
      <DragHandle
        editor={editor}
        onNodeChange={({ node, pos }) => {
          currentNode.current = { node, pos };
        }}
      >
        <button
          ref={handleBtnRef}
          type="button"
          onClick={onTrigger}
          className="flex items-center justify-center w-6 h-6 rounded-md text-muted-foreground/70 hover:text-foreground hover:bg-white/10 transition-colors cursor-grab active:cursor-grabbing"
          aria-label="Bloğu sürükle veya menü aç"
        >
          <GripVertical className="w-4 h-4" />
        </button>
      </DragHandle>

      {open && menuPos && createPortal(
        <>
          {/* Backdrop — dışarı tık */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div
            data-drag-menu
            style={{ position: 'fixed', left: menuPos.x, top: menuPos.y, zIndex: 50 }}
            className="glass border border-white/10 rounded-xl shadow-2xl shadow-black/40 p-1 w-44"
          >
            <MenuItem icon={Copy} label="Kopyala" onClick={handleDuplicate} />
            <MenuItem icon={Trash2} label="Sil" onClick={handleDelete} danger />
          </div>
        </>,
        document.body,
      )}
    </>
  );
}

function MenuItem({
  icon: Icon, label, onClick, danger,
}: {
  icon: typeof Copy;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left',
        danger
          ? 'text-destructive hover:bg-destructive/10'
          : 'text-foreground hover:bg-white/5',
      )}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span>{label}</span>
    </button>
  );
}
