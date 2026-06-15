"use client";

import React from 'react';
import Link from 'next/link';
import { Search, Filter, MoreHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';

const employeesData = [
  { id: 'EMP-2021-084', name: 'Arjun Mehra', initials: 'AM', color: 'bg-blue-100 text-blue-600', dept: 'Engineering', role: 'Senior Backend Developer', status: 'ACTIVE', joined: '12 May 2021' },
  { id: 'EMP-2023-112', name: 'Priya Sharma', initials: 'PS', color: 'bg-pink-100 text-pink-600', dept: 'Engineering', role: 'UI/UX Designer', status: 'ACTIVE', joined: '03 Jan 2023' },
  { id: 'EMP-2024-405', name: 'Ravi Kumar', initials: 'RK', color: 'bg-orange-100 text-orange-600', dept: 'Engineering', role: 'DevOps Engineer', status: 'PROBATION', joined: '15 Nov 2024' },
  { id: 'EMP-2022-219', name: 'Neha Kapur', initials: 'NK', color: 'bg-purple-100 text-purple-600', dept: 'Engineering', role: 'QA Lead', status: 'ACTIVE', joined: '22 Mar 2022' },
  { id: 'EMP-2023-642', name: 'Vikram Singh', initials: 'VS', color: 'bg-emerald-100 text-emerald-600', dept: 'Engineering', role: 'Mobile Developer', status: 'ACTIVE', joined: '09 Aug 2023' },
  { id: 'EMP-2022-054', name: 'Anita M.', initials: 'AM', color: 'bg-red-100 text-red-600', dept: 'Engineering', role: 'Frontend Developer', status: 'NOTICE PERIOD', joined: '14 Feb 2022' },
  { id: 'EMP-2023-901', name: 'Aman Singh', initials: 'AS', color: 'bg-blue-100 text-blue-600', dept: 'Engineering', role: 'Backend Developer', status: 'ACTIVE', joined: '20 Oct 2023' },
  { id: 'EMP-2020-003', name: 'Sarah Q.', initials: 'SQ', color: 'bg-teal-100 text-teal-600', dept: 'Engineering', role: 'Project Manager', status: 'ACTIVE', joined: '11 May 2020' },
];

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'ACTIVE':
      return <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider text-emerald-700 bg-emerald-100 rounded-md uppercase">ACTIVE</span>;
    case 'PROBATION':
      return <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider text-amber-700 bg-amber-100 rounded-md uppercase">PROBATION</span>;
    case 'NOTICE PERIOD':
      return <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider text-rose-700 bg-rose-100 rounded-md uppercase">NOTICE PERIOD</span>;
    default:
      return <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider text-slate-700 bg-slate-100 rounded-md uppercase">{status}</span>;
  }
};

export default function EmployeesPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Employees</h1>
          <span className="px-2.5 py-1 bg-slate-200 text-slate-700 text-xs font-semibold rounded-full">87 employees</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name, department, role..." 
              className="w-[280px] h-10 pl-9 pr-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 h-10 px-4 rounded-lg border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <Link 
            href="/employees/new"
            className="flex items-center justify-center h-10 px-5 rounded-lg bg-[#0F172A] hover:bg-slate-800 text-white font-semibold text-sm transition-colors shadow-sm"
          >
            Add employee
          </Link>
        </div>
      </div>

      {/* Active Filters */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-md text-xs font-semibold">
          Department: Engineering
          <button className="hover:text-blue-900"><X className="w-3.5 h-3.5" /></button>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-md text-xs font-semibold">
          Status: Active
          <button className="hover:text-blue-900"><X className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 w-[30%]">Employee</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 w-[20%]">Department</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 w-[20%]">Designation</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 w-[15%]">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 w-[10%]">Joined</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 text-right w-[5%]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employeesData.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${emp.color}`}>
                        {emp.initials}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{emp.name}</div>
                        <div className="text-xs font-medium text-slate-500 mt-0.5">{emp.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">{emp.dept}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">{emp.role}</td>
                  <td className="px-6 py-4"><StatusBadge status={emp.status} /></td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium whitespace-nowrap">{emp.joined}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">View</button>
                      <span className="text-slate-300">•</span>
                      <button className="hover:text-slate-600"><MoreHorizontal className="w-5 h-5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="text-sm font-medium text-slate-500">
            Showing <span className="font-bold text-slate-900">1–8</span> of <span className="font-bold text-slate-900">87</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-slate-400 border border-slate-200 rounded-md cursor-not-allowed bg-white">
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-md bg-white shadow-sm transition-colors">
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
