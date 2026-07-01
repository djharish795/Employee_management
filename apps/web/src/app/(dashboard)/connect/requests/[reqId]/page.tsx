"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, Video } from "lucide-react";

export default function RequestDetailsPage({ params }: { params: { reqId: string } }) {
  // Hardcoded for UI matching based on screenshot 2
  const name = "Ravi Kumar";
  const role = "Software Engineer · Engineering";
  const initials = "RK";
  const timeRequested = "Requested 2 hours ago";

  const timeSlots = [
    { time: "9:30 AM", status: "available" },
    { time: "10:00 AM", status: "selected" }, // The proposed time
    { time: "10:30 AM", status: "available" },
    { time: "11:00 AM", status: "busy" },
    { time: "11:30 AM", status: "busy" },
    { time: "12:00 PM", status: "available" },
  ];

  return (
    <div className="max-w-4xl mx-auto pb-16 pt-8">
      
      <div className="mb-8">
        <h1 className="text-[28px] font-extrabold text-slate-900 tracking-tight">Meeting request</h1>
      </div>

      {/* Blue Banner */}
      <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-xl p-4 flex items-center gap-3 mb-8">
        <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0" />
        <p className="text-sm font-semibold text-blue-700">
          You're viewing this because {name} requested a meeting with you.
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white border border-slate-200 rounded-[20px] p-8 shadow-sm">
        
        {/* Profile Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-[52px] h-[52px] rounded-full bg-[#e2e8f0] text-slate-700 flex items-center justify-center text-lg font-bold">
              {initials}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{name}</h2>
              <p className="text-sm font-medium text-slate-500">{role}</p>
            </div>
          </div>
          <span className="text-[13px] font-medium text-slate-400 mt-2">{timeRequested}</span>
        </div>

        {/* Details Grid */}
        <div className="space-y-6">
          <div>
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Meeting Type</h3>
            <p className="text-base font-bold text-slate-900">Quick call</p>
          </div>

          <div>
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Proposed Time</h3>
            <div className="flex items-center gap-2 text-base font-bold text-slate-900">
              <Calendar className="w-5 h-5 text-slate-700" />
              Today, 16 January - 10:00 AM - 10:30 AM
            </div>
          </div>

          <div>
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Agenda</h3>
            <p className="text-[15px] font-medium text-slate-700 leading-relaxed max-w-2xl">
              "Quick sync on the Q1 hiring plan for the backend team - want to align before posting the new roles."
            </p>
          </div>
        </div>

        {/* Availability Comparison */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-bold text-slate-900">Your availability around this time</h3>
            <span className="text-[12px] font-medium text-slate-500">Synced with Google Calendar</span>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {timeSlots.map((slot, idx) => (
              <div 
                key={idx}
                className={`flex flex-col items-center justify-center px-4 py-2.5 rounded-lg border text-sm font-bold transition-all min-w-[90px] ${
                  slot.status === "selected" 
                  ? "bg-[#111827] text-white border-[#111827] shadow-md"
                  : slot.status === "busy"
                  ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-75"
                  : "bg-white text-slate-700 border-slate-200"
                }`}
              >
                {slot.time}
                {slot.status === "busy" && <span className="text-[9px] uppercase tracking-wider mt-0.5 opacity-80">Busy</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-4 mt-8 pt-6 border-t border-slate-100">
          <button className="px-6 py-3 rounded-xl border border-red-500 text-red-600 font-bold text-sm hover:bg-red-50 transition-colors">
            Decline
          </button>
          <button className="px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors">
            Propose different time
          </button>
          <button className="px-6 py-3 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white font-bold text-sm shadow-sm transition-colors flex items-center gap-2">
            <Video className="w-4 h-4" /> Approve & create Meet link
          </button>
        </div>
        
        <p className="text-center text-[12px] font-medium text-slate-500 mt-6">
          Approving will create a Google Calendar event with a Meet link for both of you
        </p>

      </div>

      {/* Footer Back Link */}
      <div className="mt-8 text-center">
        <Link href="/connect/requests" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to all requests
        </Link>
      </div>

    </div>
  );
}
