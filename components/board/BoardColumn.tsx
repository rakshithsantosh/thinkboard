"use client";

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

import { TASK_STATUS_META, type TaskStatusValue } from "@/lib/constants";
import type { TaskRecord } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { TaskCard } from "@/components/board/TaskCard";
import { cn } from "@/lib/utils";

interface BoardColumnProps {
  status: TaskStatusValue;
  tasks: TaskRecord[];
  onOpenTask: (taskId: string) => void;
  onCreateTask: (status: TaskStatusValue) => void;
  onDeleteTask: (taskId: string) => void;
  deletingTaskIds?: string[];
}

export function BoardColumn({
  status,
  tasks,
  onOpenTask,
  onCreateTask,
  onDeleteTask,
  deletingTaskIds = [],
}: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${status}`,
    data: {
      type: "column",
      status,
    },
  });

  const meta = TASK_STATUS_META[status];

  return (
    <motion.section
      layout
      className={cn(
        "flex min-h-[560px] flex-col rounded-[32px] border p-4 shadow-[0_18px_60px_rgba(15,23,42,0.06)]",
        meta.columnClassName,
        isOver && "ring-2 ring-orange-200"
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            <span>{meta.label}</span>
            <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] text-slate-700">{tasks.length}</span>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">{meta.description}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-2xl bg-white/70 text-slate-600 hover:bg-white hover:text-slate-900"
          onClick={() => onCreateTask(status)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div ref={setNodeRef} className="flex-1 space-y-3 rounded-[24px]">
        <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onOpen={onOpenTask}
              onDelete={onDeleteTask}
              isDeleting={deletingTaskIds.includes(task.id)}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 ? (
          <div className="flex min-h-[140px] items-center justify-center rounded-[24px] border border-dashed border-stone-300 bg-white/50 px-4 text-center text-sm leading-6 text-slate-500">
            Drop a task here or create a new one to start building momentum.
          </div>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => onCreateTask(status)}
        className="mt-4 flex items-center justify-center gap-2 rounded-[20px] border border-dashed border-stone-300 bg-white/70 px-4 py-3 text-sm font-medium text-slate-600 transition-colors hover:border-stone-400 hover:bg-white hover:text-slate-900"
      >
        <Plus className="h-4 w-4" />
        New task
      </button>
    </motion.section>
  );
}
