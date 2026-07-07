"use client";

import React, { useState } from 'react';
import { Lock, MoreVertical, AlertTriangle, Plus, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { SuccessionPlanDto } from '@naprocs/types';

export function SuccessionClient() {
  const role = useAuthStore((state) => state.role);
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRoleTitle, setNewRoleTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  const [isAddSuccessorModalOpen, setIsAddSuccessorModalOpen] = useState(false);
  const [targetRoleTitle, setTargetRoleTitle] = useState("");
  const [newSuccessorId, setNewSuccessorId] = useState("");
  const [newReadiness, setNewReadiness] = useState("DEVELOPING");
  const [newGap, setNewGap] = useState("");
  const [newDevPlan, setNewDevPlan] = useState("");

  const { data: employeesData } = useQuery({
    queryKey: ['employees-list'],
    queryFn: async () => {
      const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
      const res = await fetch(`${url}/employees?limit=100`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) {
        console.error("Failed to fetch employees. Status:", res.status);
        try {
          const errData = await res.json();
          console.error("Error data:", errData);
        } catch(e) {}
        return { data: [] };
      }
      return res.json();
    }
  });
  
  const employees = Array.isArray(employeesData?.data) 
    ? employeesData.data 
    : (Array.isArray(employeesData) ? employeesData : []);

  const { data: plans, isLoading } = useQuery<SuccessionPlanDto[]>({
    queryKey: ['succession-plans'],
    queryFn: async () => {
      const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
      const res = await fetch(`${url}/succession`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error('Failed to fetch succession plans');
      return res.json();
    }
  });

  if (role !== "CEO" && role !== "CHRO" && role !== "SUPER_ADMIN" && role !== "HR") {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-slate-500 min-h-[500px]">
        <Lock className="w-10 h-10 text-slate-300 mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Access Restricted</h2>
        <p className="mt-2 text-sm font-medium">You do not have permission to view Succession Planning.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const handleAddRole = async () => {
    if (!newRoleTitle.trim()) return;
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
      const res = await fetch(`${url}/succession`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          roleTitle: newRoleTitle.trim(),
          readinessLevel: "DEVELOPING"
        })
      });
      
      if (res.ok) {
        setIsAddModalOpen(false);
        setNewRoleTitle("");
        queryClient.invalidateQueries({ queryKey: ['succession-plans'] });
      } else {
        const data = await res.json();
        setErrorMsg(data.message || "Failed to add position.");
      }
    } catch (e) {
      console.error(e);
      setErrorMsg("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRole = async (roleTitle: string, plansToDelete: any[]) => {
    setActiveDropdown(null);
    if (!confirm(`Are you sure you want to delete the position tracking for ${roleTitle}?`)) return;
    try {
      const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
      // Real plans have a real ID, mock plans start with 'm' or might not exist in backend
      const realPlans = plansToDelete.filter(p => p.id && !p.id.toString().startsWith('m'));
      
      for (const p of realPlans) {
        await fetch(`${url}/succession/${p.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` }
        });
      }
      queryClient.invalidateQueries({ queryKey: ['succession-plans'] });
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddSuccessor = async () => {
    if (!newSuccessorId || !targetRoleTitle) return;
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
      const res = await fetch(`${url}/succession`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          roleTitle: targetRoleTitle,
          successorId: newSuccessorId,
          readinessLevel: newReadiness,
          gapAnalysis: newGap.trim() || undefined,
          developmentPlan: newDevPlan.trim() || undefined
        })
      });
      
      if (res.ok) {
        setIsAddSuccessorModalOpen(false);
        setNewSuccessorId("");
        setNewGap("");
        setNewDevPlan("");
        setNewReadiness("DEVELOPING");
        queryClient.invalidateQueries({ queryKey: ['succession-plans'] });
      } else {
        const data = await res.json();
        setErrorMsg(data.message || "Failed to add successor.");
      }
    } catch (e) {
      console.error(e);
      setErrorMsg("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group by role from backend
  const apiRoles = plans?.reduce((acc: any, plan) => {
    if (!acc[plan.roleTitle]) {
      acc[plan.roleTitle] = {
        roleTitle: plan.roleTitle,
        incumbent: plan.incumbent,
        successors: []
      };
    }
    acc[plan.roleTitle].successors.push(plan);
    return acc;
  }, {}) || {};

  const apiRoleList = Object.values(apiRoles);

  const mockRoleList = [
    {
      roleTitle: "Chief Technology Officer",
      incumbent: { firstName: "Lokesh", lastName: "" },
      successors: [
        {
          id: "m1",
          successor: { firstName: "Ravi", lastName: "", designation: { title: "VP Engineering" } },
          readinessLevel: "READY_NOW",
          gapAnalysis: "None. Ready to take over.",
          developmentPlan: "Shadow CTO for 1 month.",
          kpis: ["System Uptime > 99.99%", "Team Velocity +20%", "Tech Debt < 5%"]
        },
        {
          id: "m2",
          successor: { firstName: "Karthik", lastName: "S.", designation: { title: "Director Engineering" } },
          readinessLevel: "DEVELOPING",
          gapAnalysis: "Needs more executive presence.",
          developmentPlan: "Leadership coaching in Q3.",
          kpis: ["Delivery Timeline Met", "Architecture Scalability"]
        }
      ]
    },
    {
      roleTitle: "Chief Revenue Officer",
      incumbent: { firstName: "Ramesh", lastName: "P." },
      successors: [
        {
          id: "m3",
          successor: { firstName: "Suresh", lastName: "Kumar", designation: { title: "VP Sales" } },
          readinessLevel: "READY_1_YEAR",
          gapAnalysis: "Needs international market exposure.",
          developmentPlan: "Lead APAC expansion project.",
          kpis: ["ARR Growth +40%", "CAC Decrease -10%"]
        }
      ]
    }
  ];

  // Merge mock data with real data to prevent empty screens
  const roleList = apiRoleList.length > 0 ? [...apiRoleList, ...mockRoleList.filter(m => !apiRoles[(m as any).roleTitle])] : mockRoleList;

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const getReadinessColor = (level: string) => {
    switch (level) {
      case 'READY_NOW': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'READY_1_YEAR': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      case 'READY_2_YEARS': return 'bg-orange-50 text-orange-700 border-orange-100';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getReadinessText = (level: string) => {
    return level.replace(/_/g, ' ');
  };

  return (
    <div className="flex flex-col h-full font-sans bg-slate-50">
      <div className="p-8 max-w-[1400px] mx-auto w-full space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Executive Succession Overview</h1>
            <div className="flex items-center gap-4 mt-3">
              <span className="px-3 py-1 bg-slate-200 text-slate-700 text-xs font-bold rounded-full">
                {roleList.length} critical positions tracked
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 text-sm font-bold text-white bg-slate-900 rounded-lg shadow-sm hover:bg-slate-800 transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Role
            </button>
          </div>
        </div>

        {roleList.length === 0 ? (
          <div className="text-center p-12 bg-white border border-slate-200 rounded-xl">
            <p className="text-slate-500 font-medium">No succession plans configured yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {roleList.map((r: any, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">POSITION</h4>
                    <h3 className="text-base font-bold text-slate-900">{r.roleTitle}</h3>
                  </div>
                  <div className="relative">
                    <button 
                      onClick={() => setActiveDropdown(activeDropdown === r.roleTitle ? null : r.roleTitle)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    {activeDropdown === r.roleTitle && (
                      <>
                        <div 
                          className="fixed inset-0 z-0" 
                          onClick={() => setActiveDropdown(null)}
                        />
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-10 overflow-hidden">
                          <button 
                            onClick={() => handleDeleteRole(r.roleTitle, r.successors)}
                            className="w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 relative"
                          >
                            Delete Position
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mb-8">
                  {r.incumbent ? (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center text-sm font-bold shrink-0">
                        {getInitials(r.incumbent.firstName, r.incumbent.lastName)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{r.incumbent.firstName} {r.incumbent.lastName}</div>
                        <div className="text-[11px] font-medium text-slate-500">Incumbent</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm font-medium text-amber-600 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> Position is vacant
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      SUCCESSION PIPELINE ({r.successors.length})
                    </h4>
                    <button 
                      onClick={() => {
                        setTargetRoleTitle(r.roleTitle);
                        setIsAddSuccessorModalOpen(true);
                      }}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-700 uppercase"
                    >
                      + Add
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {r.successors.map((succ: SuccessionPlanDto) => (
                      <div key={succ.id} className="flex flex-col gap-2 p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold">
                              {getInitials(succ.successor?.firstName, succ.successor?.lastName)}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-900">{succ.successor?.firstName} {succ.successor?.lastName}</div>
                              <div className="text-[10px] font-medium text-slate-500">{succ.successor?.designation?.title || 'Employee'}</div>
                            </div>
                          </div>
                          <span className={`px-2 py-1 text-[9px] font-bold uppercase tracking-widest rounded border ${getReadinessColor(succ.readinessLevel)}`}>
                            {getReadinessText(succ.readinessLevel)}
                          </span>
                        </div>
                        {succ.gapAnalysis && (
                          <div className="bg-slate-50 rounded p-2 mt-1">
                            <p className="text-[10px] text-slate-600"><span className="font-bold">Gap:</span> {succ.gapAnalysis}</p>
                          </div>
                        )}
                        {succ.developmentPlan && (
                          <div className="bg-slate-50 rounded p-2 mt-1">
                            <p className="text-[10px] text-slate-600"><span className="font-bold">Plan:</span> {succ.developmentPlan}</p>
                          </div>
                        )}
                        {(succ as any).kpis && (succ as any).kpis.length > 0 && (
                          <div className="bg-slate-50 rounded p-2 mt-1">
                            <p className="text-[10px] text-slate-600"><span className="font-bold">KPIs:</span> {(succ as any).kpis.join(" • ")}</p>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {r.successors.length === 0 && (
                      <div className="border border-dashed border-rose-300 bg-rose-50/50 rounded-lg p-6 flex flex-col items-center justify-center text-center">
                        <span className="px-3 py-1 bg-rose-100 text-rose-700 text-[9px] font-bold uppercase tracking-widest rounded mb-3">
                          NO SUCCESSION PLAN IDENTIFIED
                        </span>
                        <p className="text-xs font-medium text-slate-500">
                          Critical risk: No ready or developing successors currently logged.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Track New Position</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Role Title</label>
                <input 
                  type="text" 
                  value={newRoleTitle}
                  onChange={(e) => setNewRoleTitle(e.target.value)}
                  placeholder="e.g. Chief Marketing Officer"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
                {errorMsg && (
                  <p className="text-xs text-red-500 font-medium mt-2 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> {errorMsg}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-lg"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddRole}
                disabled={isSubmitting || !newRoleTitle.trim()}
                className="px-4 py-2 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Add Position
              </button>
            </div>
          </div>
        </div>
      )}

      {isAddSuccessorModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Add Successor to {targetRoleTitle}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Select Employee</label>
                <select 
                  value={newSuccessorId}
                  onChange={(e) => setNewSuccessorId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                >
                  <option value="">-- Choose Employee --</option>
                  {employees.map((emp: any) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.designation?.title || 'Employee'})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Readiness Level</label>
                <select 
                  value={newReadiness}
                  onChange={(e) => setNewReadiness(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                >
                  <option value="READY_NOW">Ready Now</option>
                  <option value="READY_1_YEAR">Ready in 1 Year</option>
                  <option value="READY_2_YEARS">Ready in 2 Years</option>
                  <option value="DEVELOPING">Developing</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Gap Analysis (Optional)</label>
                <textarea 
                  value={newGap}
                  onChange={(e) => setNewGap(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Development Plan (Optional)</label>
                <textarea 
                  value={newDevPlan}
                  onChange={(e) => setNewDevPlan(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  rows={2}
                />
              </div>
              {errorMsg && (
                <p className="text-xs text-red-500 font-medium mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> {errorMsg}
                </p>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button 
                onClick={() => setIsAddSuccessorModalOpen(false)}
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-lg"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddSuccessor}
                disabled={isSubmitting || !newSuccessorId}
                className="px-4 py-2 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Successor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
