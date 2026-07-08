"use client";

import React, { useState } from 'react';
import { ArrowRight, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Placeholder data structures for backend team to replace with API calls
const mockTeamToday = [
  { id: '1', initials: 'PJ', name: 'Pooja J.', bgClass: 'bg-orange-100 text-orange-700', status: 'Present', statusClass: 'bg-emerald-50 text-emerald-700 border-emerald-100', time: '9:10 AM', task: 'API rate limiting' },
  { id: '2', initials: 'KR', name: 'Karthik R.', bgClass: 'bg-blue-100 text-blue-700', status: 'Present', statusClass: 'bg-emerald-50 text-emerald-700 border-emerald-100', time: '9:25 AM', task: 'DB migration script' },
  { id: '3', initials: 'DN', name: 'Divya N.', bgClass: 'bg-orange-100 text-orange-700', status: 'Late', statusClass: 'bg-orange-50 text-orange-600 border-orange-100', time: '10:45 AM', task: 'Code review backlog' },
  { id: '4', initials: 'SK', name: 'Sameer K.', bgClass: 'bg-rose-100 text-rose-700', status: 'On leave', statusClass: 'bg-slate-100 text-slate-500 border-slate-200', time: '—', task: '—', isDimmed: true },
];

const mockApprovals = [
  { id: '1', name: 'Divya N.', type: 'Sick leave • 2 days', status: 'Pending' },
  { id: '2', name: 'Sameer K.', type: 'Casual leave • 1 day', status: 'Pending' },
];

const mockTasksTodo = [
  { id: '1', title: 'Update API docs', tag: 'DOCS' },
  { id: '2', title: 'Prepare sprint demo', tag: 'MANAGEMENT' },
];

const mockTasksInProgress = [
  { id: '3', title: 'DB migration script', tag: 'DATABASE', assignee: 'KR', tagColor: 'bg-blue-50 text-blue-600 border-blue-100' },
  { id: '4', title: 'Code review backlog', tag: 'REVIEW', assignee: 'DN', tagColor: 'bg-blue-50 text-blue-600 border-blue-100' },
];

export default function TeamDashboardPage() {
  const [teamToday, setTeamToday] = useState(mockTeamToday);
  const [approvals, setApprovals] = useState(mockApprovals);
  const [tasksTodo, setTasksTodo] = useState(mockTasksTodo);
  const [tasksInProgress, setTasksInProgress] = useState(mockTasksInProgress);
  
  // Mock current date as shown in design
  const currentDate = "Thursday, 15 January 2025";

  return (
    <div className="flex-1 w-full bg-slate-50 min-h-screen flex flex-col font-sans overflow-x-hidden p-6 md:p-8">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My team</h1>
          <p className="text-sm font-semibold text-slate-500 mt-1">{currentDate}</p>
        </div>
        <Button variant="outline" className="bg-white text-slate-700 font-bold border-slate-200 hover:bg-slate-50 shadow-sm rounded-xl">
          View team profile
        </Button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <KpiCard 
          title="DIRECT REPORTS" 
          value="4" 
          subtitle="Backend sub-team" 
        />
        <KpiCard 
          title="PRESENT TODAY" 
          value={
            <div className="flex items-center gap-2">
              <span className="text-emerald-600">3</span>
              <span className="text-slate-300">/</span>
              <span>4</span>
              <span className="ml-2 text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase tracking-wider">75% present</span>
            </div>
          }
          subtitle="Attendance active" 
        />
        <KpiCard 
          title="PENDING APPROVALS" 
          value={<span className="text-orange-500">2</span>} 
          subtitle="Leave requests" 
        />
        <KpiCard 
          title="TASKS IN PROGRESS" 
          value="7" 
          subtitle="Across the team" 
        />
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* My Team Today (Left, spans 2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">My team today</h2>
            <Link href="/team-lead/team" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
              View full team <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 border-b border-slate-100 w-1/3">MEMBER</th>
                  <th className="px-6 py-4 border-b border-slate-100 w-1/6">STATUS</th>
                  <th className="px-6 py-4 border-b border-slate-100 w-1/6">CHECK-IN</th>
                  <th className="px-6 py-4 border-b border-slate-100">CURRENT TASK</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teamToday.map(member => (
                  <TeamRow 
                    key={member.id}
                    initials={member.initials} 
                    name={member.name} 
                    bgClass={member.bgClass} 
                    status={member.status} 
                    statusClass={member.statusClass}
                    time={member.time} 
                    task={member.task}
                    isDimmed={member.isDimmed}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Approvals (Right, spans 1 col) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-6 pb-2">
            <h2 className="text-lg font-bold text-slate-900">Pending approvals</h2>
          </div>
          <div className="p-6 space-y-4 flex-1">
            {approvals.map(approval => (
              <ApprovalCard 
                key={approval.id}
                name={approval.name} 
                type={approval.type} 
                status={approval.status} 
              />
            ))}
          </div>
          <div className="p-4 border-t border-slate-100 flex justify-center">
            <Link href="/team-lead/leaves" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
              View all approvals <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>

      {/* Bottom Row - Task Board Snapshot */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Task board snapshot</h2>
          <Link href="/team-lead/task-board" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
            Open full board <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* TO DO */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">TO DO ({tasksTodo.length})</h3>
            {tasksTodo.map(task => (
              <SnapshotTaskCard key={task.id} title={task.title} tag={task.tag} />
            ))}
          </div>
          
          {/* IN PROGRESS */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">IN PROGRESS (7)</h3>
            {tasksInProgress.map(task => (
              <SnapshotTaskCard 
                key={task.id} 
                title={task.title} 
                tag={task.tag} 
                assignee={task.assignee} 
                tagColor={task.tagColor} 
              />
            ))}
          </div>

          {/* BLOCKED */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">BLOCKED (1)</h3>
            
            {/* Blocked Card */}
            <div className="bg-white p-4 rounded-xl border border-dashed border-red-400 shadow-sm flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <h4 className="font-bold text-slate-900 leading-snug">Payment gateway integration</h4>
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              </div>
              <div className="flex flex-col gap-2 items-start mt-1">
                <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Blocked since 13 Jan</span>
                <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full uppercase tracking-wider">CRITICAL</span>
              </div>
            </div>
            
          </div>
        </div>
      </div>

    </div>
  );
}

// Subcomponents

function KpiCard({ title, value, subtitle }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{title}</h3>
      <div className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2 flex items-center">
        {value}
      </div>
      <p className="text-xs font-semibold text-slate-500">{subtitle}</p>
    </div>
  );
}

function TeamRow({ initials, name, bgClass, status, statusClass, time, task, isDimmed }: any) {
  return (
    <tr className={`hover:bg-slate-50/50 transition-colors ${isDimmed ? 'opacity-60' : ''}`}>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${bgClass}`}>
            {initials}
          </div>
          <span className="font-bold text-slate-900 text-sm">{name}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${statusClass}`}>
          {status}
        </span>
      </td>
      <td className="px-6 py-4 font-semibold text-slate-600 text-sm">
        {time}
      </td>
      <td className="px-6 py-4 font-bold text-slate-800 text-sm">
        {task}
      </td>
    </tr>
  );
}

function ApprovalCard({ name, type, status }: any) {
  return (
    <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between border border-slate-100 hover:border-slate-200 transition-colors">
      <div className="flex flex-col">
        <span className="font-bold text-slate-900 text-sm">{name}</span>
        <span className="font-medium text-slate-500 text-xs mt-0.5">{type}</span>
      </div>
      <span className="text-[10px] font-bold text-orange-600 bg-orange-100 border border-orange-200 px-2 py-0.5 rounded-full tracking-wider uppercase">
        {status}
      </span>
    </div>
  );
}

function SnapshotTaskCard({ title, tag, tagColor = "text-slate-500 bg-slate-100 border-slate-200", assignee }: any) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
      <h4 className="font-bold text-slate-900 leading-snug">{title}</h4>
      <div className="flex items-center justify-between mt-1">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border ${tagColor}`}>
          {tag}
        </span>
        {assignee && (
          <div className="w-5 h-5 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-[8px] font-bold text-slate-700">
            {assignee}
          </div>
        )}
      </div>
    </div>
  );
}
