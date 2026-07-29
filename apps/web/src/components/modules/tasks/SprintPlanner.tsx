"use client";

import { useState, useEffect } from "react";
import { Task, Sprint, tasksApi } from "@/lib/api/tasks";
import toast from "react-hot-toast";

export function SprintPlanner({ projectId }: { projectId: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [t, s] = await Promise.all([
        tasksApi.getProjectTasks(projectId),
        tasksApi.getProjectSprints(projectId)
      ]);
      setTasks(t);
      setSprints(s);
    } catch (error) {
      toast.error("Failed to load sprint data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const handleCreateSprint = async () => {
    try {
      const name = prompt("Enter sprint name (e.g. Sprint 1)");
      if (!name) return;
      // Default to a 2 week sprint starting today
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 14);

      await tasksApi.createSprint(projectId, {
        name,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      toast.success("Sprint created");
      fetchData();
    } catch (err) {
      toast.error("Failed to create sprint");
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDrop = async (e: React.DragEvent, sprintId: string | null) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    
    // Optimistic
    setTasks((prev) => prev.map(t => t.id === taskId ? { ...t, sprintId: sprintId || undefined } : t));

    try {
      await tasksApi.updateTask(taskId, { sprintId: sprintId || undefined });
      toast.success("Task moved");
    } catch (err) {
      toast.error("Failed to move task");
      fetchData(); // Revert
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading planner...</div>;

  const backlogTasks = tasks.filter(t => !t.sprintId);

  return (
    <div className="flex h-[calc(100vh-180px)] gap-6 p-6">
      {/* Backlog Column */}
      <div 
        className="flex-1 bg-gray-50 rounded-xl p-4 flex flex-col max-h-full overflow-hidden border border-gray-200"
        onDrop={(e) => handleDrop(e, null)}
        onDragOver={(e) => e.preventDefault()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Backlog ({backlogTasks.length})</h2>
        </div>
        <div className="overflow-y-auto space-y-3 flex-1">
          {backlogTasks.map(task => (
            <div 
              key={task.id} 
              draggable 
              onDragStart={(e) => handleDragStart(e, task.id)}
              className="p-3 bg-white border border-gray-200 rounded shadow-sm cursor-grab"
            >
              <div className="font-medium">{task.title}</div>
              <div className="text-xs text-gray-500 mt-1">{task.type} • {task.priority}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sprints Column */}
      <div className="flex-[2] flex flex-col gap-6 overflow-y-auto pr-2">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">Sprints</h2>
          <button 
            onClick={handleCreateSprint}
            className="px-3 py-1.5 text-sm bg-slate-900 text-white font-medium rounded hover:bg-slate-800"
          >
            + Create Sprint
          </button>
        </div>

        {sprints.length === 0 ? (
          <div className="text-center p-8 bg-gray-50 rounded-lg text-gray-500 border border-dashed border-gray-300">
            No sprints planned yet. Create your first sprint!
          </div>
        ) : (
          sprints.map(sprint => {
            const sprintTasks = tasks.filter(t => t.sprintId === sprint.id);
            return (
              <div 
                key={sprint.id} 
                className="bg-gray-50 border border-gray-200 rounded-xl p-4"
                onDrop={(e) => handleDrop(e, sprint.id)}
                onDragOver={(e) => e.preventDefault()}
              >
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900">{sprint.name}</h3>
                    <p className="text-xs text-gray-500">
                      {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded font-bold uppercase ${sprint.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                    {sprint.status}
                  </span>
                </div>
                
                <div className="min-h-[100px] border-2 border-dashed border-gray-300 rounded-lg p-2 space-y-2">
                  {sprintTasks.length === 0 ? (
                    <div className="text-center text-sm text-gray-400 py-4">Drag tasks here</div>
                  ) : (
                    sprintTasks.map(task => (
                      <div 
                        key={task.id} 
                        draggable 
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        className="p-3 bg-white border border-gray-200 rounded shadow-sm cursor-grab flex justify-between items-center"
                      >
                        <div>
                          <div className="font-medium text-sm">{task.title}</div>
                          <div className="text-xs text-gray-500">{task.type} • {task.priority}</div>
                        </div>
                        {task.assignee && (
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                            {task.assignee.firstName[0]}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
