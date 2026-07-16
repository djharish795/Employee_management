"use client";

import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, List, ChevronLeft, ChevronRight, 
  MoreVertical, Video, FileText, CheckCircle2, Clock, PlusCircle,
  Download, X, Eye
} from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth, isSameMonth, isSameDay, isToday } from 'date-fns';
import Image from "next/image";
import { CamSchedulerChat, Message } from '../../../../components/cam/CamSchedulerChat';

export default function CamSchedulerPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2023, 8, 7)); // September 7, 2023 to match mockup
  const [messages, setMessages] = useState<Message[]>([]);
  const [showFilesDropdown, setShowFilesDropdown] = useState(false);
  
  const fileMessages = messages.filter(m => m.isFile);
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  
  const dateFormat = "d";
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Meeting Scheduler</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your client consultations and upcoming strategy sessions.</p>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setShowFilesDropdown(!showFilesDropdown)}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Files
          </button>

          {showFilesDropdown && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 p-4 animate-in slide-in-from-top-2">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Download className="w-4 h-4 text-blue-500" />
                  Past Uploads
                </h3>
                <button onClick={() => setShowFilesDropdown(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {fileMessages.length === 0 ? (
                <div className="text-center py-6 text-sm text-slate-500">
                  No files uploaded yet. Upload via chat to see them here.
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {fileMessages.map(msg => (
                    <div key={msg.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
                      <div className="flex items-start gap-3 overflow-hidden">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-md text-blue-600 dark:text-blue-400 flex-shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate" title={msg.text.replace("Shared a file: ", "")}>
                            {msg.text.replace("Shared a file: ", "")}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            Uploaded by {msg.senderName}
                          </p>
                        </div>
                      </div>
                      {msg.fileUrl && (
                        <div className="flex items-center gap-1">
                          <a href={msg.fileUrl} target="_blank" rel="noreferrer" className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="View Document">
                            <Eye className="w-4 h-4" />
                          </a>
                          <a href={msg.fileUrl} download={msg.text.replace("Shared a file: ", "")} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Download">
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Main Content Area */}
        <div className="xl:col-span-8 space-y-8">
          
          {/* Calendar Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{format(currentDate, "MMMM yyyy")}</h2>
                <div className="flex items-center gap-1">
                  <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors text-slate-600 dark:text-slate-400">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors text-slate-600 dark:text-slate-400">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <button className="px-3 py-1.5 border border-blue-200 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 text-sm font-semibold rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                Today
              </button>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 mb-2">
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                <div key={day} className="text-center text-[10px] font-bold text-slate-400 tracking-wider">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 border-t border-l border-slate-200 dark:border-slate-800">
              {calendarDays.map((day, i) => {
                const isSelected = isSameDay(day, currentDate);
                const isCurrentMonth = isSameMonth(day, currentDate);
                
                return (
                  <div 
                    key={i} 
                    className={`min-h-[100px] border-r border-b border-slate-200 dark:border-slate-800 p-2 relative ${!isCurrentMonth ? 'bg-slate-50 dark:bg-slate-900/50' : 'bg-white dark:bg-slate-900'} ${isSelected ? 'ring-2 ring-blue-500 ring-inset bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                  >
                    <span className={`text-sm font-medium ${!isCurrentMonth ? 'text-slate-400 dark:text-slate-600' : isSelected ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-700 dark:text-slate-300'}`}>
                      {format(day, dateFormat)}
                    </span>
                    
                    {/* Render specific events based on the date to match mockup */}
                    {isSameDay(day, new Date(2023, 8, 4)) && (
                      <div className="mt-1 px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-[10px] font-bold rounded flex items-center gap-1 truncate w-full">
                        10:00 AM Discovery
                      </div>
                    )}
                    
                    {isSelected && (
                      <div className="mt-1 space-y-1">
                        <div className="px-1.5 py-0.5 bg-slate-900 dark:bg-slate-700 text-white text-[10px] font-bold rounded flex items-center gap-1 truncate w-full">
                          09:30 AM Onboarding
                        </div>
                        <div className="px-1.5 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded flex items-center gap-1 truncate w-full">
                          02:00 PM Follow-up
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>




          
        </div>

        {/* Sidebar Chat */}
        <div className="xl:col-span-4 h-full xl:sticky xl:top-6" style={{ height: "calc(100vh - 150px)", minHeight: "600px" }}>
          <CamSchedulerChat messages={messages} setMessages={setMessages} />
        </div>
      </div>
    </div>
  );
}
