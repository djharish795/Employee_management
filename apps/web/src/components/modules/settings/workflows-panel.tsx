"use client";

import React from "react";
import { Workflow, ArrowRight, UserCircle, Briefcase, Users, LayoutDashboard, ShieldCheck } from "lucide-react";

export default function WorkflowsPanel() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-1">Dynamic Leave Routing Matrix</h2>
        <p className="text-sm font-medium text-slate-500 max-w-2xl">
          The system automatically routes leave requests based on the employee's designation and active project assignments. These complex rules are natively enforced by the workflow engine.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* TR Route */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
            <UserCircle className="w-6 h-6" />
          </div>
          <div className="flex-1 w-full text-center md:text-left">
            <h3 className="text-[15px] font-bold text-slate-900 mb-1">TR (Trainee Researcher)</h3>
            <p className="text-xs font-medium text-slate-500 mb-4 md:mb-0">Routes depending on project assignment.</p>
          </div>
          <div className="flex flex-col gap-3 w-full md:w-auto">
            <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100 w-full justify-center">
              <span className="text-xs font-semibold text-slate-500 w-20 text-right">If Assigned:</span>
              <span className="text-xs font-bold text-slate-900 bg-white px-3 py-1 rounded shadow-sm border border-slate-200">TL</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
              <span className="text-xs font-bold text-slate-900 bg-white px-3 py-1 rounded shadow-sm border border-slate-200">HRE</span>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100 w-full justify-center">
              <span className="text-xs font-semibold text-slate-500 w-20 text-right">Unassigned:</span>
              <span className="text-xs font-bold text-slate-900 bg-white px-3 py-1 rounded shadow-sm border border-slate-200">Manager (OM)</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
              <span className="text-xs font-bold text-slate-900 bg-white px-3 py-1 rounded shadow-sm border border-slate-200">HRE</span>
            </div>
          </div>
        </div>

        {/* TL Route */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div className="flex-1 w-full text-center md:text-left">
            <h3 className="text-[15px] font-bold text-slate-900 mb-1">TL (Team Lead)</h3>
            <p className="text-xs font-medium text-slate-500">Standard team lead escalation.</p>
          </div>
          <div className="flex items-center justify-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100 w-full md:w-auto">
            <span className="text-xs font-bold text-slate-900 bg-white px-4 py-1.5 rounded shadow-sm border border-slate-200">Manager (OM)</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-900 bg-white px-4 py-1.5 rounded shadow-sm border border-slate-200">HRE</span>
          </div>
        </div>

        {/* OE Route */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div className="flex-1 w-full text-center md:text-left">
            <h3 className="text-[15px] font-bold text-slate-900 mb-1">OE (Operations Executive)</h3>
            <p className="text-xs font-medium text-slate-500">Routes to CRM or CAM based on manager assignment.</p>
          </div>
          <div className="flex items-center justify-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100 w-full md:w-auto">
            <span className="text-xs font-bold text-slate-900 bg-white px-4 py-1.5 rounded shadow-sm border border-slate-200 flex flex-col items-center"><span>Direct Manager</span><span className="text-[10px] text-slate-400">(CRM / CAM)</span></span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-900 bg-white px-4 py-1.5 rounded shadow-sm border border-slate-200">HRE</span>
          </div>
        </div>

        {/* CRM / CAM Route */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div className="flex-1 w-full text-center md:text-left">
            <h3 className="text-[15px] font-bold text-slate-900 mb-1">CRM & CAM</h3>
            <p className="text-xs font-medium text-slate-500">Client relationship and acquisition managers.</p>
          </div>
          <div className="flex items-center justify-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100 w-full md:w-auto">
            <span className="text-xs font-bold text-slate-900 bg-white px-4 py-1.5 rounded shadow-sm border border-slate-200">HRE</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-900 bg-white px-4 py-1.5 rounded shadow-sm border border-slate-200">Manager (OM)</span>
          </div>
        </div>

        {/* HRE Route */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="flex-1 w-full text-center md:text-left">
            <h3 className="text-[15px] font-bold text-slate-900 mb-1">HRE (HR Executive)</h3>
            <p className="text-xs font-medium text-slate-500">HR team escalation.</p>
          </div>
          <div className="flex items-center justify-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100 w-full md:w-auto">
            <span className="text-xs font-bold text-slate-900 bg-white px-4 py-1.5 rounded shadow-sm border border-slate-200">Manager (OM)</span>
          </div>
        </div>
        
      </div>
    </div>
  );
}
