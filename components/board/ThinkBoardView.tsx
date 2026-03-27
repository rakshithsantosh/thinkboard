"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowRightLeft, BookOpen, Plus } from "lucide-react";

import { deleteTaskAction, updateTaskPositionsAction } from "@/actions/tasks";
import { BoardColumn } from "@/components/board/BoardColumn";
import { CreateTaskDialog } from "@/components/board/CreateTaskDialog";
import { TaskDetailDialog } from "@/components/board/TaskDetailDialog";
import { Button } from "@/components/ui/button";
import { TASK_STATUSES, TASK_STATUS_META, type TaskStatusValue } from "@/lib/constants";
import { extractPlainText } from "@/lib/editor";
import type { TaskRecord } from "@/lib/types";

interface ThinkBoardViewProps {
  initialTasks: TaskRecord[];
}

type ColumnMap = Record<TaskStatusValue, TaskRecord[]>;

function createColumnMap(tasks: TaskRecord[]): ColumnMap {
  const columns = TASK_STATUSES.reduce((accumulator, status) => {
    accumulator[status] = [];
    return accumulator;
  }, {} as ColumnMap);

  for (const task of [...tasks].sort((left, right) => left.order - right.order)) {
    columns[task.status].push(task);
  }

  return columns;
}

function flattenColumnMap(columns: ColumnMap) {
  return TASK_STATUSES.flatMap((status) =>
    columns[status].map((task, index) => ({
      ...task,
      status,
      order: index,
    }))
  );
}

function moveTask(tasks: TaskRecord[], activeId: string, overId: string) {
  if (activeId === overId) {
    return tasks;
  }

  const columns = createColumnMap(tasks);
  let activeTask: TaskRecord | undefined;
  let sourceStatus: TaskStatusValue | undefined;
  let sourceIndex = -1;

  for (const status of TASK_STATUSES) {
    const index = columns[status].findIndex((task) => task.id === activeId);
    if (index >= 0) {
      activeTask = columns[status][index];
      sourceStatus = status;
      sourceIndex = index;
      columns[status].splice(index, 1);
      break;
    }
  }

  if (!activeTask || !sourceStatus) {
    return tasks;
  }

  if (overId.startsWith("column-")) {
    const targetStatus = overId.replace("column-", "") as TaskStatusValue;
    columns[targetStatus].push({
      ...activeTask,
      status: targetStatus,
    });
    return flattenColumnMap(columns);
  }

  for (const status of TASK_STATUSES) {
    const overIndex = columns[status].findIndex((task) => task.id === overId);
    if (overIndex >= 0) {
      columns[status].splice(overIndex, 0, {
        ...activeTask,
        status,
      });
      return flattenColumnMap(columns);
    }
  }

  columns[sourceStatus].splice(sourceIndex, 0, activeTask);
  return flattenColumnMap(columns);
}

