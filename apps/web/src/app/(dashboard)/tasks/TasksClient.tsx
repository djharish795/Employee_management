"use client";

import { useEffect, useState } from "react";
import { Task, tasksApi } from "@/lib/api/tasks";
import { Loader2 } from "lucide-react";
import { TaskKanbanBoard } from "@/components/modules/tasks/TaskKanbanBoard";

export function TasksClient() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tasksApi.getMyTasks()
      .then(setTasks)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return <TaskKanbanBoard initialTasks={tasks} />;
}
