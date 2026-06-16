"use client";

import React from 'react';
import { ChevronRight, Settings2, Play, AlertCircle, Clock, Save, MoreHorizontal, History } from 'lucide-react';

export default function WorkflowsPage() {
  return (
    <div className="flex flex-col h-full font-sans bg-slate-50">
      {/* Header */}
      <div className="px-8 py-6 border-b border-slate-200 bg-white flex items-center justify-between flex-shrink-0">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2">
            <span className="hover:text-slate-700 cursor-pointer transition-colors">Naprocs</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-900">Workflows</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Workflows Configurator</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Phase 1: Multi-stage approvals for core operations</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => {}} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            Discard
          </button>
          <button onClick={() => {}} className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            Deploy Workflow
          </button>
        </div>
      </div>

      {/* Main Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Visual Flow Designer */}
        <div className="flex-1 p-8 overflow-auto bg-slate-50/50 flex flex-col items-center pt-16 relative">
          
          <div className="absolute top-4 left-4 text-sm font-bold text-slate-700 flex items-center gap-2">
            Visual Flow Designer
          </div>
          
          <div className="absolute top-4 right-4 flex bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <button className="p-2 hover:bg-slate-50 border-r border-slate-200" onClick={() => {}}><AlertCircle className="w-4 h-4 text-slate-500" /></button>
            <button className="p-2 hover:bg-slate-50 border-r border-slate-200" onClick={() => {}}><Clock className="w-4 h-4 text-slate-500" /></button>
            <button className="p-2 hover:bg-slate-50" onClick={() => {}}><Settings2 className="w-4 h-4 text-slate-500" /></button>
          </div>

          {/* Node 1: Employee Submission */}
          <div className="w-[320px] bg-white border border-blue-200 shadow-sm rounded-xl p-5 flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 border border-blue-100">
              <Play className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Employee Submission</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">Leave Request | Asset Requisition</p>
            </div>
          </div>

          {/* Arrow */}
          <div className="h-10 w-px bg-slate-300 relative">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 border-r-2 border-b-2 border-slate-300 rotate-45 transform translate-y-1/2"></div>
          </div>

          {/* Node 2: Manager Sign-off (Active) */}
          <div className="w-[320px] bg-white border-2 border-amber-400 shadow-md rounded-xl p-5 relative">
            <div className="absolute -top-3 -right-3 w-6 h-6 bg-amber-400 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 font-bold text-sm border border-amber-100">
                2
              </div>
              <div>
                <div className="text-xs font-bold text-amber-600 tracking-wider uppercase mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Approval Stage
                </div>
                <h3 className="text-sm font-bold text-slate-900">Manager Sign-off</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">Direct Line Manager approval required</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-600 border border-slate-200">Timeout: 48h</span>
                </div>
              </div>
            </div>
            {/* Side logic branch */}
            <div className="absolute top-1/2 -right-[120px] -translate-y-1/2 flex items-center">
              <div className="w-10 h-px bg-slate-300 relative">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-r-2 border-t-2 border-slate-300 rotate-45"></div>
              </div>
              <div className="ml-2 px-3 py-2 bg-white border border-slate-200 shadow-sm rounded-lg text-xs font-medium text-slate-600 flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                If Value &gt; $5,000
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="h-10 w-px bg-slate-300 relative">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 border-r-2 border-b-2 border-slate-300 rotate-45 transform translate-y-1/2"></div>
          </div>

          {/* Node 3: HR Verification */}
          <div className="w-[320px] bg-white border border-slate-200 shadow-sm rounded-xl p-5 flex items-start gap-4 opacity-75">
            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center flex-shrink-0 font-bold text-sm border border-slate-200">
              3
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">HR Master Log Verification</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">Final Compliance check by HRBP</p>
            </div>
          </div>

        </div>

        {/* Right Panel: Node Inspector */}
        <div className="w-[380px] bg-white border-l border-slate-200 flex flex-col flex-shrink-0 shadow-[-4px_0_24px_-16px_rgba(0,0,0,0.1)] z-10">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <Settings2 className="w-4 h-4 text-blue-600" />
              Node Inspector
            </div>
            <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wider bg-slate-100 px-2 py-1 rounded">ID: ND-2024-884A</span>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Step Title</label>
              <input type="text" defaultValue="Manager Sign-off" className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Role Assignment</label>
              <select className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white appearance-none">
                <option>Reporting Manager</option>
                <option>Department Head</option>
                <option>HR Partner</option>
              </select>
              <p className="text-[11px] text-blue-600 font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" /> Dynamically assigns line manager for selected employee.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Timeout Window</label>
              <div className="flex items-center gap-3">
                <input type="number" defaultValue={48} className="w-24 h-10 px-3 border border-slate-200 rounded-lg text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                <span className="text-sm font-semibold text-slate-600">Hours</span>
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">On Expiry</label>
              <select className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white appearance-none">
                <option>Escalate to HR</option>
                <option>Auto-approve</option>
                <option>Reject</option>
              </select>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Conditional Overrides</label>
                <button onClick={() => {}} className="text-xs font-bold text-blue-600 hover:text-blue-700">+ Add Rule</button>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                <div className="text-sm font-bold text-amber-900 mb-1">Priority Escalation</div>
                <div className="text-[11px] text-amber-700/80 font-medium leading-relaxed">
                  If Request Type equals "Resignation/Notice Period", bypass this step and escalate to HR.
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Node History</label>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5"></div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-900">Modified Timeout Window</div>
                    <div className="text-[10px] font-medium text-slate-500 mt-0.5">Alex Thompson • 2h ago</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5"></div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-900">Created Node</div>
                    <div className="text-[10px] font-medium text-slate-500 mt-0.5">System • Nov 12, 2024</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 border-t border-slate-200 bg-white">
            <button onClick={() => {}} className="w-full py-2.5 bg-[#0F172A] hover:bg-slate-800 text-white text-sm font-bold rounded-lg transition-all shadow-sm">
              Save Step Properties
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="h-12 border-t border-slate-200 bg-white flex items-center justify-between px-8 flex-shrink-0 text-xs font-bold text-slate-500 uppercase tracking-wider">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-blue-500" />
            <span>Active Nodes: <span className="text-slate-900 ml-1">05</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-500" />
            <span>Avg Latency: <span className="text-slate-900 ml-1">~3.2 Days</span></span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span>Errors (24h): <span className="text-slate-900 ml-1">00</span></span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <History className="w-4 h-4" />
          <span>Last Revision: <span className="text-slate-900 ml-1">v1.4.2</span></span>
        </div>
      </div>
    </div>
  );
}