export function ThinkBoardView({ initialTasks }: ThinkBoardViewProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [snapshot, setSnapshot] = useState<TaskRecord[] | null>(null);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createStatus, setCreateStatus] = useState<TaskStatusValue>("IDEATION");
  const [deletingTaskIds, setDeletingTaskIds] = useState<string[]>([]);
  const tasksRef = useRef(initialTasks);

  useEffect(() => {
    setTasks(initialTasks);
    tasksRef.current = initialTasks;
  }, [initialTasks]);

  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const boardTasks = createColumnMap(tasks);
  const activeTask = tasks.find((task) => task.id === activeTaskId) ?? null;

  const openCreateDialog = (status: TaskStatusValue) => {
    setCreateStatus(status);
    setCreateOpen(true);
  };

  const handleDragStart = (_event: DragStartEvent) => {
    setSnapshot(tasksRef.current);
  };

  const handleDragOver = (event: DragOverEvent) => {
    if (!event.over) {
      return;
    }

    setTasks((currentTasks) => moveTask(currentTasks, String(event.active.id), String(event.over?.id)));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const updates = tasksRef.current.map((task) => ({
      id: task.id,
      status: task.status,
      order: task.order,
    }));

    if (!event.over) {
      if (snapshot) {
        setTasks(snapshot);
      }
      setSnapshot(null);
      return;
    }

    const previousSnapshot = snapshot;
    setSnapshot(null);

    void (async () => {
      try {
        await updateTaskPositionsAction(updates);
      } catch (_error) {
        if (previousSnapshot) {
          setTasks(previousSnapshot);
        }
      }
    })();
  };

  const handleCreateTask = (task: TaskRecord) => {
    setTasks((currentTasks) => [...currentTasks, task]);
    setActiveTaskId(task.id);
  };

  const handleSaveTask = (updatedTask: TaskRecord) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));
    setActiveTaskId(null);
  };

  const handleDeleteTaskFromBoard = (taskId: string) => {
    const task = tasksRef.current.find((currentTask) => currentTask.id === taskId);

    if (!task) {
      return;
    }

    const confirmed = window.confirm(`Delete "${task.title}"? Its notes and task history will be removed.`);
    if (!confirmed) {
      return;
    }

    setDeletingTaskIds((currentTaskIds) => [...currentTaskIds, taskId]);

    void (async () => {
      try {
        await deleteTaskAction(taskId);
        handleDeleteTask(taskId);
      } catch (_error) {
        window.alert("Unable to delete the task right now. Please try again.");
      } finally {
        setDeletingTaskIds((currentTaskIds) => currentTaskIds.filter((currentTaskId) => currentTaskId !== taskId));
      }
    })();
  };

  return (
    <>
      <div className="space-y-8">
        <section className="rounded-[36px] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(250,243,230,0.96))] px-6 py-8 shadow-[0_24px_90px_rgba(15,23,42,0.08)] md:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">Think Board workspace</p>
              <h1 className="mt-3 font-display text-4xl tracking-tight text-slate-950 md:text-6xl">
                A Kanban board for execution with a writing room inside every task.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
                Move tasks across the delivery flow, then open any card to think in paragraphs, bullets, and structured notes without leaving the work itself.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="rounded-[24px] border border-white/80 bg-white/85 px-4 py-3 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Tasks</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{tasks.length}</p>
              </div>
              <div className="rounded-[24px] border border-white/80 bg-white/85 px-4 py-3 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Writing-ready</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                  {tasks.filter((task) => !!task.summary || !!extractPlainText(task.content)).length}
                </p>
              </div>
              <Button className="rounded-full px-6" onClick={() => openCreateDialog("IDEATION")}>
                <Plus className="mr-2 h-4 w-4" />
                New task
              </Button>
            </div>
          </div>
        </section>

        <section className="rounded-[36px] border border-white/70 bg-white/70 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.06)] backdrop-blur">
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Execution board</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Drag cards between columns as work matures, then open the detail panel whenever a task needs deeper thinking.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-stone-100 px-4 py-2 text-sm text-slate-600">
              <ArrowRightLeft className="h-4 w-4" />
              <span>Drag between Ideation, To Do, In Progress, Implemented, and Go Live.</span>
            </div>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="grid gap-4 xl:grid-cols-5 md:grid-cols-2">
              {TASK_STATUSES.map((status, index) => (
                <motion.div
                  key={status}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.35 }}
                >
                  <BoardColumn
                    status={status}
                    tasks={boardTasks[status]}
                    onCreateTask={openCreateDialog}
                    onOpenTask={setActiveTaskId}
                    onDeleteTask={handleDeleteTaskFromBoard}
                    deletingTaskIds={deletingTaskIds}
                  />
                </motion.div>
              ))}
            </div>
          </DndContext>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {TASK_STATUSES.map((status) => (
            <div key={status} className="rounded-[28px] border border-white/70 bg-white/70 p-5 shadow-[0_14px_45px_rgba(15,23,42,0.05)]">
              <div className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {TASK_STATUS_META[status].label}
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{TASK_STATUS_META[status].description}</p>
            </div>
          ))}
          <div className="rounded-[28px] border border-dashed border-stone-300 bg-stone-50/70 p-5 shadow-[0_14px_45px_rgba(15,23,42,0.05)]">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              <BookOpen className="h-3.5 w-3.5" />
              <span>Paired with docs</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Use the documentation section for durable playbooks and evergreen notes after a task graduates from active exploration.
            </p>
          </div>
        </section>
      </div>

      <CreateTaskDialog
        open={createOpen}
        defaultStatus={createStatus}
        onOpenChange={setCreateOpen}
        onCreated={handleCreateTask}
      />

      <AnimatePresence>
        <TaskDetailDialog
          task={activeTask}
          open={!!activeTask}
          onOpenChange={(open) => {
            if (!open) {
              setActiveTaskId(null);
            }
          }}
          onSaved={handleSaveTask}
          onDeleted={handleDeleteTask}
        />
      </AnimatePresence>
    </>
  );
}
