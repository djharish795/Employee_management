import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'IT Dashboard | Naprocs EMS',
  description: 'IT Dashboard for Enterprise Management System',
};

export default function ItDashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center animate-in fade-in zoom-in duration-500">
      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-blue-100">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-3">
        IT Administration Dashboard
      </h1>
      <p className="text-lg text-slate-500 max-w-md mx-auto mb-8">
        This is a dedicated placeholder for the IT role. You can safely drop components here in future implementations.
      </p>
      
      <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-xl shadow-sm p-8 border-dashed flex flex-col items-center justify-center min-h-[200px]">
        <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">
          Drop IT Components Here
        </p>
      </div>
    </div>
  );
}
