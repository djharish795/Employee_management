"use client";

import React, { useState } from "react";
import { Shield, Copy, Save, AlertTriangle, Eye, Check } from "lucide-react";
import { SettingsRole, SystemModule, PermissionAction } from "@/types/settings";

interface PermissionsPanelProps {
  activeRole: SettingsRole;
}

const MODULES: { id: SystemModule; label: string }[] = [
  { id: "EMPLOYEES", label: "Employee Directory" },
  { id: "ATTENDANCE", label: "Attendance & Time" },
  { id: "LEAVES", label: "Leave Management" },
  { id: "ASSETS", label: "Asset Management" },
  { id: "PAYROLL", label: "Payroll (Phase 2)" },
  { id: "AUDIT", label: "System Audit Logs" },
  { id: "SETTINGS", label: "Enterprise Settings" },
];

const ACTIONS: PermissionAction[] = ["READ", "WRITE", "DELETE", "APPROVE", "MANAGE"];

const ROLES = ["CEO", "HR Admin", "IT Admin", "Manager", "Employee", "Compliance Officer"];

export default function PermissionsPanel({ activeRole }: PermissionsPanelProps) {
  const canManageRBAC = ["SUPER_ADMIN", "ADMIN"].includes(activeRole);
  
  // Create a complex bitmask-like simulation state for checkboxes
  const [matrixState, setMatrixState] = useState<Record<string, boolean>>({
    // Pre-seed some mock data: [ROLE]_[MODULE]_[ACTION]
    "CEO_EMPLOYEES_READ": true, "CEO_ATTENDANCE_READ": true, "CEO_LEAVES_READ": true, "CEO_PAYROLL_READ": true, "CEO_AUDIT_READ": true,
    "HR Admin_EMPLOYEES_READ": true, "HR Admin_EMPLOYEES_WRITE": true, "HR Admin_EMPLOYEES_MANAGE": true, "HR Admin_LEAVES_READ": true, "HR Admin_LEAVES_APPROVE": true,
    "IT Admin_ASSETS_READ": true, "IT Admin_ASSETS_WRITE": true, "IT Admin_ASSETS_MANAGE": true, "IT Admin_SETTINGS_READ": true, "IT Admin_SETTINGS_MANAGE": true,
    "Employee_EMPLOYEES_READ": true, "Employee_ATTENDANCE_READ": true, "Employee_ATTENDANCE_WRITE": true, "Employee_LEAVES_READ": true, "Employee_LEAVES_WRITE": true,
    "Manager_EMPLOYEES_READ": true, "Manager_ATTENDANCE_READ": true, "Manager_LEAVES_READ": true, "Manager_LEAVES_APPROVE": true,
  });

  const [hoverRow, setHoverRow] = useState<string | null>(null);
  const [hoverCol, setHoverCol] = useState<string | null>(null);

  const togglePermission = (role: string, mod: SystemModule, action: PermissionAction) => {
    if (!canManageRBAC) return;
    const key = `${role}_${mod}_${action}`;
    setMatrixState(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-600" /> Role-Based Access Control (RBAC)
          </h2>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Configure matrix of permissions for all organizational roles.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 shadow-sm transition-colors">
            <Copy className="w-3.5 h-3.5" /> Clone Role
          </button>
          <button 
            disabled={!canManageRBAC}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" /> Save Matrix
          </button>
        </div>
      </div>

      {/* ── View-Only Warning ─────────────────────────────────────────── */}
      {!canManageRBAC && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-amber-900">Read-Only Mode</h4>
            <p className="text-[10px] text-amber-700 mt-0.5">Your current admin role ({activeRole}) does not have privileges to modify RBAC mappings. Contact a Super Admin to request changes.</p>
          </div>
        </div>
      )}

      {/* ── Matrix Table ───────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b-2 border-slate-200">
            <tr>
              <th className="p-4 min-w-[200px] sticky left-0 z-20 bg-slate-50 border-r border-slate-200 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Module / Action</div>
              </th>
              {ROLES.map((role) => (
                <th 
                  key={role} 
                  className={`p-4 min-w-[120px] text-center border-r border-slate-200 last:border-0 transition-colors ${
                    hoverCol === role ? 'bg-indigo-50/50' : ''
                  }`}
                  onMouseEnter={() => setHoverCol(role)}
                  onMouseLeave={() => setHoverCol(null)}
                >
                  <div className="text-xs font-bold text-slate-900">{role}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {MODULES.map((mod) => (
              <React.Fragment key={mod.id}>
                {/* Module Header Row */}
                <tr className="bg-slate-100/50">
                  <td colSpan={ROLES.length + 1} className="px-4 py-2 text-xs font-bold text-slate-800 border-y border-slate-200">
                    {mod.label}
                  </td>
                </tr>
                
                {/* Action Rows */}
                {ACTIONS.map((action) => {
                  const rowId = `${mod.id}_${action}`;
                  return (
                    <tr 
                      key={rowId}
                      className={`transition-colors ${hoverRow === rowId ? 'bg-slate-50' : ''}`}
                      onMouseEnter={() => setHoverRow(rowId)}
                      onMouseLeave={() => setHoverRow(null)}
                    >
                      <td className="px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-wider sticky left-0 z-10 bg-white border-r border-slate-200 shadow-[2px_0_5px_rgba(0,0,0,0.02)] pl-8 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> {action}
                      </td>
                      
                      {ROLES.map((role) => {
                        const key = `${role}_${mod.id}_${action}`;
                        const isChecked = !!matrixState[key];
                        
                        return (
                          <td 
                            key={role} 
                            className={`p-0 text-center border-r border-slate-100 last:border-0 transition-colors ${
                              hoverCol === role || hoverRow === rowId ? 'bg-indigo-50/30' : ''
                            }`}
                            onMouseEnter={() => setHoverCol(role)}
                            onMouseLeave={() => setHoverCol(null)}
                          >
                            <label className={`w-full h-full flex items-center justify-center p-3 cursor-pointer ${!canManageRBAC && 'cursor-not-allowed opacity-70'}`}>
                              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                                isChecked 
                                  ? canManageRBAC ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'bg-slate-600 border-slate-600 text-white' 
                                  : 'bg-white border-slate-300 hover:border-indigo-400 text-transparent'
                              }`}>
                                <Check className="w-3.5 h-3.5" />
                              </div>
                              <input 
                                type="checkbox" 
                                className="hidden" 
                                checked={isChecked}
                                onChange={() => togglePermission(role, mod.id, action)}
                                disabled={!canManageRBAC}
                              />
                            </label>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
