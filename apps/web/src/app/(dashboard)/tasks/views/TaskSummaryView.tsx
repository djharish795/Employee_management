"use client";

import { Task } from "@/lib/api/tasks";
import { CheckCircle2, CircleDashed, Clock, ListTodo } from "lucide-react";

export function TaskSummaryView({ tasks }: { tasks: Task[] }) {
  const todoCount = tasks.filter(t => t.status === "TODO").length;
  const inProgressCount = tasks.filter(t => t.status === "IN_PROGRESS").length;
  const inReviewCount = tasks.filter(t => ["IN_REVIEW", "QA"].includes(t.status)).length;
  const doneCount = tasks.filter(t => t.status === "DONE").length;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Project Summary</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
            <ListTodo className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">To Do</p>
            <p className="text-2xl font-bold text-gray-900">{todoCount}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="bg-yellow-100 p-3 rounded-lg text-yellow-600">
            <CircleDashed className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">In Progress</p>
            <p className="text-2xl font-bold text-gray-900">{inProgressCount}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="bg-purple-100 p-3 rounded-lg text-purple-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">In Review / QA</p>
            <p className="text-2xl font-bold text-gray-900">{inReviewCount}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="bg-green-100 p-3 rounded-lg text-green-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Done</p>
            <p className="text-2xl font-bold text-gray-900">{doneCount}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-sm font-medium text-gray-900">Recent Activity</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {tasks.slice(0, 5).map(task => (
            <div key={task.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-medium px-2.5 py-0.5 rounded bg-gray-100 text-gray-800">
                  {task.issueKey || "TASK"}
                </span>
                <p className="text-sm font-medium text-gray-900">{task.title}</p>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                task.status === "DONE" ? "bg-green-100 text-green-800" :
                task.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-800" :
                "bg-gray-100 text-gray-800"
              }`}>
                {task.status.replace("_", " ")}
              </span>
            </div>
          ))}
          {tasks.length === 0 && (
            <div className="p-8 text-center text-gray-500">No tasks in this workspace yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
