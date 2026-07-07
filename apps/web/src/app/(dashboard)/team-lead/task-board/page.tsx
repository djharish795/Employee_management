"use client";

import React from 'react';
import { Plus, Search, Bell, Filter, MoreHorizontal, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TaskBoardPage() {
  return (
    <div className="flex-1 w-full bg-slate-50 min-h-screen flex flex-col font-sans">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Task Board • Backend Team</h1>
        <div className="flex items-center gap-4">
          <Button className="bg-slate-900 text-white hover:bg-slate-800 font-bold px-4 rounded-lg flex items-center gap-2 shadow-sm">
            <Plus className="w-4 h-4" />
            Add task
          </Button>
          <button className="text-slate-500 hover:text-slate-700 transition-colors p-1">
            <Search className="w-5 h-5" />
          </button>
          <button className="text-slate-500 hover:text-slate-700 transition-colors p-1 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
          </button>
          <div className="w-8 h-8 bg-slate-200 rounded-full border border-slate-300 ml-2 overflow-hidden flex items-center justify-center text-xs font-bold text-slate-600">
            AT
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-md border border-slate-200">
          <CalendarIcon className="w-4 h-4" />
          BE Sprint 12 • 15-28 Jan
        </div>
        <div className="flex items-center gap-3">
          <select className="bg-white border border-slate-200 rounded-md text-sm font-semibold text-slate-700 px-3 py-2 outline-none shadow-sm cursor-pointer hover:border-slate-300">
            <option>All members</option>
          </select>
          <select className="bg-white border border-slate-200 rounded-md text-sm font-semibold text-slate-700 px-3 py-2 outline-none shadow-sm cursor-pointer hover:border-slate-300">
            <option>All priorities</option>
          </select>
          <button className="bg-white border border-slate-200 rounded-md p-2 text-slate-600 hover:bg-slate-50 shadow-sm transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto px-6 pb-8">
        <div className="flex gap-6 h-full min-w-max items-start">
          
          {/* To Do Column */}
          <div className="w-80 flex flex-col gap-3">
            <div className="flex items-center justify-between mb-1 px-1">
              <h3 className="font-bold text-slate-900">To do (2)</h3>
              <MoreHorizontal className="w-5 h-5 text-slate-400 cursor-pointer" />
            </div>
            
            <TaskCard 
              priority="NORMAL" 
              priorityColor="text-blue-600"
              title="Update API documentation" 
              initials="PJ" 
              name="Pooja J." 
              date="20 Jan" 
            />
            <TaskCard 
              priority="NORMAL" 
              priorityColor="text-blue-600"
              title="Prepare sprint demo" 
              initials="AT" 
              name="Arjun T." 
              date="28 Jan" 
              isDarkInitials
            />
            
            <button className="w-full py-2.5 mt-1 border border-dashed border-slate-300 rounded-lg text-slate-500 font-semibold text-sm hover:bg-slate-100 hover:text-slate-700 transition-colors flex items-center justify-center gap-1">
              <Plus className="w-4 h-4" /> Add task
            </button>
          </div>

          {/* In Progress Column */}
          <div className="w-80 flex flex-col gap-3">
            <div className="flex items-center justify-between mb-1 px-1">
              <h3 className="font-bold text-slate-900">In progress (7)</h3>
              <MoreHorizontal className="w-5 h-5 text-slate-400 cursor-pointer" />
            </div>
            
            <TaskCard 
              priority="URGENT" 
              priorityColor="text-orange-500"
              title="DB migration script" 
              initials="KR" 
              name="Karthik R." 
              date="17 Jan" 
              dateColor="text-orange-500 font-bold"
              isOrangeInitials
            />
            <TaskCard 
              priority="NORMAL" 
              priorityColor="text-blue-600"
              title="Code review backlog" 
              initials="DN" 
              name="Divya N." 
              date="22 Jan" 
            />
            <TaskCard 
              priority="LOW" 
              priorityColor="text-slate-500"
              title="Unit test coverage improvement" 
              initials="SK" 
              name="Sameer K." 
              date="30 Jan" 
            />
            
            <div className="text-center text-xs font-semibold text-slate-400 mt-2 cursor-pointer hover:text-slate-600">+ 4 more tasks</div>
          </div>

          {/* Blocked Column */}
          <div className="w-80 flex flex-col gap-3">
            <div className="flex items-center justify-between mb-1 px-1">
              <h3 className="font-bold text-slate-900">Blocked (1)</h3>
              <MoreHorizontal className="w-5 h-5 text-slate-400 cursor-pointer" />
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow-sm border border-rose-200 flex flex-col gap-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-600"></div>
                URGENT
              </div>
              <h4 className="font-bold text-slate-900 leading-snug">Payment gateway integration</h4>
              
              <div className="bg-rose-50 text-rose-700 p-2.5 rounded-md text-xs font-semibold flex gap-2 items-start">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>Blocked: Waiting on vendor API credentials</p>
              </div>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-[10px] font-bold text-orange-700">KR</div>
                  <span className="text-xs font-semibold text-slate-600">Karthik R.</span>
                </div>
                <span className="text-[10px] font-semibold text-slate-400 italic">Blocked since 13 Jan</span>
              </div>
            </div>
          </div>

          {/* Done Column */}
          <div className="w-80 flex flex-col gap-3">
            <div className="flex items-center justify-between mb-1 px-1 opacity-70">
              <h3 className="font-bold text-slate-900">Done this sprint (4)</h3>
              <MoreHorizontal className="w-5 h-5 text-slate-400 cursor-pointer" />
            </div>
            
            <div className="opacity-60">
              <TaskCard 
                priority="NORMAL" 
                priorityColor="text-slate-400"
                title={<span className="line-through text-slate-500">Login flow refactor</span>} 
                initials="PJ" 
                name="Pooja J." 
                date="" 
              />
            </div>
            <div className="opacity-60 mt-3">
              <TaskCard 
                priority="NORMAL" 
                priorityColor="text-slate-400"
                title={<span className="line-through text-slate-500">Add rate limiting</span>} 
                initials="AT" 
                name="Arjun T." 
                date="" 
                isDarkInitials
              />
            </div>
            
            <div className="text-center text-xs font-semibold text-slate-400 mt-2 cursor-pointer hover:text-slate-600">+ 2 more tasks</div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Subcomponents
function CalendarIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  );
}

function TaskCard({ priority, priorityColor, title, initials, name, date, dateColor = "text-slate-400", isDarkInitials = false, isOrangeInitials = false }: any) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-3 cursor-grab hover:border-slate-300 hover:shadow transition-all">
      <div className={`flex items-center gap-1.5 text-xs font-bold ${priorityColor}`}>
        <div className={`w-1.5 h-1.5 rounded-full bg-current`}></div>
        {priority}
      </div>
      <h4 className="font-bold text-slate-900 leading-snug">{title}</h4>
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
            isDarkInitials 
              ? 'bg-slate-900 text-white' 
              : isOrangeInitials 
                ? 'bg-orange-100 border border-orange-200 text-orange-700'
                : 'bg-slate-100 border border-slate-200 text-slate-600'
          }`}>
            {initials}
          </div>
          <span className="text-xs font-semibold text-slate-600">{name}</span>
        </div>
        {date && <span className={`text-[10px] font-bold ${dateColor}`}>{date}</span>}
      </div>
    </div>
  );
}
