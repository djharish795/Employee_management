"use client";
import { usePermissions } from "@/hooks/use-permissions";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Building2, Users, Briefcase, Plus, MoreHorizontal, Edit2, Trash2, UserCheck, UserX, X } from "lucide-react";
import { OrgRole, DepartmentNode } from "@/types/org-chart";

interface DepartmentsPanelProps {

}
import { fetchDepartments, updateDepartment } from "@/lib/api/organization";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";

export default function DepartmentsPanel() {
  const { role } = usePermissions();
  const activeRole = role as any;
  const canManage = activeRole === "ADMIN" || activeRole === "HR";
  const queryClient = useQueryClient();

  // State for Dropdown and Modals
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<"edit" | "delete" | "assign" | null>(null);
  const [selectedDept, setSelectedDept] = useState<DepartmentNode | null>(null);
  const [editName, setEditName] = useState("");
  const [editHeadId, setEditHeadId] = useState("");

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => updateDepartment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      setActiveModal(null);
      setSelectedDept(null);
    }
  });

  const { data: rawDepartments } = useQuery({
    queryKey: ["departments"],
    queryFn: fetchDepartments,
  });

  const departments: DepartmentNode[] = rawDepartments?.map((d: any) => ({
    id: d.id,
    name: d.name,
    headId: d.headId || null,
    head: d.head ? {
      name: `${d.head.firstName || ""} ${d.head.lastName || ""}`.trim() || "Unknown",
      photoUrl: d.head.photoUrl
    } : null,
    headcount: d._count?.employees || 0,
    openPositions: 0,
    budget: "N/A",
    description: `The ${d.name} department.`,
  })) || [];

  return (
    <>
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Department Overview</h2>
              <p className="text-xs font-semibold text-slate-500">{departments?.length || 0} active departments across the organization</p>
            </div>
          </div>

          {canManage && (
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors">
              <Plus className="w-4 h-4" /> Add Department
            </button>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {departments?.map((dept) => (
            <div key={dept.id} className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden group">
              {/* Dept Header */}
              <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{dept.name}</h3>
                  <p className="text-xs font-medium text-slate-500 mt-1 line-clamp-2 pr-4">{dept.description}</p>
                </div>
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenId(menuOpenId === dept.id ? null : dept.id);
                    }}
                    className="text-slate-400 hover:text-slate-700 p-1 transition-colors relative z-10 bg-white rounded-md hover:bg-slate-100"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>

                  {/* Dropdown Menu */}
                  {menuOpenId === dept.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setMenuOpenId(null); }} />
                      <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => { setMenuOpenId(null); setSelectedDept(dept); setEditName(dept.name); setActiveModal("edit"); }}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit Department
                        </button>

                        {dept.headId ? (
                          <>
                            <button
                              onClick={() => { setMenuOpenId(null); setSelectedDept(dept); setEditHeadId(dept.headId || ""); setActiveModal("assign"); }}
                              className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                            >
                              <UserCheck className="w-3.5 h-3.5" /> Change Head
                            </button>
                            <button
                              onClick={() => { setMenuOpenId(null); updateMutation.mutate({ id: dept.id, data: { headId: "" } }); }}
                              className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                            >
                              <UserX className="w-3.5 h-3.5" /> Unassign Head
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => { setMenuOpenId(null); setSelectedDept(dept); setEditHeadId(""); setActiveModal("assign"); }}
                            className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                          >
                            <UserCheck className="w-3.5 h-3.5" /> Assign Head
                          </button>
                        )}

                        <div className="border-t border-slate-100 my-1"></div>
                        <button
                          onClick={() => { setMenuOpenId(null); setSelectedDept(dept); setActiveModal("delete"); }}
                          className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 divide-x divide-slate-100 border-b border-slate-100">
                <div className="p-4 flex flex-col items-center justify-center text-center">
                  <Users className="w-4 h-4 text-indigo-500 mb-1.5" />
                  <div className="text-xl font-bold text-slate-900">{dept.headcount}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Headcount</div>
                </div>
                <div className="p-4 flex flex-col items-center justify-center text-center">
                  <Briefcase className="w-4 h-4 text-amber-500 mb-1.5" />
                  <div className="text-xl font-bold text-slate-900">{dept.openPositions}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Open Roles</div>
                </div>
              </div>

              {/* Footer / Department Head */}
              <div className="p-4 bg-white mt-auto flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="relative w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 text-xs font-bold border border-slate-200 overflow-hidden">
                    {dept.head ? (
                      <Image src={dept.head.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${dept.head.name}`} alt="Head" fill style={{ objectFit: "cover" }} />
                    ) : (
                      <Users className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Department Head</div>
                    <div className="text-xs font-bold text-slate-900">{dept.head ? dept.head.name : "Unassigned"}</div>
                  </div>
                </div>

                <Link href={`/employees?department=${encodeURIComponent(dept.name)}`} className="text-xs font-bold text-indigo-600 hover:underline">
                  View Team
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODALS */}
      {activeModal && selectedDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {activeModal === "edit" && "Edit Department"}
                {activeModal === "assign" && "Assign Department Head"}
                {activeModal === "delete" && "Delete Department"}
              </h3>
              <button
                onClick={() => { setActiveModal(null); setSelectedDept(null); }}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5">
              {activeModal === "edit" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Department Name</label>
                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Description (Not stored in backend yet)</label>
                    <textarea defaultValue={selectedDept.description} rows={3} disabled className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"></textarea>
                  </div>
                </div>
              )}

              {activeModal === "assign" && (
                <div className="space-y-4">
                  <p className="text-sm font-medium text-slate-600">Select a new head for the <strong className="text-slate-900">{selectedDept.name}</strong> department.</p>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Employee ID (e.g. EMP-101)</label>
                    <input type="text" value={editHeadId} onChange={(e) => setEditHeadId(e.target.value)} placeholder="Type an Employee ID..." className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                    <p className="text-[10px] font-semibold text-slate-400 mt-1.5">Leave this box completely empty and click Save Changes to unassign the current head.</p>
                  </div>
                </div>
              )}

              {activeModal === "delete" && (
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4 mx-auto">
                    <Trash2 className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-slate-600 text-center">
                    Are you sure you want to delete the <strong className="text-slate-900">{selectedDept.name}</strong> department?
                  </p>
                  <p className="text-xs font-semibold text-rose-600 text-center bg-rose-50 p-2 rounded-lg">
                    This action cannot be undone. All employees in this department must be reassigned first.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => { setActiveModal(null); setSelectedDept(null); }}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 bg-slate-200/30 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (activeModal === 'edit') {
                    updateMutation.mutate({ id: selectedDept.id, data: { name: editName } });
                  } else if (activeModal === 'assign') {
                    updateMutation.mutate({ id: selectedDept.id, data: { headId: editHeadId } });
                  } else {
                    // Simulate delete
                    setActiveModal(null);
                    setSelectedDept(null);
                  }
                }}
                disabled={updateMutation.isPending}
                className={`px-4 py-2 text-xs font-bold text-white rounded-lg transition-colors shadow-sm ${activeModal === 'delete' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
              >
                {updateMutation.isPending ? "Saving..." : activeModal === "delete" ? "Delete Department" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
