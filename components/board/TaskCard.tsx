"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { formatDistanceToNow } from "date-fns";
import { GripVertical, NotebookPen, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

import { extractPlainText } from "@/lib/editor";
import type { TaskRecord } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: TaskRecord;
  onOpen: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  isDeleting?: boolean;
}

export function TaskCard({ task, onOpen, onDelete, isDeleting = false }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "task",
      taskId: task.id,
    },
  });

  const preview =
    task.summary ||
    extractPlainText(task.content) ||
    "Open this task to write detailed thinking, notes, and structured breakdowns.";

  return (
    <motion.article
      layout
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        "rounded-[24px] border border-white/80 bg-white/95 p-4 shadow-[0_12px_35px_rgba(15,23,42,0.08)] transition-shadow hover:shadow-[0_20px_45px_rgba(15,23,42,0.12)]",
        isDragging && "opacity-50"
      )}
    >
      <div className="flex items-start gap-3">
        <button type="button" onClick={() => onOpen(task.id)} className="flex-1 text-left">
          <p className="text-base font-semibold tracking-tight text-slate-950">{task.title}</p>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{preview}</p>
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onDelete(task.id)}
            disabled={isDeleting}
            className="rounded-2xl border border-red-100 bg-red-50 p-2 text-red-500 transition-colors hover:border-red-200 hover:bg-red-100 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label={`Delete ${task.title}`}
            title="Delete task"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="rounded-2xl border border-stone-200 bg-stone-50 p-2 text-slate-400 transition-colors hover:border-stone-300 hover:bg-stone-100 hover:text-slate-700"
            {...attributes}
            {...listeners}
            aria-label={`Drag ${task.title}`}
            title="Drag task"
          >
            <GripVertical className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-stone-100 pt-3 text-xs text-slate-500">
        <div className="inline-flex items-center gap-2 rounded-full bg-stone-100 px-3 py-1.5 font-medium">
          <NotebookPen className="h-3.5 w-3.5" />
          <span>Writing space</span>
        </div>
        <span>Updated {formatDistanceToNow(new Date(task.updatedAt))} ago</span>
      </div>
    </motion.article>
  );
}
