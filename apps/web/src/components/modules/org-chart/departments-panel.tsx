"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Building2, Users, Briefcase, Plus, MoreHorizontal } from "lucide-react";
import { OrgRole, DepartmentNode } from "@/types/org-chart";

interface DepartmentsPanelProps {
  activeRole: OrgRole;
}

const MOCK_DEPARTMENTS: DepartmentNode[] = [
  {
    id: "DEPT-ENG",
    name: "Engineering",
    headId: "EMP-101",
    headcount: 185,
    openPositions: 12,
    budget: "$4.2M",
    description: "Core product development, QA, and infrastructure.",
  },
  {
    id: "DEPT-SLS",
    name: "Sales",
    headId: "EMP-104",
    headcount: 103,
    openPositions: 5,
    budget: "$2.8M",
    description: "Global enterprise sales and market expansion.",
  },
  {
    id: "DEPT-HR",
    name: "Human Resources",
    headId: "EMP-102",
    headcount: 41,
    openPositions: 2,
    budget: "$1.1M",
    description: "Talent acquisition, operations, and culture.",
  },
  {
    id: "DEPT-DSN",
    name: "Product Design",
    headId: "EMP-105", // Mock assignment
    headcount: 49,
    openPositions: 4,
    budget: "$1.5M",
    description: "User experience, research, and visual design.",
  },
];

export default function DepartmentsPanel({ activeRole }: DepartmentsPanelProps) {
  const canManage = activeRole === "ADMIN" || activeRole === "HR";

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => MOCK_DEPARTMENTS,
  });

  return (
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
              <button className="text-slate-400 hover:text-slate-700 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="w-4 h-4" />
              </button>
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
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 text-xs font-bold border border-slate-200 overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${dept.headId}`} alt="Head" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Department Head</div>
                  <div className="text-xs font-bold text-slate-900">Linked Profile</div>
                </div>
              </div>
              
              <button className="text-xs font-bold text-indigo-600 hover:underline">
                View Team
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
