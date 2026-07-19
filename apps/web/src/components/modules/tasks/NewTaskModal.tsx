"use client";

import { useState, useEffect } from "react";
import { tasksApi, Task } from "@/lib/api/tasks";
import { apiClient } from "@/lib/api/client";
import { X } from "lucide-react";
import toast from "react-hot-toast";

export function NewTaskModal({
  isOpen,
  onClose,
  onTaskCreated,
  projectId,
  projectMembers = [],
  projects = [],
  userRole,
  isQa = false
}: {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: (task: Task) => void;
  projectId?: string;
  projectMembers?: any[];
  projects?: any[];
  userRole?: string | null;
  isQa?: boolean;
}) {
  const defaultType = isQa ? "BUG" : (userRole === 'TEAM_LEAD' && !['MANAGER', 'CTO', 'SUPER_ADMIN'].includes(userRole || '')) ? "DAILY_TASK" : "TASK";

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: defaultType,
    priority: "MEDIUM",
    assigneeId: "",
    selectedProjectId: projectId === "MY_TASKS" ? "" : (projectId || "")
  });
  
  const [localMembers, setLocalMembers] = useState<any[]>(projectMembers);

  useEffect(() => {
    if (formData.selectedProjectId) {
      apiClient.get(`/projects/${formData.selectedProjectId}`).then(res => {
        if (res.data && res.data.assignments) {
          setLocalMembers(res.data.assignments.map((a: any) => a.employee).filter(Boolean));
        }
      }).catch(err => {
        console.error("Failed to fetch project members", err);
        setLocalMembers([]);
      });
    } else {
      setLocalMembers(projectMembers);
    }
  }, [formData.selectedProjectId, projectMembers]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const newTask = await tasksApi.createTask({
        title: formData.title,
        description: formData.description,
        type: formData.type as any,
        priority: formData.priority as any,
        assigneeId: formData.assigneeId || undefined,
        projectId: formData.selectedProjectId || undefined
      });
      toast.success("Task created successfully!");
      // Ensure the task has required fields for the Kanban board to render it properly
      const safeTask = {
        ...newTask,
        status: newTask?.status || "TODO",
        id: newTask?.id || Date.now().toString()
      };
      onTaskCreated(safeTask);
      onClose();
    } catch (err: any) {
      toast.error(`Failed to create task: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-lg p-6 bg-white rounded-xl shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {formData.type === "BUG" ? "Log a Bug" : "Create Task"}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {/* Show everything to managers or CTO */}
              {['MANAGER', 'CTO', 'SUPER_ADMIN', 'CEO'].includes(userRole || '') ? (
                <>
                  <option value="TASK">Task</option>
                  <option value="STORY">Story</option>
                  <option value="BUG">Bug</option>
                  <option value="EPIC">Epic</option>
                  <option value="DAILY_TASK">Daily Task</option>
                  <option value="WEEKLY_TASK_SHEET">Weekly Task Sheet</option>
                </>
              ) : isQa ? (
                <>
                  <option value="BUG">Bug</option>
                </>
              ) : userRole === 'TEAM_LEAD' ? (
                <>
                  <option value="DAILY_TASK">Daily Task</option>
                  <option value="WEEKLY_TASK_SHEET">Weekly Task Sheet</option>
                </>
              ) : (
                <option value="TASK">Task</option>
              )}
            </select>
          </div>

          {projectId === "MY_TASKS" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Project</label>
              <select
                value={formData.selectedProjectId}
                onChange={(e) => setFormData({ ...formData, selectedProjectId: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">None (Generic Task)</option>
                {projects?.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="E.g. Fix login issue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Describe the issue or task..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700">Assign To</label>
              <select
                value={formData.assigneeId}
                onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Unassigned (Self)</option>
                {localMembers && localMembers.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.firstName} {member.lastName} {member.designation?.title ? `- ${member.designation.title}` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
