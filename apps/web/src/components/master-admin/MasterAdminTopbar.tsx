"use client";

import React from 'react';
import { Search, Bell, Activity } from 'lucide-react';

export function MasterAdminTopbar() {
  return (
    <header className="h-16 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors">
      
      {/* Search Input Simulation */}
      <div className="flex-1 max-w-2xl hidden md:flex items-center">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search telemetry, databases, or modules..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-slate-900 dark:text-white placeholder:text-slate-500"
            disabled
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <kbd className="hidden sm:inline-flex px-1.5 py-0.5 text-[10px] font-medium text-slate-500 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md">⌘K</kbd>
          </div>
        </div>
      </div>

      {/* Spacer for Mobile */}
      <div className="flex-1 md:hidden"></div>

      {/* Right Side Anonymous System Indicator */}
      <div className="flex items-center gap-3 md:gap-4 pl-4 ml-auto">
        {/* Connection Pulse */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full text-xs font-semibold border border-green-200 dark:border-green-800/50 shadow-sm">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </div>
          SYSTEM ACTIVE
        </div>

        <div className="w-px h-6 bg-slate-200 dark:bg-slate-800"></div>

        <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors relative">
          <Bell className="w-5 h-5" />
        </button>

        <div className="w-px h-6 bg-slate-200 dark:bg-slate-800"></div>

        <div className="flex items-center gap-3 group pl-2">
          <div className="hidden md:block text-right">
            <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight uppercase tracking-wide">
              Root
            </p>
            <p className="text-[10px] font-semibold tracking-widest text-red-500 uppercase mt-0.5">
              Access Granted
            </p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-800 to-slate-600 dark:from-slate-700 dark:to-slate-500 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-slate-100 dark:ring-slate-800 relative">
            <Activity className="w-4 h-4" />
          </div>
        </div>
      </div>
    </header>
  );
}
