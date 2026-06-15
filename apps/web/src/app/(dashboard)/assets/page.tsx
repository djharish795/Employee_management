"use client";

import React from 'react';

export default function AssetsPage() {
  return (
    <div className="flex flex-col h-full font-sans bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto w-full">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Assets Management</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">This module is currently under development.</p>
        
        <div className="mt-8 bg-white border border-slate-200 rounded-xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
              <rect x="9" y="9" width="6" height="6"></rect>
              <line x1="9" y1="1" x2="9" y2="4"></line>
              <line x1="15" y1="1" x2="15" y2="4"></line>
              <line x1="9" y1="20" x2="9" y2="23"></line>
              <line x1="15" y1="20" x2="15" y2="23"></line>
              <line x1="20" y1="9" x2="23" y2="9"></line>
              <line x1="20" y1="14" x2="23" y2="14"></line>
              <line x1="1" y1="9" x2="4" y2="9"></line>
              <line x1="1" y1="14" x2="4" y2="14"></line>
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Assets Interface Coming Soon</h3>
          <p className="text-sm text-slate-500">The assets management interface has not been designed or implemented yet. Please provide the design when ready!</p>
        </div>
      </div>
    </div>
  );
}
