"use client";

import React from 'react';
import { Search, Download, ChevronRight, FileText, Folder, Shield, Laptop, Calculator, FileCheck } from 'lucide-react';

export default function KnowledgeBasePage() {
  return (
    <div className="flex flex-col h-full font-sans bg-slate-50 overflow-y-auto">
      
      {/* Header Section */}
      <div className="px-8 py-8 border-b border-slate-200 bg-white flex-shrink-0">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Policy Directory Hub</h1>
          <p className="text-sm text-slate-500 font-medium mt-2 max-w-2xl">
            Central repository for all corporate handbooks, standard operating procedures, and compliance documentation.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search corporate policies, SOPs, or compliance standards..." 
                className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-700 transition-all shadow-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Quick Access:</span>
              <button onClick={() => {}} className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-900 text-xs font-bold hover:bg-slate-200 transition-colors">Employee Handbook</button>
              <button onClick={() => {}} className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-900 text-xs font-bold hover:bg-slate-200 transition-colors">Remote Work SOP</button>
              <button onClick={() => {}} className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-900 text-xs font-bold hover:bg-slate-200 transition-colors">Privacy Policy</button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Top Section: Categories & Featured */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Categories Grid (Span 2 cols) */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Category 1 */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col h-[260px]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-900 flex items-center justify-center">
                    <Folder className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">HR Operational Guidelines</h3>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">12 Documents</p>
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-center space-y-1">
                  <button onClick={() => {}} className="flex items-center justify-between w-full py-2.5 px-3 rounded-lg hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors">
                    <span>Code of Conduct 2024</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                  <button onClick={() => {}} className="flex items-center justify-between w-full py-2.5 px-3 rounded-lg hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors">
                    <span>Benefit & Perks Manual</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                  <button onClick={() => {}} className="flex items-center justify-between w-full py-2.5 px-3 rounded-lg hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors">
                    <span>Performance Review SOP</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
                <button onClick={() => {}} className="w-full mt-2 py-2 border-t border-slate-100 text-xs font-bold text-slate-900 hover:text-slate-900 tracking-wider uppercase">View All Docs</button>
              </div>

              {/* Category 2 */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col h-[260px]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">IT Infrastructure Guides</h3>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">8 Documents</p>
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-center space-y-1">
                  <button onClick={() => {}} className="flex items-center justify-between w-full py-2.5 px-3 rounded-lg hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors">
                    <span>Device Security Policy</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                  <button onClick={() => {}} className="flex items-center justify-between w-full py-2.5 px-3 rounded-lg hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors">
                    <span>Network Access Matrix</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                  <button onClick={() => {}} className="flex items-center justify-between w-full py-2.5 px-3 rounded-lg hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors">
                    <span>Software Whitelist 2024</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
                <button onClick={() => {}} className="w-full mt-2 py-2 border-t border-slate-100 text-xs font-bold text-emerald-600 hover:text-emerald-700 tracking-wider uppercase">View All Docs</button>
              </div>

              {/* Category 3 */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col h-[260px]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">DPDPA Corporate Compliance</h3>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">15 Documents</p>
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-center space-y-1">
                  <button onClick={() => {}} className="flex items-center justify-between w-full py-2.5 px-3 rounded-lg hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors">
                    <span>Data Processing Agreement</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                  <button onClick={() => {}} className="flex items-center justify-between w-full py-2.5 px-3 rounded-lg hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors">
                    <span>Privacy Impact Assessment</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                  <button onClick={() => {}} className="flex items-center justify-between w-full py-2.5 px-3 rounded-lg hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors">
                    <span>Incident Reporting Protocol</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
                <button onClick={() => {}} className="w-full mt-2 py-2 border-t border-slate-100 text-xs font-bold text-amber-600 hover:text-amber-700 tracking-wider uppercase">View Legal Docs</button>
              </div>

              {/* Category 4 (Half Height) */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">Finance & Procurement</h3>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">5 Documents</p>
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-center space-y-1">
                  <button onClick={() => {}} className="flex items-center justify-between w-full py-2.5 px-3 rounded-lg hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors">
                    <span>Travel Expense Policy</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                  <button onClick={() => {}} className="flex items-center justify-between w-full py-2.5 px-3 rounded-lg hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors">
                    <span>Vendor Onboarding SOP</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
                <button onClick={() => {}} className="w-full mt-2 py-2 border-t border-slate-100 text-xs font-bold text-purple-600 hover:text-purple-700 tracking-wider uppercase mt-auto">View All Groups</button>
              </div>

            </div>

            {/* Featured Banner (Right Col) */}
            <div className="bg-slate-900 rounded-xl shadow-lg p-6 text-white flex flex-col justify-between h-[544px] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
              
              <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-700 text-white rounded-md text-[10px] font-bold tracking-wider uppercase mb-6 shadow-sm border border-blue-400/50">
                  <FileCheck className="w-3.5 h-3.5" /> Featured Documentation
                </div>
                <h2 className="text-3xl font-extrabold leading-tight mb-4">New 2024 Security Protocols for Remote Work</h2>
                <p className="text-blue-100 text-sm font-medium leading-relaxed">
                  Mandatory update for all departments regarding data encryption and hardware management when working from off-site locations.
                </p>
              </div>

              <div className="relative z-10 flex flex-col gap-3 mt-8">
                <button onClick={() => {}} className="w-full bg-white text-slate-900 py-3 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors">
                  Read Document
                </button>
                <button onClick={() => {}} className="w-full bg-slate-800 text-white py-3 rounded-lg text-sm font-bold border border-slate-700 hover:bg-slate-950 transition-colors flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" /> Download PDF
                </button>
              </div>
            </div>

          </div>

          {/* Table Section: Recently Updated Articles */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Recently Updated Articles</h2>
              <button onClick={() => {}} className="text-xs font-bold text-slate-900 hover:text-slate-900 uppercase tracking-wider">View All Updates</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Document Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Last Revised</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Revised By</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-slate-700" />
                        <span className="text-sm font-bold text-slate-900">Anti-Corruption Framework</span>
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-md text-[10px] font-bold uppercase tracking-wider">Compliance</span></td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">Dec 14, 2024</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">SJ</div>
                        <span className="text-sm font-medium text-slate-700">Sarah Jenkins</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => {}} className="text-slate-400 hover:text-slate-900 transition-colors"><Download className="w-5 h-5" /></button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-slate-700" />
                        <span className="text-sm font-bold text-slate-900">Hiring Protocols 2.1</span>
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-md text-[10px] font-bold uppercase tracking-wider">Human Resources</span></td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">Dec 10, 2024</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-900 flex items-center justify-center text-[10px] font-bold">ER</div>
                        <span className="text-sm font-medium text-slate-700">Elena Rodriguez</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => {}} className="text-slate-400 hover:text-slate-900 transition-colors"><Download className="w-5 h-5" /></button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-slate-700" />
                        <span className="text-sm font-bold text-slate-900">Cloud Storage Guidelines</span>
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md text-[10px] font-bold uppercase tracking-wider">IT Systems</span></td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">Dec 05, 2024</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border border-slate-300">
                          <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Pradeep&backgroundColor=f1f5f9" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-sm font-medium text-slate-700">Pradeep Chandra</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => {}} className="text-slate-400 hover:text-slate-900 transition-colors"><Download className="w-5 h-5" /></button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
