import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Employee Dashboard | Naprocs EMS',
  description: 'Employee Self-Service Portal for Naprocs Enterprise Management System',
};

export default function EmployeeDashboardPage() {
  return (
    <div className="flex-1 w-full p-6 md:p-8 bg-slate-50 min-h-screen font-sans">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">My Dashboard</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">Welcome to your employee self-service portal.</p>
      </div>
      
      <div className="bg-white border border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center shadow-sm min-h-[300px]">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-2">You're all caught up!</h2>
        <p className="text-sm text-slate-500 max-w-md">Your employee dashboard is currently being configured. Check back soon for tasks, announcements, and quick actions.</p>
      </div>
    </div>
  );
}
