"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Clock3, Trash2 } from "lucide-react";

import { deleteTaskAction, updateTaskAction } from "@/actions/tasks";
import { TiptapEditor } from "@/components/editor/TiptapEditor";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TASK_STATUSES, TASK_STATUS_META, type TaskStatusValue } from "@/lib/constants";
import { EMPTY_RICH_TEXT_DOCUMENT, getWordCount } from "@/lib/editor";
import type { RichTextDocument, TaskRecord } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TaskDetailDialogProps {
  task: TaskRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (task: TaskRecord) => void;
  onDeleted: (taskId: string) => void;
}

export function TaskDetailDialog({
  task,
  open,
  onOpenChange,
  onSaved,
  onDeleted,
}: TaskDetailDialogProps) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [status, setStatus] = useState<TaskStatusValue>("IDEATION");
  const [content, setContent] = useState<RichTextDocument>(EMPTY_RICH_TEXT_DOCUMENT);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!task) {
      return;
    }

    setTitle(task.title);
    setSummary(task.summary ?? "");
    setStatus(task.status);
    setContent(task.content ?? EMPTY_RICH_TEXT_DOCUMENT);
    setError(null);
  }, [task]);

  if (!task) {
    return null;
  }

  const handleSave = () => {
    setIsPending(true);
    setError(null);

    void (async () => {
      try {
        const updatedTask = await updateTaskAction({
          id: task.id,
          title,
          summary,
          status,
          content,
        });

        onSaved(updatedTask);
      } catch (actionError) {
        const message =
          actionError instanceof Error ? actionError.message : "Unable to save the task right now.";
        setError(message);
      } finally {
        setIsPending(false);
      }
    })();
  };

  const handleDelete = () => {
    const confirmed = window.confirm("Delete this task? Its detailed notes will be removed as well.");
    if (!confirmed) {
      return;
    }

    setIsPending(true);
    setError(null);

    void (async () => {
      try {
        await deleteTaskAction(task.id);
        onDeleted(task.id);
        onOpenChange(false);
      } catch (actionError) {
        const message =
          actionError instanceof Error ? actionError.message : "Unable to delete the task right now.";
        setError(message);
      } finally {
        setIsPending(false);
      }
    })();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="left-auto right-0 top-0 h-screen w-full max-w-3xl translate-x-0 translate-y-0 rounded-none border-l border-stone-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,245,238,0.98))] p-0 shadow-[0_30px_90px_rgba(15,23,42,0.18)] sm:rounded-none">
        <div className="flex h-full flex-col overflow-hidden">
          <DialogHeader className="border-b border-stone-200 px-8 py-6 text-left">
            <div className="flex items-start justify-between gap-4">
              <div>
                <DialogTitle className="font-display text-3xl tracking-tight text-slate-950">
                  Task thinking space
                </DialogTitle>
                <DialogDescription className="mt-2 max-w-2xl text-base leading-7 text-slate-600">
                  Use this panel like a small writing room for decisions, breakdowns, and implementation notes.
                </DialogDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                className="rounded-full border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800"
                onClick={handleDelete}
                disabled={isPending}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-8 py-6">
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_260px]">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Title</label>
                  <Input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    className="h-12 rounded-2xl border-stone-200 bg-white text-base font-semibold text-slate-950 focus-visible:ring-orange-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Short description</label>
                  <Textarea
                    value={summary}
                    onChange={(event) => setSummary(event.target.value)}
                    placeholder="Capture the why behind the task before you go deeper."
                    className="min-h-[120px]"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                      Detailed description
                    </label>
                    <span className="text-xs text-slate-500">{getWordCount(content)} words</span>
                  </div>
                  <TiptapEditor
                    content={content}
                    onChange={setContent}
                    placeholder="Write the full breakdown, decision log, bullets, references, and thinking that should live with this task."
                    className="overflow-hidden"
                  />
                </div>
              </div>

              <aside className="space-y-4 rounded-[28px] border border-stone-200 bg-white/85 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Status</p>
                  <div className="mt-3 space-y-2">
                    {TASK_STATUSES.map((taskStatus) => {
                      const meta = TASK_STATUS_META[taskStatus];
                      const isActive = status === taskStatus;
                      return (
                        <button
                          key={taskStatus}
                          type="button"
                          onClick={() => setStatus(taskStatus)}
                          className={cn(
                            "w-full rounded-[20px] border px-3 py-3 text-left transition-all",
                            isActive
                              ? "border-orange-200 bg-orange-50"
                              : "border-stone-200 bg-white hover:border-stone-300"
                          )}
                        >
                          <p className="font-semibold text-slate-900">{meta.label}</p>
                          <p className="mt-1 text-sm leading-6 text-slate-500">{meta.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-[22px] bg-stone-50 p-4 text-sm leading-7 text-slate-600">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Clock3 className="h-4 w-4" />
                    <span>Created {format(new Date(task.createdAt), "PPP")}</span>
                  </div>
                  <p className="mt-2">Last updated {format(new Date(task.updatedAt), "PPP p")}</p>
                </div>

                {error ? <p className="text-sm text-red-600">{error}</p> : null}

                <div className="space-y-2 pt-2">
                  <Button type="button" className="w-full rounded-full" onClick={handleSave} disabled={isPending || !title.trim()}>
                    {isPending ? "Saving..." : "Save changes"}
                  </Button>
                  <Button type="button" variant="outline" className="w-full rounded-full" onClick={() => onOpenChange(false)}>
                    Close
                  </Button>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
