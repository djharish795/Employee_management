"use client";

import React, { useState, useEffect } from "react";
import { ArrowRight, Video } from "lucide-react";
import { useRouter } from "next/navigation";
import { connectApi } from "@/lib/api/connect";

export function MeetingsList() {
  const router = useRouter();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMeetings = async () => {
    try {
      const res = await connectApi.getMyMeetings();
      setMeetings(res.data);
    } catch (err) {
      console.error("Failed to load meetings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeetings();
  }, []);

  const handleAccept = async (id: string) => {
    try {
      await connectApi.acceptMeet(id);
      loadMeetings();
    } catch (err) {
      console.error("Failed to accept meeting", err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await connectApi.rejectMeet(id);
      loadMeetings();
    } catch (err) {
      console.error("Failed to reject meeting", err);
    }
  };

  const upcomingMeetings = meetings.filter(m => m.status === "ACCEPTED");
  const pendingRequests = meetings.filter(m => m.status === "PENDING");

  const formatDateBadge = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' }).toUpperCase()}`;
  };

  const formatTime = (startStr: string, endStr: string) => {
    const s = new Date(startStr);
    const e = new Date(endStr);
    return `${s.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${e.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Upcoming Meetings - Spans 2 Columns */}
      <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Your upcoming meetings</h3>
          <button onClick={() => router.push("/connect/meetings")} className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[400px]">
          {loading ? (
             <div className="p-4 text-center text-sm font-medium text-slate-500">Loading meetings...</div>
          ) : upcomingMeetings.length === 0 ? (
             <div className="p-4 text-center text-sm font-medium text-slate-500">No upcoming meetings.</div>
          ) : upcomingMeetings.map((meeting) => {
            const dateBadge = formatDateBadge(meeting.startTime);
            return (
            <div key={meeting.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors gap-4">
              <div className="flex items-start sm:items-center gap-4">
                <div className="bg-slate-100 rounded-lg p-2 min-w-[56px] text-center flex-shrink-0">
                  <div className="text-lg font-black text-slate-900 leading-none">{dateBadge.split(' ')[0]}</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">{dateBadge.split(' ')[1]}</div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{meeting.title}</h4>
                  <p className="text-xs font-medium text-slate-500 mt-1">
                    {formatTime(meeting.startTime, meeting.endTime)}
                  </p>
                </div>
              </div>
              {meeting.meetLink && (
                <button onClick={() => window.open(meeting.meetLink, '_blank')} className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-sm font-semibold text-slate-700 shadow-sm transition-all sm:w-auto w-full">
                  <Video className="w-4 h-4 text-indigo-600" /> Join Meet
                </button>
              )}
            </div>
          )})}
        </div>
      </div>

      {/* Pending Requests - Spans 1 Column */}
      <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 pb-4 flex items-center gap-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Pending requests</h3>
          <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
            {pendingRequests.length}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[400px]">
          {loading ? (
             <div className="p-4 text-center text-sm font-medium text-slate-500">Loading requests...</div>
          ) : pendingRequests.length === 0 ? (
             <div className="p-4 text-center text-sm font-medium text-slate-500">No pending requests.</div>
          ) : pendingRequests.map((req) => (
            <div key={req.id} className="flex flex-col gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-900 truncate">{req.title}</h4>
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-100 rounded-md text-[10px] font-bold uppercase tracking-wider flex-shrink-0">
                    PENDING
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-500 mt-1 truncate">
                  {formatTime(req.startTime, req.endTime)}
                </p>
              </div>
              <div className="flex gap-2 w-full">
                 <button onClick={() => handleAccept(req.id)} className="flex-1 bg-indigo-600 text-white text-xs font-bold py-1.5 rounded hover:bg-indigo-700 transition-colors">Accept</button>
                 <button onClick={() => handleReject(req.id)} className="flex-1 bg-white text-slate-700 border border-slate-200 text-xs font-bold py-1.5 rounded hover:bg-slate-50 transition-colors">Reject</button>
              </div>
            </div>
          ))}
          
          <div className="pt-4 mt-2 border-t border-slate-100 text-center">
            <button onClick={() => router.push("/connect/requests")} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center justify-center gap-1 mx-auto transition-colors">
              View all requests <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
