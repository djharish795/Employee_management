"use client";

import { Trash2 } from "lucide-react";

import { useState, useEffect } from "react";
import { Task, tasksApi } from "@/lib/api/tasks";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { NewTaskModal } from "./NewTaskModal";
import { TaskDetailsModal } from "./TaskDetailsModal";
import { useAuthStore } from "@/store/auth";

export function TaskKanbanBoard({ initialTasks, projectId, onTaskUpdated }: { initialTasks: Task[], projectId?: string, onTaskUpdated?: (task: Task) => void }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const currentUserId = useAuthStore((state) => state.employeeId);

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const columns = [
    { id: "TODO", title: "To Do" },
    { id: "IN_PROGRESS", title: "In Progress" },
    { id: "IN_REVIEW", title: "In Review" },
    { id: "QA", title: "QA Testing" },
    { id: "DONE", title: "Done" },
    { id: "BLOCKED", title: "Blocked" }
  ];

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: Task["status"]) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    const task = tasks.find((t) => t.id === taskId);

    if (task && task.status !== targetStatus) {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: targetStatus } : t))
      );

      try {
        const updatedTask = await tasksApi.updateTask(taskId, { status: targetStatus });
        toast.success("Task status updated");
        if (onTaskUpdated) {
          onTaskUpdated({ ...task, status: targetStatus });
        }
      } catch (err) {
        toast.error("Failed to update task status");
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


  const handleDelete = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await tasksApi.deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      toast.success("Task deleted");
    } catch (err) {
      toast.error("Failed to delete task");
    }
  };

  return (
    <div className="flex flex-col h-full p-2">

      <div className="flex h-[calc(100vh-180px)] overflow-x-auto overflow-y-hidden space-x-6 pb-4">
        {columns.map((col) => (
          <div
            key={col.id}
            onDrop={(e) => handleDrop(e, col.id as any)}
            onDragOver={handleDragOver}
            className="flex flex-col gap-4 p-4 bg-gray-50 rounded-xl min-w-[320px] max-w-[320px] max-h-full overflow-y-auto"
          >
            <h2 className="text-sm font-semibold text-gray-700 uppercase">
              {col.title} ({tasks.filter((t) => t.status === col.id).length})
            </h2>

            <div className="flex flex-col gap-3">
              {tasks
                .filter((t) => t.status === col.id)
                .map((task) => {
                  const isAssignee = task.assigneeId === currentUserId;
                  return (
                  <div
                    key={task.id}
                    draggable={isAssignee}
                    onDragStart={(e) => {
                      if (isAssignee) handleDragStart(e, task.id);
                    }}
                    onClick={() => setSelectedTask(task)}
                    className={`p-4 bg-white border border-gray-200 rounded-lg shadow-sm transition-all ${
                      isAssignee ? 'cursor-grab active:cursor-grabbing hover:border-blue-300 hover:shadow-md' : 'cursor-pointer hover:border-gray-300'
                    }`}
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
                      <button 
                        onClick={() => handleDelete(task.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors ml-2"
                        title="Delete task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex mt-2">
                      <span className={`text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded border ${
                        task.type === "BUG" ? "border-red-500 text-red-600 bg-red-50" :
                        task.type === "STORY" ? "border-green-500 text-green-600 bg-green-50" :
                        task.type === "EPIC" ? "border-purple-500 text-purple-600 bg-purple-50" :
                        "border-blue-500 text-blue-600 bg-blue-50"
                      }`}>
                        {task.type}
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
                      <div className="flex items-center gap-2">
                        {(task as any).isMentioned && (
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600 border border-red-200" title="You were mentioned in a comment">
                            <span className="text-sm font-bold">@</span>
                          </div>
                        )}
                        {task.assignee && (
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                            {task.assignee.firstName[0]}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      <NewTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        projectId={projectId}
        onTaskCreated={(newTask) => setTasks((prev) => {
          const exists = prev.some(t => t.id === newTask.id);
          return exists ? prev : [newTask, ...prev];
        })}
      />

      <TaskDetailsModal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
        onTaskUpdated={(updatedTask) => {
          setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
          setSelectedTask(updatedTask);
        }}
      />
    </div>
  );
}
