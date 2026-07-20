"use client";

import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, 
  PlusCircle, X, Loader2, CheckCircle, XCircle, Clock
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth, isSameMonth, isSameDay, isBefore, startOfDay, parse } from 'date-fns';
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { connectApi } from '../../../../lib/api/connect';
import toast from 'react-hot-toast';

export default function CamSchedulerPage() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const queryClient = useQueryClient();

  // Fetch meetings
  const { data: response, isLoading } = useQuery({
    queryKey: ['meetings'],
    queryFn: connectApi.getMyMeetings
  });
  
  // The API might return { data: [...] } or just [...]
  const fetchedMeetings = response?.data || response || [];

  // Create meeting mutation
  const createMeetMutation = useMutation({
    mutationFn: connectApi.createMeet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      setNewTaskTitle('');
      setNewTaskTime('');
      setNewTaskDesc('');
      setIsModalOpen(false);
      toast.success("Meeting scheduled successfully");
    },
    onError: () => {
      toast.error("Failed to schedule meeting");
    }
  });

  const acceptMeetMutation = useMutation({
    mutationFn: (id: string) => connectApi.acceptMeet(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      toast.success("Meeting accepted");
    }
  });

  const rejectMeetMutation = useMutation({
    mutationFn: (id: string) => connectApi.rejectMeet(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      toast.success("Meeting rejected");
    }
  });
  
  // New meeting form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  
  const dateFormat = "d";
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const handleDateClick = (day: Date) => {
    setCurrentDate(day);
    // Allow adding meetings for today or future dates
    if (!isBefore(day, startOfDay(today))) {
      setIsModalOpen(true);
    }
  };

  const handleSaveTask = () => {
    if (!newTaskTitle) return;
    
    // Create start and end times
    let startTime = new Date(currentDate);
    if (newTaskTime) {
      try {
        const parsedTime = parse(newTaskTime, 'HH:mm', new Date());
        startTime.setHours(parsedTime.getHours(), parsedTime.getMinutes(), 0, 0);
      } catch (e) {
        console.error("Failed to parse time", e);
      }
    } else {
      startTime.setHours(9, 0, 0, 0); // Default to 9 AM
    }
    
    const endTime = new Date(startTime);
    endTime.setHours(startTime.getHours() + 1); // Default to 1 hour duration

    createMeetMutation.mutate({
      title: newTaskTitle,
      description: newTaskDesc,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      type: "ONE_ON_ONE"
    });
  };

  const formatTime = (dateObj: Date | string) => {
    if (!dateObj) return '';
    try {
      return format(new Date(dateObj), 'hh:mm a');
    } catch {
      return '';
    }
  };

  const isCurrentOrFuture = !isBefore(currentDate, startOfDay(today));
  
  // Helper to parse date from meeting
  const getMeetingDate = (meeting: any) => {
    return meeting.startTime ? new Date(meeting.startTime) : new Date(meeting.createdAt);
  };

  // Get meetings for the currently selected date
  const currentDayMeetings = Array.isArray(fetchedMeetings) 
    ? fetchedMeetings
        .filter(m => isSameDay(getMeetingDate(m), currentDate))
        .sort((a, b) => getMeetingDate(a).getTime() - getMeetingDate(b).getTime())
    : [];

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Meeting Scheduler</h1>
          <p className="text-slate-500 mt-1">Manage your client consultations and upcoming strategy sessions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Main Content Area */}
        <div className="xl:col-span-8 space-y-8">
          
          {/* Calendar Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-bold text-slate-900">{format(currentDate, "MMMM yyyy")}</h2>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                    className="p-1 hover:bg-slate-100 rounded-md transition-colors text-slate-600"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                    className="p-1 hover:bg-slate-100 rounded-md transition-colors text-slate-600"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <button 
                onClick={() => setCurrentDate(today)}
                className="px-3 py-1.5 border border-blue-200 text-blue-600 text-sm font-semibold rounded-lg hover:bg-blue-50 transition-colors"
              >
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
            <div className="grid grid-cols-7 border-t border-l border-slate-200">
              {calendarDays.map((day, i) => {
                const isSelected = isSameDay(day, currentDate);
                const isCurrentMonth = isSameMonth(day, currentDate);
                
                // Get up to 2 meetings for this day to show on the calendar grid
                const dayMeetings = Array.isArray(fetchedMeetings) 
                  ? fetchedMeetings
                      .filter(m => isSameDay(getMeetingDate(m), day))
                      .sort((a, b) => getMeetingDate(a).getTime() - getMeetingDate(b).getTime())
                      .slice(0, 2)
                  : [];
                
                return (
                  <div 
                    key={i} 
                    onClick={() => handleDateClick(day)}
                    className={`min-h-[100px] border-r border-b border-slate-200 p-2 relative cursor-pointer hover:bg-slate-50 transition-colors ${!isCurrentMonth ? 'bg-slate-50 ' : 'bg-white '} ${isSelected ? 'ring-2 ring-blue-500 ring-inset bg-blue-50/50 ' : ''}`}
                  >
                    <span className={`text-sm font-medium ${!isCurrentMonth ? 'text-slate-400 ' : isSelected ? 'text-blue-600 font-bold' : 'text-slate-700 '}`}>
                      {format(day, dateFormat)}
                    </span>
                    
                    <div className="mt-1 space-y-1">
                      {dayMeetings.map((meeting: any, idx) => (
                        <div key={meeting.id} className={`px-1.5 py-0.5 text-[10px] font-bold rounded flex items-center gap-1 truncate w-full ${idx === 0 ? 'bg-blue-100 text-blue-700 ' : 'bg-slate-900 text-white'}`}>
                          {meeting.startTime ? `${formatTime(meeting.startTime)} ` : ''}{meeting.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
        </div>

        {/* Daily Tasks Panel */}
        <div className="xl:col-span-4 h-full xl:sticky xl:top-6">
          <div className="bg-white rounded-xl p-6 text-slate-900 min-h-[600px] border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[17px] font-bold text-slate-900">
                {isSameDay(currentDate, today) ? "Today" : format(currentDate, "EEEE d")}
              </h3>
              {isCurrentOrFuture && (
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="text-slate-400 hover:text-slate-900 transition-colors"
                  title="Add Meeting"
                >
                  <PlusCircle className="w-5 h-5 font-light" strokeWidth={1.5} />
                </button>
              )}
            </div>
            
            <div className="space-y-6 mt-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-10 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : currentDayMeetings.length > 0 ? (
                currentDayMeetings.map((meeting: any, idx) => {
                  const meetingTimeStr = meeting.startTime ? formatTime(meeting.startTime) : '';
                  const prevMeetingTimeStr = idx > 0 && currentDayMeetings[idx - 1].startTime ? formatTime(currentDayMeetings[idx - 1].startTime) : null;
                  
                  return (
                    <React.Fragment key={meeting.id}>
                      {idx > 0 && meetingTimeStr && prevMeetingTimeStr !== meetingTimeStr && (
                        <div className="text-[13px] font-medium text-slate-500 mt-2 mb-2">
                          {meetingTimeStr}
                        </div>
                      )}
                      {idx === 0 && meetingTimeStr && (
                        <div className="text-[13px] font-medium text-slate-500 mt-2 mb-2">
                          {meetingTimeStr}
                        </div>
                      )}
                      <div className="flex justify-between items-center relative pl-3 group">
                        <div className={`absolute left-0 top-0.5 bottom-0.5 w-1 rounded-full ${meeting.status === 'PENDING' ? 'bg-amber-400' : meeting.status === 'REJECTED' ? 'bg-rose-500' : 'bg-blue-500'}`}></div>
                        <div className="flex-1 pr-4">
                          <div className="flex items-center gap-2">
                            <h4 className="text-[15px] font-semibold text-slate-900">{meeting.title}</h4>
                            {meeting.status === 'PENDING' && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">PENDING</span>}
                            {meeting.status === 'ACCEPTED' && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">ACCEPTED</span>}
                            {meeting.status === 'REJECTED' && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">REJECTED</span>}
                          </div>
                          <p className="text-[13px] text-slate-500 mt-0.5">{meeting.description || 'No description'}</p>
                        </div>
                        
                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-1 mr-2">
                          {meeting.status === 'PENDING' && (
                            <>
                              <button 
                                onClick={() => acceptMeetMutation.mutate(meeting.id)}
                                disabled={acceptMeetMutation.isPending}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded" title="Accept">
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => rejectMeetMutation.mutate(meeting.id)}
                                disabled={rejectMeetMutation.isPending}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded" title="Reject">
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>

                        <div className={`w-[60px] h-[36px] rounded relative overflow-hidden flex-shrink-0 flex items-center justify-center ${meeting.status === 'PENDING' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-500'}`}>
                          <div className="w-full h-full flex items-center justify-center text-[10px] font-bold">MEET</div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })
              ) : (
                <div className="text-[13px] text-slate-500">No events today.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Add Meeting for {format(currentDate, "MMM d, yyyy")}</h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 transition-colors"
                disabled={createMeetMutation.isPending}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Meeting Title</label>
                <input 
                  type="text" 
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-transparent text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="e.g. Discovery Call" 
                  disabled={createMeetMutation.isPending}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                <input 
                  type="time" 
                  value={newTaskTime}
                  onChange={(e) => setNewTaskTime(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-transparent text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 [color-scheme:light]" 
                  disabled={createMeetMutation.isPending}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea 
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-transparent text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="Meeting details..." 
                  rows={3}
                  disabled={createMeetMutation.isPending}
                />
              </div>
            </div>
            <div className="p-4 bg-slate-50 flex justify-end gap-3 border-t border-slate-100">
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                disabled={createMeetMutation.isPending}
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveTask}
                disabled={!newTaskTitle || createMeetMutation.isPending}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {createMeetMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Meeting
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
