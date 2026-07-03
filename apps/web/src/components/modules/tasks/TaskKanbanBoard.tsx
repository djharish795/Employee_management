"use client";

import { useState } from "react";
import { Task, tasksApi } from "@/lib/api/tasks";
import toast from "react-hot-toast";
import { format } from "date-fns";

export function TaskKanbanBoard({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const columns = [
    { id: "TODO", title: "To Do" },
    { id: "IN_PROGRESS", title: "In Progress" },
    { id: "DONE", title: "Done" },
  ];

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: "TODO" | "IN_PROGRESS" | "DONE") => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    const task = tasks.find((t) => t.id === taskId);

    if (task && task.status !== targetStatus) {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: targetStatus } : t))
      );

      try {
        await tasksApi.updateStatus(taskId, targetStatus);
        toast.success("Task updated");
      } catch (err) {
        toast.error("Failed to update task");
        // Revert on failure
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: task.status } : t))
        );
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // necessary to allow dropping
  };

  return (
    <div className="flex flex-col h-full gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
        <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
          + New Task
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 h-full">
        {columns.map((col) => (
          <div
            key={col.id}
            onDrop={(e) => handleDrop(e, col.id as any)}
            onDragOver={handleDragOver}
            className="flex flex-col gap-4 p-4 bg-gray-50 rounded-xl min-h-[500px]"
          >
            <h2 className="text-sm font-semibold text-gray-700 uppercase">
              {col.title} ({tasks.filter((t) => t.status === col.id).length})
            </h2>

            <div className="flex flex-col gap-3">
              {tasks
                .filter((t) => t.status === col.id)
                .map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm cursor-grab active:cursor-grabbing hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium text-gray-900">{task.title}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          task.priority === "HIGH"
                            ? "bg-red-100 text-red-700"
                            : task.priority === "MEDIUM"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>
                    {task.description && (
                      <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-4 text-xs text-gray-400">
                      <span>
                        {task.createdAt
                          ? format(new Date(task.createdAt), "MMM d, yyyy")
                          : ""}
                      </span>
                      {task.assignee && (
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                          {task.assignee.firstName[0]}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
