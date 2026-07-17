"use client";

import React, { useState, useEffect } from "react";
import { WorkflowInstance, workflowsApi } from "@/lib/api/workflows";
import { Loader2, Kanban, GripVertical, AlertCircle, CheckCircle, Clock } from "lucide-react";
import toast from "react-hot-toast";

type ColumnStatus = WorkflowInstance["status"];

const COLUMNS: { id: ColumnStatus; label: string; color: string }[] = [
  { id: "PENDING", label: "Pending", color: "bg-slate-100 border-slate-200" },
  { id: "IN_PROGRESS", label: "In Progress", color: "bg-blue-50 border-blue-200" },
  { id: "APPROVED", label: "Completed", color: "bg-emerald-50 border-emerald-200" },
  { id: "CANCELLED", label: "Cancelled", color: "bg-red-50 border-red-200" },
];

export function HrWorkflowKanbanBoard() {
  const [workflows, setWorkflows] = useState<WorkflowInstance[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Drag state
  const [draggedItem, setDraggedItem] = useState<WorkflowInstance | null>(null);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const data = await workflowsApi.getKanbanWorkflows();
      setWorkflows(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load workflows");
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, item: WorkflowInstance) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, statusId: ColumnStatus) => {
    e.preventDefault();
    if (!draggedItem) return;

    if (draggedItem.status === statusId) {
      setDraggedItem(null);
      return;
    }

    // Optimistic UI update
    setWorkflows(prev => 
      prev.map(wf => 
        wf.id === draggedItem.id ? { ...wf, status: statusId } : wf
      )
    );
    
    try {
      await workflowsApi.updateStatus(draggedItem.id, statusId);
      toast.success("Workflow status updated");
    } catch (err) {
      toast.error("Failed to update status");
      // Revert on failure
      fetchWorkflows();
    } finally {
      setDraggedItem(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full font-sans overflow-y-auto">
      <div className="p-8 max-w-[1400px] mx-auto w-full h-full flex flex-col space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-2">
          <div>
            <div className="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-1 flex items-center gap-2">
              <span className="text-slate-500">EMS</span> / <span className="text-slate-500">WORKFLOWS</span> / OVERVIEW
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              HR Workflow Tracker
            </h1>
            <p className="text-slate-500 font-medium mt-2">
              Drag and drop workflows to track employee onboarding, offboarding, and process status.
            </p>
          </div>
        </div>

        {/* Board Container */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 flex-1 flex flex-col min-h-0">
          <div className="flex-1 flex gap-6 overflow-x-auto pb-4 h-full">
            {COLUMNS.map(col => {
              const colItems = workflows.filter(w => w.status === col.id);
          
          return (
            <div 
              key={col.id}
              className={`flex-shrink-0 w-80 rounded-2xl border-2 flex flex-col bg-slate-50 ${col.color}`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white rounded-t-xl">
                <h3 className="font-bold text-slate-700">{col.label}</h3>
                <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-xs font-bold">
                  {colItems.length}
                </span>
              </div>
              
              <div className="p-4 flex-1 flex flex-col gap-3 overflow-y-auto">
                {colItems.map(item => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm cursor-grab active:cursor-grabbing hover:border-blue-300 transition-colors group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider rounded-md">
                        {item.workflow.type}
                      </span>
                      <GripVertical className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    
                    <h4 className="font-bold text-slate-900 text-sm mb-1">
                      {item.initiatedBy.firstName} {item.initiatedBy.lastName}
                    </h4>
                    <p className="text-xs text-slate-500 truncate mb-3">
                      {item.initiatedBy.officialEmail}
                    </p>
                    
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      Updated {new Date(item.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}

                {colItems.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                    <span className="text-sm font-medium">Drop here</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
          </div>
        </div>
      </div>
    </div>
  );
}
