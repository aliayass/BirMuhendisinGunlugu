"use client";

import { useEffect, forwardRef, useImperativeHandle } from 'react';
import { useEditor, EditorContent, JSONContent } from '@tiptap/react';
import { FloatingMenu, BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { SlashCommand } from './extensions/SlashCommand';
import { DragHandleMenu } from './DragHandleMenu';
import {
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Code2, Minus,
  Bold, Italic, Strikethrough, Code as CodeIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  initialContent?: JSONContent | null;
  onChange?: (json: JSONContent) => void;
  editable?: boolean;
}

export interface RichTextEditorHandle {
  setContent: (content: string | JSONContent) => void;
  insertContent: (content: string | JSONContent) => void;
}

export const RichTextEditor = forwardRef<RichTextEditorHandle, RichTextEditorProps>(function RichTextEditor({
  initialContent,
  onChange,
  editable = true,
}, ref) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Yazmaya başla... '/' ile blok seç, # başlık, - liste, > alıntı",
      }),
      SlashCommand,
    ],
    content: initialContent ?? '',
    editable,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-sm max-w-none focus:outline-none min-h-[60vh]',
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getJSON());
    },
  });

  useEffect(() => {
    if (!editor || !initialContent) return;
    if (editor.isEmpty) {
      editor.commands.setContent(initialContent, { emitUpdate: false });
    }
  }, [editor, initialContent]);

  useImperativeHandle(ref, () => ({
    setContent: (content) => {
      editor?.chain().focus('end').setContent(content, { emitUpdate: true }).run();
    },
    insertContent: (content) => {
      editor?.chain().focus().insertContent(content).run();
    },
  }), [editor]);

  if (!editor) return null;

  return (
    <>
      <EditorContent editor={editor} />
      <DragHandleMenu editor={editor} />

      {/* Boş satırlarda görünür — Notion tarzı blok seçici */}
      <FloatingMenu
        editor={editor}
        options={{ placement: 'left-start', offset: 8 }}
      >
        <div className="glass rounded-xl border border-white/10 p-1 flex gap-0.5 shadow-2xl shadow-black/40">
          <MenuBtn title="Başlık 1 (# )" Icon={Heading1}
            active={editor.isActive('heading', { level: 1 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} />
          <MenuBtn title="Başlık 2 (## )" Icon={Heading2}
            active={editor.isActive('heading', { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
          <MenuBtn title="Başlık 3 (### )" Icon={Heading3}
            active={editor.isActive('heading', { level: 3 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />
          <Divider />
          <MenuBtn title="Madde işareti (- )" Icon={List}
            active={editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()} />
          <MenuBtn title="Numaralı liste (1. )" Icon={ListOrdered}
            active={editor.isActive('orderedList')}
            onClick={() => editor.chain().focus().toggleOrderedList().run()} />
          <MenuBtn title="Alıntı (> )" Icon={Quote}
            active={editor.isActive('blockquote')}
            onClick={() => editor.chain().focus().toggleBlockquote().run()} />
          <MenuBtn title="Kod bloğu (```)" Icon={Code2}
            active={editor.isActive('codeBlock')}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()} />
          <MenuBtn title="Ayraç (---)" Icon={Minus}
            onClick={() => editor.chain().focus().setHorizontalRule().run()} />
        </div>
      </FloatingMenu>

      {/* Metin seçili olunca görünür — inline format */}
      <BubbleMenu editor={editor}>
        <div className="glass rounded-xl border border-white/10 p-1 flex gap-0.5 shadow-2xl shadow-black/40">
          <MenuBtn title="Kalın (Ctrl+B)" Icon={Bold}
            active={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()} />
          <MenuBtn title="İtalik (Ctrl+I)" Icon={Italic}
            active={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()} />
          <MenuBtn title="Üstü çizili" Icon={Strikethrough}
            active={editor.isActive('strike')}
            onClick={() => editor.chain().focus().toggleStrike().run()} />
          <MenuBtn title="Satır içi kod" Icon={CodeIcon}
            active={editor.isActive('code')}
            onClick={() => editor.chain().focus().toggleCode().run()} />
        </div>
      </BubbleMenu>
    </>
  );
});

function MenuBtn({
  Icon, title, active, onClick,
}: {
  Icon: typeof Bold;
  title: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        'p-1.5 rounded-lg transition-colors',
        active
          ? 'bg-primary/20 text-primary'
          : 'text-muted-foreground hover:text-foreground hover:bg-white/10',
      )}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}

function Divider() {
  return <div className="w-px bg-white/10 mx-0.5" />;
}
