"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Circle, Clock, Info, Search, AlertCircle, FileText, Monitor, BookOpen, MessageSquare } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

export default function HROnboardingTasksPage() {
  const role = useAuthStore((state) => state.role);
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('PENDING');

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['hr-onboarding-tasks'],
    queryFn: async () => {
      const { data } = await apiClient.get('/onboarding/tasks');
      return data;
    },
    enabled: role === "HR"
  });

  const toggleTaskMutation = useMutation({
    mutationFn: async ({ taskId, isCompleted }: { taskId: string, isCompleted: boolean }) => {
      const { data } = await apiClient.patch(`/onboarding/tasks/${taskId}`, { isCompleted });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-onboarding-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['onboarding-metrics'] });
    }
  });

  if (role !== "HR") {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-slate-500">
        <AlertCircle className="w-10 h-10 text-rose-400 mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Access Restricted</h2>
        <p className="mt-2 text-sm">Only HR personnel can view this page.</p>
      </div>
    );
  }

  const filteredTasks = tasks.filter((task: any) => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      task.session?.employee?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.session?.employee?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.session?.employee?.employeeId?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = 
      filterStatus === 'ALL' ? true : 
      filterStatus === 'PENDING' ? !task.isCompleted : 
      task.isCompleted;

    return matchesSearch && matchesStatus;
  });

  const handleToggle = (taskId: string, currentStatus: boolean) => {
    toggleTaskMutation.mutate({ taskId, isCompleted: !currentStatus });
  };

  return (
    <div className="flex flex-col h-full font-sans bg-slate-50 overflow-y-auto">
      <div className="p-8 max-w-[1200px] mx-auto w-full space-y-6">
        
        {/* Header */}
        <div className="flex flex-col gap-1 mb-2">
          <Link href="/onboarding" className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-900 uppercase tracking-widest mb-2 w-fit transition-colors">
            <ArrowLeft className="w-3 h-3" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">HR Onboarding Tasks</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Manage all pending and completed onboarding tasks assigned to HR.</p>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button 
              onClick={() => setFilterStatus('PENDING')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${filterStatus === 'PENDING' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Pending
            </button>
            <button 
              onClick={() => setFilterStatus('COMPLETED')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${filterStatus === 'COMPLETED' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Completed
            </button>
            <button 
              onClick={() => setFilterStatus('ALL')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${filterStatus === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              All Tasks
            </button>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks or employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20 bg-slate-50"
            />
          </div>
        </div>

        {/* Tasks List */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full"></div>
            </div>
          ) : filteredTasks.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {filteredTasks.map((task: any) => (
                <div key={task.id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <button 
                      onClick={() => handleToggle(task.id, task.isCompleted)}
                      disabled={toggleTaskMutation.isPending}
                      className="mt-1 flex-shrink-0 focus:outline-none"
                    >
                      {task.isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                      ) : (
                        <Circle className="w-6 h-6 text-slate-300 hover:text-slate-400" />
                      )}
                    </button>
                    <div>
                      <h3 className={`text-sm font-bold ${task.isCompleted ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-xs text-slate-500 mt-1 max-w-xl line-clamp-2">{task.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
                          <span className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[9px]">
                            {task.session?.employee?.firstName?.[0]}{task.session?.employee?.lastName?.[0]}
                          </span>
                          {task.session?.employee?.firstName} {task.session?.employee?.lastName}
                        </div>
                        <div className="text-[11px] font-medium text-slate-400 border-l border-slate-200 pl-4">
                          Created: {new Date(task.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 self-start md:self-center ml-10 md:ml-0">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded-md border border-slate-200">
                      {task.session?.stage?.replace('_', ' ')}
                    </span>
                    <Link href={`/onboarding/${task.sessionId}`} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 text-xs font-bold rounded-lg transition-colors">
                      View Profile
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <CheckCircle2 className="w-12 h-12 text-slate-300 mb-4" />
              <p className="text-sm font-bold text-slate-600">No tasks found</p>
              <p className="text-xs mt-1">You're all caught up with the current filters.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
