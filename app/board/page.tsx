import { ThinkBoardView } from "@/components/board/ThinkBoardView";
import { getBoardTasks } from "@/lib/queries/tasks";

export const dynamic = "force-dynamic";

export default async function BoardPage() {
  const tasks = await getBoardTasks();

  return <ThinkBoardView initialTasks={tasks} />;
}
