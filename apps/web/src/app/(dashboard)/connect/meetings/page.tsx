"use client";

import React, { useState, useEffect } from "react";
import { Video, Clock, Calendar as CalendarIcon, Users, ExternalLink, FileText, ArrowRight } from "lucide-react";
import { connectApi } from "@/lib/api/connect";

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMeetings = async () => {
    try {
      setLoading(true);
      const res = await connectApi.getMyMeetings();
      // Only show ACCEPTED meetings here
      const accepted = (res.data || []).filter((m: any) => m.status === "ACCEPTED");
      setMeetings(accepted);
    } catch (error) {
      console.error("Failed to load meetings", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeetings();
  }, []);

  const formatTime = (start: string, end: string) => {
    const s = new Date(start).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const e = new Date(end).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return `${s} - ${e}`;
  };

  const getPlatformName = (link: string | null | undefined) => {
    if (!link) return "Meeting";
    if (link.includes("zoom.us")) return "Zoom";
    if (link.includes("meet.google.com")) return "Google Meet";
    if (link.includes("teams.microsoft.com")) return "Microsoft Teams";
    return "Video Meet";
  };

  // Grouping logic
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const sectionsMap: Record<string, any[]> = {
    "Today": [],
    "Tomorrow": [],
    "Later": []
  };

  meetings.forEach(meet => {
    const meetDate = new Date(meet.startTime);
    meetDate.setHours(0, 0, 0, 0);

    if (meetDate.getTime() === today.getTime()) {
      sectionsMap["Today"].push(meet);
    } else if (meetDate.getTime() === tomorrow.getTime()) {
      sectionsMap["Tomorrow"].push(meet);
    } else {
      sectionsMap["Later"].push(meet);
    }
  });

  const sections = Object.keys(sectionsMap)
    .filter(key => sectionsMap[key].length > 0)
    .map(key => ({
      title: key,
      meetings: sectionsMap[key]
    }));

  return (
    <div className="max-w-4xl mx-auto pb-10">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Upcoming Meetings</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">Your schedule for the next 7 days.</p>
        </div>
        <a href="/connect/meetings/calendar" className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl shadow-sm hover:bg-slate-800 transition-colors flex items-center gap-2">
          <CalendarIcon className="w-4 h-4" /> Open Full Calendar
        </a>
      </div>

      <div className="space-y-10">
        {loading ? (
          <div className="text-center py-10 text-slate-500 font-medium">Loading your schedule...</div>
        ) : sections.length === 0 ? (
          <div className="text-center py-10 text-slate-500 font-medium">No upcoming meetings scheduled.</div>
        ) : sections.map((section) => (
          <div key={section.title}>
            <div className="flex items-center gap-4 mb-6">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{section.title}</h3>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            <div className="space-y-4">
              {section.meetings.map((meeting) => {
                const startTime = new Date(meeting.startTime);
                const isSoon = section.title === "Today" && (startTime.getTime() - new Date().getTime()) < (60 * 60 * 1000) && (startTime.getTime() > new Date().getTime());
                
                return (
                <div key={meeting.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6">
                  
                  {/* Left: Info */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider ${isSoon ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-blue-600 bg-blue-50 border-blue-200'}`}>
                        {isSoon ? "Starts Soon" : "Upcoming"}
                      </span>
                      <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5"><Video className="w-3.5 h-3.5" /> {getPlatformName(meeting.meetLink)}</span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900">{meeting.title}</h4>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
                      <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {formatTime(meeting.startTime, meeting.endTime)}</span>
                      <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {
                        (() => {
                          const myEmployeeId = typeof window !== 'undefined' ? localStorage.getItem("employeeId") : null;
                          const otherPerson = meeting.requesterId === myEmployeeId ? meeting.assignee : meeting.requester;
                          if (!otherPerson) return "Team";
                          return `${otherPerson.firstName} ${otherPerson.lastName || ""}`.trim();
                        })()
                      }</span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap md:flex-nowrap items-center gap-2">
                    {meeting.meetLink && (
                      <button onClick={() => window.open(meeting.meetLink, '_blank')} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
                        Join Meet <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                </div>
              )})}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
