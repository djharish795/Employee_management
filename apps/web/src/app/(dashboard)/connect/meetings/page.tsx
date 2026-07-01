"use client";

import React from "react";
import { Video, Clock, Calendar as CalendarIcon, Users, ExternalLink, FileText, ArrowRight } from "lucide-react";

export default function MeetingsPage() {
  const sections = [
    {
      title: "Today",
      meetings: [
        {
          id: "1",
          title: "Architecture Review",
          time: "11:00 AM - 12:00 PM",
          participants: ["Ravi Kumar", "Tejesh Kumar"],
          status: "Starts in 45m",
          statusColor: "text-amber-600 bg-amber-50 border-amber-200",
          platform: "Google Meet",
        },
        {
          id: "2",
          title: "Team Sync",
          time: "2:00 PM - 2:30 PM",
          participants: ["Arjun Thomas", "+3 others"],
          status: "Upcoming",
          statusColor: "text-blue-600 bg-blue-50 border-blue-200",
          platform: "Zoom",
        }
      ]
    },
    {
      title: "Tomorrow",
      meetings: [
        {
          id: "3",
          title: "1:1 with Manager",
          time: "10:30 AM - 11:00 AM",
          participants: ["Anita Menon"],
          status: "Upcoming",
          statusColor: "text-slate-600 bg-slate-50 border-slate-200",
          platform: "Google Meet",
        }
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto pb-10">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Upcoming Meetings</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">Your schedule for the next 7 days.</p>
        </div>
        <button className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl shadow-sm hover:bg-slate-800 transition-colors flex items-center gap-2">
          <CalendarIcon className="w-4 h-4" /> Open Full Calendar
        </button>
      </div>

      <div className="space-y-10">
        {sections.map((section) => (
          <div key={section.title}>
            <div className="flex items-center gap-4 mb-6">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{section.title}</h3>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            <div className="space-y-4">
              {section.meetings.map((meeting) => (
                <div key={meeting.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6">
                  
                  {/* Left: Info */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider ${meeting.statusColor}`}>
                        {meeting.status}
                      </span>
                      <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5"><Video className="w-3.5 h-3.5" /> {meeting.platform}</span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900">{meeting.title}</h4>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
                      <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {meeting.time}</span>
                      <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {meeting.participants.join(", ")}</span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap md:flex-nowrap items-center gap-2">
                    <button className="px-4 py-2 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 bg-white">
                      <FileText className="w-4 h-4" /> Notes
                    </button>
                    <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
                      Join Meet <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
