"use server";

import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { EMPTY_RICH_TEXT_DOCUMENT, serializeTask } from "@/lib/editor";
import { TASK_STATUSES, type TaskStatusValue } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

type TaskWriteInput = {
  id: string;
  title: string;
  summary?: string | null;
  status: TaskStatusValue;
  content: unknown;
};

type TaskPositionInput = {
  id: string;
  status: TaskStatusValue;
  order: number;
};

function normalizeTitle(title: string) {
  const normalized = title.trim();

  if (!normalized) {
    throw new Error("A task title is required.");
  }

  return normalized.slice(0, 180);
}

function normalizeSummary(summary?: string | null) {
  const normalized = summary?.trim() ?? "";
  return normalized ? normalized.slice(0, 280) : null;
}

function assertStatus(status: string): TaskStatusValue {
  if (!TASK_STATUSES.includes(status as TaskStatusValue)) {
    throw new Error("Invalid task status.");
  }

  return status as TaskStatusValue;
}

export async function createTaskAction(input: {
  title: string;
  summary?: string | null;
  status: TaskStatusValue;
}) {
  const status = assertStatus(input.status);
  const title = normalizeTitle(input.title);
  const summary = normalizeSummary(input.summary);

  const lastTask = await prisma.task.findFirst({
    where: { status },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  const task = await prisma.task.create({
    data: {
      title,
      summary,
      status,
      order: (lastTask?.order ?? -1) + 1,
      content: EMPTY_RICH_TEXT_DOCUMENT as Prisma.InputJsonValue,
    },
  });

  revalidatePath("/board");
  return serializeTask(task);
}

export async function updateTaskAction(input: TaskWriteInput) {
  const title = normalizeTitle(input.title);
  const summary = normalizeSummary(input.summary);
  const nextStatus = assertStatus(input.status);

  const existingTask = await prisma.task.findUnique({
    where: { id: input.id },
    select: { status: true, order: true },
  });

  if (!existingTask) {
    throw new Error("Task not found.");
  }

  let nextOrder = existingTask.order;
  if (existingTask.status !== nextStatus) {
    const lastTask = await prisma.task.findFirst({
      where: { status: nextStatus },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    nextOrder = (lastTask?.order ?? -1) + 1;
  }

  const task = await prisma.task.update({
    where: { id: input.id },
    data: {
      title,
      summary,
      status: nextStatus,
      order: nextOrder,
      content: (input.content ?? EMPTY_RICH_TEXT_DOCUMENT) as Prisma.InputJsonValue,
    },
  });

  revalidatePath("/board");
  return serializeTask(task);
}

export async function updateTaskPositionsAction(updates: TaskPositionInput[]) {
  for (const update of updates) {
    assertStatus(update.status);
  }

  await prisma.$transaction(
    updates.map((update) =>
      prisma.task.update({
        where: { id: update.id },
        data: {
          status: update.status,
          order: update.order,
        },
      })
    )
  );

  revalidatePath("/board");
}

export async function deleteTaskAction(taskId: string) {
  await prisma.task.delete({
    where: { id: taskId },
  });

  revalidatePath("/board");
}
