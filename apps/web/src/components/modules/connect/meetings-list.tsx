import React from "react";
import { ArrowRight, Video } from "lucide-react";
import { useRouter } from "next/navigation";

export function MeetingsList() {
  const router = useRouter();
  const upcomingMeetings = [
    {
      id: "m1",
      dateBadge: "16 JAN",
      title: "Quick sync",
      time: "10:00 AM - 10:30 AM",
      participants: "with Lokesh",
    },
    {
      id: "m2",
      dateBadge: "17 JAN",
      title: "1:1 with manager",
      time: "2:00 PM - 2:30 PM",
      participants: "with Anita Menon",
    },
    {
      id: "m3",
      dateBadge: "20 JAN",
      title: "Team sync",
      time: "11:00 AM - 11:30 AM",
      participants: "with Arjun Thomas",
    },
  ];

  const pendingRequests = [
    {
      id: "r1",
      name: "Lokesh",
      status: "Pending",
      subtext: "You requested • waiting for response",
      avatarBg: "bg-slate-200",
      initials: "L",
    },
    {
      id: "r2",
      name: "Tejesh Kumar",
      status: "Pending",
      subtext: "You requested • waiting for response",
      avatarBg: "bg-slate-200",
      initials: "TK",
    },
  ];

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
          {upcomingMeetings.map((meeting) => (
            <div key={meeting.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors gap-4">
              <div className="flex items-start sm:items-center gap-4">
                <div className="bg-slate-100 rounded-lg p-2 min-w-[56px] text-center flex-shrink-0">
                  <div className="text-lg font-black text-slate-900 leading-none">{meeting.dateBadge.split(' ')[0]}</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">{meeting.dateBadge.split(' ')[1]}</div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{meeting.title}</h4>
                  <p className="text-xs font-medium text-slate-500 mt-1">
                    {meeting.time} <span className="mx-1">•</span> {meeting.participants}
                  </p>
                </div>
              </div>
              <button onClick={() => window.open('https://meet.google.com/new', '_blank')} className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-sm font-semibold text-slate-700 shadow-sm transition-all sm:w-auto w-full">
                Join Meet
              </button>
            </div>
          ))}
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
          {pendingRequests.map((req) => (
            <div key={req.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
              <div className={`w-10 h-10 rounded-full ${req.avatarBg} flex items-center justify-center flex-shrink-0 text-slate-600 font-bold text-sm`}>
                {req.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-900 truncate">{req.name}</h4>
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-100 rounded-md text-[10px] font-bold uppercase tracking-wider flex-shrink-0">
                    {req.status}
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-500 mt-1 truncate">
                  {req.subtext}
                </p>
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
