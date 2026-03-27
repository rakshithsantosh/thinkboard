import { prisma } from "@/lib/prisma";
import { serializeTask } from "@/lib/editor";

export async function getBoardTasks() {
  const tasks = await prisma.task.findMany({
    orderBy: [{ status: "asc" }, { order: "asc" }, { updatedAt: "desc" }],
  });

  return tasks.map(serializeTask);
}
