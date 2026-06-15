"use client";

import React from 'react';
import { Search, ZoomIn, ZoomOut, Maximize, Download } from 'lucide-react';

export default function OrgChartPage() {
  return (
    <div className="flex flex-col h-full font-sans bg-slate-50 relative">
      {/* Header */}
      <div className="px-8 py-4 border-b border-slate-200 bg-white flex items-center justify-between flex-shrink-0 shadow-sm z-10 relative">
        <div className="flex-1 max-w-md">
          <div className="relative flex items-center w-full h-10 rounded-lg bg-slate-100/80 px-3 text-slate-500 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:bg-white transition-all">
            <Search className="w-4 h-4 mr-2.5 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search employees, departments, or roles..."
              className="w-full h-full bg-transparent border-none text-sm font-medium placeholder:text-slate-400 focus:outline-none"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">
            87 total employees
          </div>
          <button onClick={() => {}} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            List View
          </button>
        </div>
      </div>

      {/* Top Banner Message */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-emerald-900 text-emerald-50 px-6 py-2.5 rounded-full text-xs font-bold shadow-lg z-20 flex items-center gap-2">
        <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-emerald-900">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        Org structure updated
        <span className="font-medium text-emerald-200/80 ml-1">All changes have been synchronized across the EMS.</span>
      </div>

      {/* Tree Canvas */}
      <div className="flex-1 overflow-auto p-12 flex justify-center pt-32 relative">
        <div className="flex flex-col items-center">
          
          {/* Level 1: CEO */}
          <div className="relative flex flex-col items-center">
            <div className="bg-white border-2 border-blue-600 rounded-xl shadow-md p-4 w-[280px] flex items-center gap-4 relative z-10">
              <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Alex&backgroundColor=f1f5f9" className="w-12 h-12 rounded-lg object-cover bg-slate-100 border border-slate-200" alt="CEO" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Alex Thompson</h3>
                <p className="text-xs font-semibold text-blue-600">Chief Executive Officer</p>
                <p className="text-[10px] font-medium text-slate-500 mt-0.5">87 total reports</p>
              </div>
            </div>
            {/* Vertical Line down from CEO */}
            <div className="w-px h-8 bg-slate-300"></div>
          </div>

          {/* Level 2: C-Suite */}
          <div className="relative flex flex-col items-center">
            {/* Horizontal connecting line */}
            <div className="absolute top-0 left-[140px] right-[140px] h-px bg-slate-300"></div>
            
            <div className="flex gap-12 relative pt-8">
              {/* Vertical lines connecting horizontal line to nodes */}
              <div className="absolute top-0 left-[140px] w-px h-8 bg-slate-300"></div>
              <div className="absolute top-0 left-[440px] w-px h-8 bg-slate-300"></div>
              <div className="absolute top-0 right-[440px] w-px h-8 bg-slate-300"></div>
              <div className="absolute top-0 right-[140px] w-px h-8 bg-slate-300"></div>

              {/* Node 1: CTO */}
              <div className="flex flex-col items-center">
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 w-[250px] flex items-center gap-3 relative z-10">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">MC</div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Marcus Chen</h3>
                    <p className="text-xs font-semibold text-slate-600">Chief Technology Officer</p>
                  </div>
                </div>
                <div className="w-px h-6 bg-slate-300"></div>
                <div className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 w-[250px] text-center shadow-sm">
                  Engineering (34)
                </div>
                {/* Deeper level placeholder */}
                <div className="w-px h-12 bg-slate-300"></div>
                <div className="bg-white border border-slate-200 rounded-lg p-3 w-[220px] shadow-sm flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-600">AT</div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Anna Taylor</h3>
                    <p className="text-[10px] font-medium text-slate-500">VP Engineering</p>
                  </div>
                </div>
                <div className="w-px h-8 bg-slate-300"></div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-white px-2">Backend Team (12)</div>
              </div>

              {/* Node 2: COO */}
              <div className="flex flex-col items-center">
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 w-[250px] flex items-center gap-3 relative z-10">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">SJ</div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Sarah Jenkins</h3>
                    <p className="text-xs font-semibold text-slate-600">Chief Operations Officer</p>
                  </div>
                </div>
                <div className="w-px h-6 bg-slate-300"></div>
                <div className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 w-[250px] text-center shadow-sm">
                  Operations (15)
                </div>
              </div>

              {/* Node 3: CFO */}
              <div className="flex flex-col items-center">
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 w-[250px] flex items-center gap-3 relative z-10">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm">DM</div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">David Miller</h3>
                    <p className="text-xs font-semibold text-slate-600">Chief Financial Officer</p>
                  </div>
                </div>
                <div className="w-px h-6 bg-slate-300"></div>
                <div className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 w-[250px] text-center shadow-sm">
                  Finance (8)
                </div>
              </div>

              {/* Node 4: CHRO */}
              <div className="flex flex-col items-center">
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 w-[250px] flex items-center gap-3 relative z-10">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm">ER</div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Elena Rodriguez</h3>
                    <p className="text-xs font-semibold text-slate-600">Chief HR Officer</p>
                  </div>
                </div>
                <div className="w-px h-6 bg-slate-300"></div>
                <div className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 w-[250px] text-center shadow-sm">
                  HR & Recruitment (12)
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="absolute bottom-8 right-8 flex flex-col gap-3">
        <div className="bg-white rounded-lg shadow-md border border-slate-200 flex flex-col overflow-hidden">
          <button onClick={() => {}} className="p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 border-b border-slate-200 transition-colors">
            <ZoomIn className="w-5 h-5" />
          </button>
          <button onClick={() => {}} className="p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 border-b border-slate-200 transition-colors">
            <ZoomOut className="w-5 h-5" />
          </button>
          <button onClick={() => {}} className="p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors">
            <Maximize className="w-5 h-5" />
          </button>
        </div>
        <button onClick={() => {}} className="w-11 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors">
          <Download className="w-5 h-5" />
        </button>
      </div>

      {/* Minimap Placeholder */}
      <div className="absolute bottom-8 left-8 w-48 h-32 bg-white rounded-lg shadow-md border border-slate-200 p-2 opacity-80 pointer-events-none hidden md:block">
        <div className="w-full h-full border border-slate-100 bg-slate-50/50 rounded flex flex-col items-center justify-start pt-2 gap-1">
          <div className="w-4 h-2 bg-blue-200 rounded-sm"></div>
          <div className="flex gap-2">
            <div className="w-3 h-2 bg-slate-200 rounded-sm"></div>
            <div className="w-3 h-2 bg-slate-200 rounded-sm"></div>
            <div className="w-3 h-2 bg-slate-200 rounded-sm"></div>
            <div className="w-3 h-2 bg-slate-200 rounded-sm"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
