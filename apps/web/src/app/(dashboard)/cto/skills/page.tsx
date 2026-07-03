"use client";

import React, { useState } from 'react';
import { Search, Bell, AlertCircle, Download, ChevronRight, Cloud, Database, Monitor, Cpu } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

// ─── Phase 2 Preview Sample Data ──────────────────────────────────────────────────
const sampleEmployees = [
  { id: 1, name: 'Ravi Kumar' },
  { id: 2, name: 'Priya Sharma' },
  { id: 3, name: 'Suresh A.' },
  { id: 4, name: 'Meera K.' },
  { id: 5, name: 'Nikhil V.' },
  { id: 6, name: 'Arjun T.' },
];

const skills = ['NODE.JS', 'PYTHON', 'REACT', 'AWS', 'DOCKER', 'POSTGRESQL', 'NESTJS', 'TYPESCRIPT', 'REDIS', 'TERRAFORM', 'AI/ML'];

// 1 = Beginner (slate-100), 2 = Intermediate (blue-200), 3 = Advanced (blue-600), 4 = Expert (slate-900), 0 = None (transparent)
const heatmapData: Record<number, number[]> = {
  1: [4, 3, 2, 3, 2, 4, 4, 3, 2, 1, 1], // Ravi
  2: [3, 2, 4, 2, 1, 3, 3, 4, 3, 2, 2], // Priya
  3: [2, 4, 1, 4, 4, 2, 2, 2, 1, 4, 1], // Suresh
  4: [3, 2, 3, 3, 1, 3, 1, 4, 1, 1, 2], // Meera
  5: [4, 4, 2, 1, 1, 3, 4, 3, 2, 1, 1], // Nikhil
  6: [2, 1, 2, 3, 2, 2, 1, 3, 4, 1, 1], // Arjun
};

export default function SkillMatrixPage() {
  const role = useAuthStore((state) => state.role);
  const [activeTab, setActiveTab] = useState('All skills');

  const tabs = ['All skills', 'Technical', 'Frameworks', 'Cloud', 'Leadership', 'AI/ML'];

  // Protect route
  if (role !== "CTO") {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-slate-500">
        <h2 className="text-xl font-bold text-slate-800">Access Restricted</h2>
      </div>
    );
  }

  const getHeatmapColor = (level: number) => {
    switch (level) {
      case 4: return 'bg-slate-900';
      case 3: return 'bg-blue-600';
      case 2: return 'bg-blue-200';
      case 1: return 'bg-slate-100';
      default: return 'bg-transparent';
    }
  };

  return (
    <div className="flex flex-col h-full font-sans bg-slate-50 overflow-y-auto">
      
      {/* Top Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Skill Matrix</h1>
        <div className="flex items-center gap-4">
          <Search className="w-5 h-5 text-slate-400 cursor-pointer hover:text-slate-900" />
          <Bell className="w-5 h-5 text-slate-400 cursor-pointer hover:text-slate-900" />
          <div className="w-px h-6 bg-slate-200 mx-1"></div>
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-xs shadow-sm">LK</div>
          </div>
        </div>
      </div>

      <div className="p-8 max-w-[1400px] mx-auto w-full space-y-6">
        
        {/* Phase 2 Alert Banner */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-orange-600 flex items-center justify-center text-white flex-shrink-0">
            <span className="text-xs font-bold italic">i</span>
          </div>
          <span className="text-sm font-bold text-orange-800">
            This feature unlocks with Phase 2. Preview shown with sample data.
          </span>
        </div>

        {/* Header & Tabs */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-slate-900">Engineering team</h2>
            <span className="text-sm font-medium text-slate-500">• 34 engineers</span>
          </div>
          
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <select className="pl-4 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:outline-none focus:border-slate-900 appearance-none">
              <option>All skills</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
              <Download className="w-4 h-4" /> Export matrix
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-8 -mt-2">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 text-sm font-bold border-b-2 transition-colors ${
                activeTab === tab 
                ? 'border-slate-900 text-slate-900' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Heatmap Section */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 overflow-x-auto">
          <div className="flex items-center justify-between mb-8 min-w-[800px]">
            <h3 className="text-lg font-bold text-slate-900">Skill heatmap</h3>
            
            <div className="flex items-center gap-4 text-[10px] font-bold tracking-widest uppercase text-slate-500">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-slate-900"></div> EXPERT</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-blue-600"></div> ADVANCED</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-blue-200"></div> INTERMEDIATE</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-slate-100"></div> BEGINNER</div>
            </div>
          </div>
          
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr>
                <th className="py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest w-48">Employee</th>
                {skills.map(skill => (
                  <th key={skill} className="py-4 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center w-12">
                    <div className="transform -rotate-0 truncate">{skill}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sampleEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 text-sm font-bold text-slate-900">{emp.name}</td>
                  {skills.map((_, i) => (
                    <td key={i} className="py-4 px-2 text-center">
                      <div className="flex justify-center">
                        <div className={`w-8 h-8 rounded-md ${getHeatmapColor(heatmapData[emp.id][i])}`}></div>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
          
          {/* Critical skill gaps */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <h3 className="text-lg font-bold text-slate-900">Critical skill gaps</h3>
            </div>
            
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Terraform</h4>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">Only 1 expert identified in current team</p>
                </div>
                <span className="px-2 py-1 bg-rose-100 text-rose-700 text-[10px] font-bold uppercase rounded tracking-widest">Critical</span>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">AI/ML</h4>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">0 experts, 2 intermediate (Needs attention)</p>
                </div>
                <span className="px-2 py-1 bg-rose-100 text-rose-700 text-[10px] font-bold uppercase rounded tracking-widest">Critical</span>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Redis</h4>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">Only 1 expert managing entire cache layer</p>
                </div>
                <span className="px-2 py-1 bg-orange-100 text-orange-700 text-[10px] font-bold uppercase rounded tracking-widest">Warning</span>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Kubernetes</h4>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">Not yet tracked across majority of team</p>
                </div>
                <span className="px-2 py-1 bg-slate-200 text-slate-600 text-[10px] font-bold uppercase rounded tracking-widest">Untracked</span>
              </div>
            </div>
          </div>

          {/* Recommended training */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <BookOpenIcon />
              <h3 className="text-lg font-bold text-slate-900">Recommended training</h3>
            </div>
            
            <div className="space-y-4">
              
              <div className="border border-slate-200 rounded-lg p-4 flex items-center justify-between cursor-pointer hover:border-slate-300 hover:shadow-sm transition-all group">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <Cloud className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">AWS Solutions Architect</h4>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">Addresses Terraform/AWS infrastructure gaps</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 transition-colors" />
              </div>

              <div className="border border-slate-200 rounded-lg p-4 flex items-center justify-between cursor-pointer hover:border-slate-300 hover:shadow-sm transition-all group">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-slate-600 transition-colors">Practical AI/ML for Engineers</h4>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">Foundational training for data processing</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-600 transition-colors" />
              </div>

              <div className="border border-slate-200 rounded-lg p-4 flex items-center justify-between cursor-pointer hover:border-slate-300 hover:shadow-sm transition-all group">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-slate-600 transition-colors">Redis at Scale</h4>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">Advanced caching and data persistence</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-600 transition-colors" />
              </div>

              <div className="border border-slate-200 rounded-lg p-4 flex items-center justify-between cursor-pointer hover:border-slate-300 hover:shadow-sm transition-all group">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0">
                    <Monitor className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-slate-600 transition-colors">Kubernetes Fundamentals</h4>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">Container orchestration and management</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-600 transition-colors" />
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

// Helper icon component
function BookOpenIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    </svg>
  );
}
