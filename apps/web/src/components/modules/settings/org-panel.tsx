"use client";

import { usePermissions } from "@/hooks/use-permissions";
import React from "react";
import { Building2, MapPin, Save, UploadCloud, Users } from "lucide-react";
import { SettingsRole } from "@/types/settings";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

interface OrgPanelProps {
  
}

export default function OrgPanel() {
  const { canManageSettings: canEdit } = usePermissions();

  const { data: departments = [], isLoading } = useQuery({
    queryKey: ["org-departments-list"],
    queryFn: async () => {
      const res = await apiClient.get('/departments?limit=100');
      return res.data?.data || [];
    }
  });

  return (
    <div className="space-y-6">
      
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Organization Profile</h2>
          <p className="text-xs font-semibold text-slate-500">Manage corporate identity, locations, and departments.</p>
        </div>
        
        {canEdit && (
          <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors">
            <Save className="w-4 h-4" /> Save Changes
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ── Left Column ──────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Company Details */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-bold text-slate-900">Company Details</h3>
            </div>
            <div className="p-6">
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:bg-slate-100 hover:border-teal-400 transition-colors cursor-pointer flex-shrink-0 group">
                  <UploadCloud className="w-6 h-6 mb-1 group-hover:text-teal-500 transition-colors" />
                  <span className="text-[9px] font-bold uppercase tracking-wider group-hover:text-teal-600">Logo</span>
                </div>
                
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Company Name</label>
                    <input 
                      type="text" 
                      defaultValue="Naprocs Technologies Pvt. Ltd." 
                      disabled={!canEdit}
                      className="w-full h-9 px-3 text-sm font-semibold bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 disabled:bg-slate-50 disabled:text-slate-500" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Registration Number</label>
                    <input 
                      type="text" 
                      defaultValue="U72900KA2021PTC123456" 
                      disabled={!canEdit}
                      className="w-full h-9 px-3 text-sm font-mono text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 disabled:bg-slate-50 disabled:text-slate-500" 
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Primary Website</label>
                    <input 
                      type="text" 
                      defaultValue="https://naprocs.com" 
                      disabled={!canEdit}
                      className="w-full h-9 px-3 text-sm font-semibold bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 disabled:bg-slate-50 disabled:text-slate-500" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Departments */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
             <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-bold text-slate-900">Departments</h3>
              </div>
            </div>
            <div className="p-0">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Department Name</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Head</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Employees</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-center text-sm text-slate-500">Loading departments...</td>
                    </tr>
                  ) : departments.length > 0 ? (
                    departments.map((dept: any) => (
                      <tr key={dept.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-3 text-sm font-bold text-slate-900">{dept.name}</td>
                        <td className="px-6 py-3 text-xs font-semibold text-slate-600">
                          {dept.head ? `${dept.head.firstName || ""} ${dept.head.lastName || ""}`.trim() || "Unassigned" : "Unassigned"}
                        </td>
                        <td className="px-6 py-3 text-xs font-semibold text-slate-600">{dept._count?.employees || 0}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-center text-sm text-slate-500">No departments found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* ── Right Column ─────────────────────────────────────────────── */}
        <div className="space-y-6">
          
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-bold text-slate-900">Locations</h3>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="p-3 border border-slate-200 rounded-lg bg-slate-50 hover:border-teal-300 transition-colors cursor-pointer">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold text-slate-900">Guntur Office</span>
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200">PRIMARY</span>
                </div>
                <div className="text-[10px] text-slate-500 font-medium leading-tight">
                  Third Floor, Amaravathi Rd<br/>
                  above Krishna Dentals, beside BVR Convention Hall<br/>
                  Panduranga Nagar, Guntur, Andhra Pradesh 522034
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
