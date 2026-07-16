"use client";

import React from "react";
import { BarChart3, TrendingUp, PieChart, Download, ArrowUpRight } from "lucide-react";
import { ComplianceRole } from "@/types/compliance";

interface ReportsPanelProps {
  activeRole: ComplianceRole;
}

const DEPT_SCORES = [
  { dept: "Engineering", score: 98, policies: 100, consents: 96 },
  { dept: "Sales", score: 85, policies: 90, consents: 80 },
  { dept: "HR", score: 100, policies: 100, consents: 100 },
  { dept: "Marketing", score: 92, policies: 95, consents: 89 },
  { dept: "Operations", score: 96, policies: 98, consents: 94 },
];

export default function ReportsPanel({ activeRole }: ReportsPanelProps) {
  return (
    <div className="space-y-6">
      
      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Compliance Analytics</h2>
          <p className="text-xs font-semibold text-slate-500">Executive summary of organizational compliance posture.</p>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors">
          <Download className="w-4 h-4" /> Export Master Report
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ── Departmental Compliance Scores ─────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden h-[400px] flex flex-col">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900">Department Scores</h3>
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto space-y-5">
            {DEPT_SCORES.map((d) => (
              <div key={d.dept}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-bold text-slate-700">{d.dept}</span>
                  <span className={`text-xs font-bold ${d.score < 90 ? 'text-amber-600' : 'text-teal-600'}`}>
                    {d.score}/100
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${d.score < 90 ? 'bg-amber-500' : 'bg-teal-500'}`}
                    style={{ width: `${d.score}%` }}
                  />
                </div>
                <div className="flex gap-4 mt-1">
                  <span className="text-[9px] font-bold text-slate-400">Policies: {d.policies}%</span>
                  <span className="text-[9px] font-bold text-slate-400">Consents: {d.consents}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Compliance Trends ──────────────────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden h-[400px] flex flex-col">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">12-Month Trend</h3>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50/50">
            {/* Placeholder for actual Line Chart */}
            <PieChart className="w-16 h-16 text-slate-300 mb-4" />
            <div className="text-center">
              <div className="text-2xl font-black text-slate-900 flex items-center justify-center gap-2 mb-1">
                94% <ArrowUpRight className="w-5 h-5 text-teal-500" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Trajectory</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
