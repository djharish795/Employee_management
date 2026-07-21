"use client";

import React from 'react';
import { ArrowRight, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { PremiumDashboardLayout } from '@/components/shared/premium-dashboard/PremiumDashboardLayout';
import { PremiumCard } from '@/components/shared/premium-dashboard/PremiumCard';

export default function TeamDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['teamLeadDashboard'],
    queryFn: async () => {
      const res = await apiClient.get('/dashboard/team-lead-overview');
      return res.data;
    }
  });

  const currentDate = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  if (isLoading) {
    return (
      <div className="flex-1 w-full bg-slate-50 min-h-screen flex flex-col items-center justify-center font-sans">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
        <p className="text-sm font-bold text-slate-500">Loading team data...</p>
      </div>
    );
  }

  const kpis = data?.kpiData || {
    directReportsCount: 0,
    presentTodayCount: 0,
    presentTodayPercentage: 0,
    pendingApprovalsCount: 0,
    tasksInProgressCount: 0
  };

  const teamToday = data?.teamToday || [];
  const approvals = data?.pendingApprovals || [];
  const tasksTodo = data?.taskBoardSnapshot?.todo || [];
  const tasksInProgress = data?.taskBoardSnapshot?.inProgress || [];
  const tasksBlocked = data?.taskBoardSnapshot?.blocked || [];

  return (
    <PremiumDashboardLayout className="flex flex-col">

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
          value={kpis.directReportsCount}
          subtitle="Backend sub-team"
        />
        <KpiCard
          title="PRESENT TODAY"
          value={
            <div className="flex items-center gap-2">
              <span className="text-emerald-600">{kpis.presentTodayCount}</span>
              <span className="text-slate-300">/</span>
              <span>{kpis.directReportsCount}</span>
              <span className="ml-2 text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase tracking-wider">{kpis.presentTodayPercentage}% present</span>
            </div>
          }
          subtitle="Attendance active"
        />
        <KpiCard
          title="PENDING APPROVALS"
          value={<span className="text-orange-500">{kpis.pendingApprovalsCount}</span>}
          subtitle="Leave requests"
        />
        <KpiCard
          title="TASKS IN PROGRESS"
          value={kpis.tasksInProgressCount}
          subtitle="Across the team"
        />
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

        {/* My Team Today (Left, spans 2 cols) */}
        <PremiumCard className="lg:col-span-2 overflow-hidden flex flex-col p-0">
          <div className="p-6 pb-4 border-b border-slate-100/50 flex items-center justify-between">
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
                {teamToday.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500 text-sm font-medium">No team members found.</td>
                  </tr>
                ) : teamToday.map((member: any) => (
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
        </PremiumCard>

        {/* Pending Approvals (Right, spans 1 col) */}
        <PremiumCard className="flex flex-col p-0">
          <div className="p-6 pb-2">
            <h2 className="text-lg font-bold text-slate-900">Pending approvals</h2>
          </div>
          <div className="p-6 space-y-4 flex-1">
            {approvals.length === 0 ? (
              <div className="text-center text-slate-500 text-sm font-medium py-8">No pending approvals.</div>
            ) : approvals.map((approval: any) => (
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
        </PremiumCard>

      </div>

      {/* Bottom Row - Task Board Snapshot */}
      <PremiumCard className="overflow-hidden flex flex-col p-0 mb-8">
        <div className="p-6 border-b border-slate-100/50 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Task board snapshot</h2>
          <Link href="/team-lead/task-board" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
            Open full board <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* TO DO */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">TO DO ({tasksTodo.length})</h3>
            {tasksTodo.map((task: any) => (
              <SnapshotTaskCard key={task.id} title={task.title} tag={task.tag} />
            ))}
          </div>

          {/* IN PROGRESS */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">IN PROGRESS ({tasksInProgress.length})</h3>
            {tasksInProgress.map((task: any) => (
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
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">BLOCKED ({tasksBlocked.length})</h3>

            {tasksBlocked.map((task: any) => (
              <div key={task.id} className="bg-white p-4 rounded-xl border border-dashed border-red-400 shadow-sm flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <h4 className="font-bold text-slate-900 leading-snug">{task.title}</h4>
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                </div>
                <div className="flex flex-col gap-2 items-start mt-1">
                  <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Blocked since {task.dateBlocked}</span>
                  <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full uppercase tracking-wider">CRITICAL</span>
                </div>
              </div>
            ))}

          </div>
        </div>
      </PremiumCard>

    </PremiumDashboardLayout>
  );
}

// Subcomponents

function KpiCard({ title, value, subtitle }: any) {
  return (
    <PremiumCard hoverLift className="p-6 flex flex-col justify-center">
      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{title}</h3>
      <div className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2 flex items-center">
        {value}
      </div>
      <p className="text-xs font-semibold text-slate-500">{subtitle}</p>
    </PremiumCard>
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
