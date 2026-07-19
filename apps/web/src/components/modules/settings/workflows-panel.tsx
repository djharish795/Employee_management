"use client";

import { usePermissions } from "@/hooks/use-permissions";
import React, { useState, useEffect } from "react";
import { Workflow, ArrowRight, FileCheck, Save, Plus, Trash2 } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import toast from "react-hot-toast";

interface Step {
  approverRoleId: string;
}

export default function WorkflowsPanel() {
  const { canManageSettings: canManage } = usePermissions();
  
  const [standardSteps, setStandardSteps] = useState<Step[]>([]);
  const [emergencySteps, setEmergencySteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchMatrix = async () => {
      try {
        const res = await apiClient.get("/settings/matrix");
        const data = res.data || [];
        
        const standard = data
          .filter((m: any) => m.requesterRoleId === "EMPLOYEE" && !m.isEmergency)
          .sort((a: any, b: any) => a.stepOrder - b.stepOrder)
          .map((m: any) => ({ approverRoleId: m.approverRoleId }));
          
        const emergency = data
          .filter((m: any) => m.requesterRoleId === "EMPLOYEE" && m.isEmergency)
          .sort((a: any, b: any) => a.stepOrder - b.stepOrder)
          .map((m: any) => ({ approverRoleId: m.approverRoleId }));

        setStandardSteps(standard.length > 0 ? standard : [{ approverRoleId: "TL" }, { approverRoleId: "MANAGER" }, { approverRoleId: "HRE" }]);
        setEmergencySteps(emergency.length > 0 ? emergency : [{ approverRoleId: "CTO" }, { approverRoleId: "CEO" }]);
      } catch (err) {
        toast.error("Failed to load workflows.");
      } finally {
        setLoading(false);
      }
    };
    fetchMatrix();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const matrixData = [
        ...standardSteps.map((s, i) => ({ requesterRoleId: "EMPLOYEE", stepOrder: i + 1, approverRoleId: s.approverRoleId, isEmergency: false })),
        ...emergencySteps.map((s, i) => ({ requesterRoleId: "EMPLOYEE", stepOrder: i + 1, approverRoleId: s.approverRoleId, isEmergency: true }))
      ];
      
      await apiClient.put("/settings/matrix", matrixData);
      toast.success("Workflows saved successfully!");
    } catch (err) {
      toast.error("Failed to save workflows.");
    } finally {
      setSaving(false);
    }
  };

  const roleOptions = [
    { value: "TL", label: "Team Lead" },
    { value: "MANAGER", label: "Direct Manager" },
    { value: "HRE", label: "HR" },
    { value: "CTO", label: "CTO" },
    { value: "CEO", label: "CEO" }
  ];

  const getRoleLabel = (value: string) => roleOptions.find(o => o.value === value)?.label || value;

  const renderSteps = (steps: Step[], setSteps: React.Dispatch<React.SetStateAction<Step[]>>) => {
    return (
      <div className="flex flex-col md:flex-row items-center gap-4 bg-slate-50 p-6 rounded-xl border border-slate-100 flex-wrap">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-white border border-slate-300 rounded-full flex items-center justify-center text-slate-600 shadow-sm z-10">
            <FileCheck className="w-5 h-5" />
          </div>
          <div className="mt-2 text-xs font-bold text-slate-900">Employee</div>
        </div>

        {steps.map((step, idx) => (
          <React.Fragment key={idx}>
            <ArrowRight className="w-6 h-6 text-slate-300 hidden md:block" />
            <div className="w-0.5 h-6 bg-slate-300 md:hidden"></div>
            
            <div className="flex flex-col items-center relative group">
              <div className="w-12 h-12 bg-teal-50 border-2 border-teal-500 text-teal-600 rounded-full flex items-center justify-center shadow-sm z-10">
                {idx + 1}
              </div>
              <div className="mt-2 text-xs font-bold text-slate-900">
                {canManage ? (
                  <select 
                    value={step.approverRoleId}
                    onChange={(e) => {
                      const newSteps = [...steps];
                      newSteps[idx].approverRoleId = e.target.value;
                      setSteps(newSteps);
                    }}
                    className="bg-white border border-slate-200 rounded px-1 text-xs"
                  >
                    {roleOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ) : (
                  getRoleLabel(step.approverRoleId)
                )}
              </div>
              {canManage && (
                <button 
                  onClick={() => setSteps(steps.filter((_, i) => i !== idx))}
                  className="absolute -top-2 -right-2 bg-rose-100 text-rose-600 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          </React.Fragment>
        ))}

        {canManage && (
          <React.Fragment>
            <ArrowRight className="w-6 h-6 text-slate-300 hidden md:block" />
            <div className="w-0.5 h-6 bg-slate-300 md:hidden"></div>
            <button 
              onClick={() => setSteps([...steps, { approverRoleId: "HRE" }])}
              className="w-10 h-10 bg-white border border-dashed border-slate-300 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-400 shadow-sm z-10"
            >
              <Plus className="w-4 h-4" />
            </button>
          </React.Fragment>
        )}
      </div>
    );
  };

  if (loading) return <div>Loading workflows...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Workflow Configurations</h2>
          <p className="text-xs font-semibold text-slate-500">Design dynamic approval chains (Workflow Engine).</p>
        </div>
        {canManage && (
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Workflows"}
          </button>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <Workflow className="w-4 h-4 text-teal-600" />
          <h3 className="text-sm font-bold text-slate-900">Standard Leave Routing</h3>
        </div>
        <div className="p-6">
          {renderSteps(standardSteps, setStandardSteps)}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mt-6">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <Workflow className="w-4 h-4 text-rose-600" />
          <h3 className="text-sm font-bold text-slate-900">Emergency Leave Routing</h3>
        </div>
        <div className="p-6">
          {renderSteps(emergencySteps, setEmergencySteps)}
        </div>
      </div>
      
    </div>
  );
}
