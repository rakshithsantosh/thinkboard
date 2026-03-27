"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { useEffect, type ReactNode } from "react";
import {
  Bold,
  CheckSquare,
  Code2,
  Heading1,
  Heading2,
  Italic,
  Link2,
  List,
  Quote,
  Redo2,
  Undo2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { EMPTY_RICH_TEXT_DOCUMENT } from "@/lib/editor";
import { cn } from "@/lib/utils";
import type { RichTextDocument } from "@/lib/types";

import "./editor.css";

interface TiptapEditorProps {
  content?: RichTextDocument;
  onChange?: (json: RichTextDocument) => void;
  placeholder?: string;
  className?: string;
  editorClassName?: string;
  compact?: boolean;
}

type ToolbarButtonProps = {
  onClick: () => void;
  isActive?: boolean;
  label: string;
  children: ReactNode;
};

function ToolbarButton({ onClick, isActive, label, children }: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={cn(
        "h-9 w-9 rounded-xl text-slate-500 hover:bg-white hover:text-slate-900",
        isActive && "bg-white text-slate-950 shadow-sm"
      )}
      aria-label={label}
      title={label}
    >
      {children}
    </Button>
  );
}

export function TiptapEditor({
  content,
  onChange,
  placeholder = "Start thinking...",
  className,
  editorClassName,
  compact = false,
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: content ?? EMPTY_RICH_TEXT_DOCUMENT,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getJSON() as RichTextDocument);
    },
    editorProps: {
      attributes: {
        class: cn(
          "thinkboard-editor prose max-w-none focus:outline-none",
          compact ? "min-h-[220px]" : "min-h-[360px]",
          editorClassName
        ),
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    const nextContent = content ?? EMPTY_RICH_TEXT_DOCUMENT;
    const current = JSON.stringify(editor.getJSON());
    const incoming = JSON.stringify(nextContent);

    if (current !== incoming) {
      editor.commands.setContent(nextContent, {
        emitUpdate: false,
      });
    }
  }, [content, editor]);

  const promptForLink = () => {
    if (!editor) {
      return;
    }

    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Enter a URL", previousUrl ?? "");

    if (url === null) {
      return;
    }

    if (!url) {
      editor.chain().focus().unsetLink().run();
      return;
    }

    editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div
      className={cn(
        "relative w-full rounded-[28px] border border-stone-200 bg-white/90 shadow-[0_20px_80px_rgba(15,23,42,0.06)]",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 bg-stone-50/80 px-4 py-3">
        <ToolbarButton label="Undo" onClick={() => editor?.chain().focus().undo().run()}>
          <Undo2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Redo" onClick={() => editor?.chain().focus().redo().run()}>
          <Redo2 className="h-4 w-4" />
        </ToolbarButton>
        <div className="mx-1 hidden h-6 w-px bg-stone-200 sm:block" />
        <ToolbarButton
          label="Bold"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          isActive={editor?.isActive("bold")}
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          isActive={editor?.isActive("italic")}
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Heading 1"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor?.isActive("heading", { level: 1 })}
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Heading 2"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor?.isActive("heading", { level: 2 })}
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Bullet list"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          isActive={editor?.isActive("bulletList")}
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Task list"
          onClick={() => editor?.chain().focus().toggleTaskList().run()}
          isActive={editor?.isActive("taskList")}
        >
          <CheckSquare className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Quote"
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          isActive={editor?.isActive("blockquote")}
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Code block"
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
          isActive={editor?.isActive("codeBlock")}
        >
          <Code2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Link" onClick={promptForLink} isActive={editor?.isActive("link")}>
          <Link2 className="h-4 w-4" />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
