"use client";

import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import type { Editor, Range } from '@tiptap/core';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SlashItem {
  title: string;
  description?: string;
  icon: LucideIcon;
  command: (args: { editor: Editor; range: Range }) => void;
}

interface SlashMenuProps {
  items: SlashItem[];
  command: (item: SlashItem) => void;
}

export interface SlashMenuHandle {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

export const SlashMenu = forwardRef<SlashMenuHandle, SlashMenuProps>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => setSelectedIndex(0), [props.items]);

  const selectItem = (idx: number) => {
    const item = props.items[idx];
    if (item) props.command(item);
  };

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (props.items.length === 0) return false;
      if (event.key === 'ArrowUp') {
        setSelectedIndex((i) => (i + props.items.length - 1) % props.items.length);
        return true;
      }
      if (event.key === 'ArrowDown') {
        setSelectedIndex((i) => (i + 1) % props.items.length);
        return true;
      }
      if (event.key === 'Enter') {
        selectItem(selectedIndex);
        return true;
      }
      return false;
    },
  }));

  return (
    <div className="glass border border-white/10 rounded-xl shadow-2xl shadow-black/40 p-1 w-64 max-h-80 overflow-y-auto">
      {props.items.length === 0 ? (
        <div className="px-3 py-2 text-sm text-muted-foreground">Sonuç yok</div>
      ) : (
        props.items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={item.title}
              type="button"
              onClick={() => selectItem(idx)}
              onMouseEnter={() => setSelectedIndex(idx)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors',
                idx === selectedIndex
                  ? 'bg-primary/20 text-primary'
                  : 'text-foreground hover:bg-white/5',
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium leading-tight">{item.title}</div>
                {item.description && (
                  <div className="text-xs text-muted-foreground mt-0.5">{item.description}</div>
                )}
              </div>
            </button>
          );
        })
      )}
    </div>
  );
});

SlashMenu.displayName = 'SlashMenu';
