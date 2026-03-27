"use client";

import { useEffect, useState } from "react";

import { createTaskAction } from "@/actions/tasks";
import { TASK_STATUSES, TASK_STATUS_META, type TaskStatusValue } from "@/lib/constants";
import type { TaskRecord } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface CreateTaskDialogProps {
  open: boolean;
  defaultStatus: TaskStatusValue;
  onOpenChange: (open: boolean) => void;
  onCreated: (task: TaskRecord) => void;
}

export function CreateTaskDialog({
  open,
  defaultStatus,
  onOpenChange,
  onCreated,
}: CreateTaskDialogProps) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [status, setStatus] = useState<TaskStatusValue>(defaultStatus);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setStatus(defaultStatus);
      setError(null);
    }
  }, [defaultStatus, open]);

  const handleCreate = () => {
    setIsPending(true);
    setError(null);

    void (async () => {
      try {
        const task = await createTaskAction({
          title,
          summary,
          status,
        });

        setTitle("");
        setSummary("");
        onCreated(task);
        onOpenChange(false);
      } catch (actionError) {
        const message =
          actionError instanceof Error ? actionError.message : "Unable to create the task right now.";
        setError(message);
      } finally {
        setIsPending(false);
      }
    })();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-[32px] border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(249,245,237,0.98))] p-8 shadow-[0_30px_90px_rgba(15,23,42,0.18)]">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl tracking-tight text-slate-950">
            Create a new task
          </DialogTitle>
          <DialogDescription className="text-base leading-7 text-slate-600">
            Start lightweight with a clear title and summary. You can open the task right away to flesh out the full long-form description.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Title</label>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Shape the deployment checklist"
              className="h-12 rounded-2xl border-stone-200 bg-white text-slate-900 focus-visible:ring-orange-200"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Summary</label>
            <Textarea
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              placeholder="Add a short framing note before you open the detailed writing space."
              className="min-h-[120px]"
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Start column</label>
            <div className="grid gap-2 sm:grid-cols-2">
              {TASK_STATUSES.map((taskStatus) => {
                const meta = TASK_STATUS_META[taskStatus];
                const isActive = status === taskStatus;
                return (
                  <button
                    key={taskStatus}
                    type="button"
                    onClick={() => setStatus(taskStatus)}
                    className={cn(
                      "rounded-[22px] border px-4 py-4 text-left transition-all",
                      isActive
                        ? "border-orange-200 bg-orange-50 shadow-[0_10px_30px_rgba(234,88,12,0.10)]"
                        : "border-stone-200 bg-white hover:border-stone-300"
                    )}
                  >
                    <p className="font-semibold text-slate-950">{meta.label}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{meta.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>

        <DialogFooter className="gap-3 sm:justify-between">
          <p className="text-sm text-slate-500">The detailed description opens in a focused writing panel after creation.</p>
          <Button
            type="button"
            onClick={handleCreate}
            disabled={isPending || !title.trim()}
            className="rounded-full px-6"
          >
            {isPending ? "Creating..." : "Create task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
