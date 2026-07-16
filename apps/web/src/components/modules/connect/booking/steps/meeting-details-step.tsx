"use client";

import React from "react";
import { BookingState } from "../booking-wizard";
import { ChevronLeft, ArrowRight, Clock, Video, FileText, AlertCircle, Calendar } from "lucide-react";

interface MeetingDetailsStepProps {
  data: BookingState;
  updateData: (data: Partial<BookingState>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function MeetingDetailsStep({ data, updateData, onNext, onPrev }: MeetingDetailsStepProps) {
  const durations = [15, 30, 45, 60, 90, 120];
  const priorities = ["Normal", "High", "Urgent"];
  const platforms = ["Google Meet", "Microsoft Teams", "Zoom", "Office"];

  return (
    <div className="max-w-3xl mx-auto pb-10">
      
      {/* Header & Progress */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={onPrev} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Step 2 of 4</div>
          <div className="flex gap-1.5">
            <div className="w-8 h-1.5 rounded-full bg-slate-900"></div>
            <div className="w-8 h-1.5 rounded-full bg-slate-900"></div>
            <div className="w-8 h-1.5 rounded-full bg-slate-200"></div>
            <div className="w-8 h-1.5 rounded-full bg-slate-200"></div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Meeting Details</h2>

        <div className="space-y-8">
          {/* Title & Agenda */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Meeting Title</label>
              <input 
                type="text" 
                placeholder="e.g., Q1 Hiring Plan Sync"
                value={data.title}
                onChange={(e) => updateData({ title: e.target.value })}
                className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all hover:bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" /> Agenda / Description
              </label>
              <textarea 
                rows={4}
                placeholder="What will be discussed?"
                value={data.agenda}
                onChange={(e) => updateData({ agenda: e.target.value })}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all hover:bg-white resize-none"
              ></textarea>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Configuration Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Duration & Priority */}
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Duration
                </label>
                <div className="flex flex-wrap gap-2">
                  {durations.map(d => (
                    <button 
                      key={d}
                      onClick={() => updateData({ duration: d })}
                      className={`px-3 py-2 rounded-lg text-sm font-bold transition-all border ${
                        data.duration === d 
                        ? "bg-slate-900 border-slate-900 text-white" 
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {d}m
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Priority
                </label>
                <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit">
                  {priorities.map(p => (
                    <button
                      key={p}
                      onClick={() => updateData({ priority: p })}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                        data.priority === p 
                        ? "bg-white text-slate-900 shadow-sm" 
                        : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Platform & Options */}
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Video className="w-4 h-4" /> Platform
                </label>
                <div className="flex flex-col gap-2">
                  {platforms.map(p => (
                    <label key={p} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      data.platform === p 
                      ? "border-blue-500 bg-blue-50/50" 
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}>
                      <input 
                        type="radio" 
                        name="platform" 
                        checked={data.platform === p}
                        onChange={() => updateData({ platform: p })}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      <span className="text-sm font-bold text-slate-700">{p}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Additional Options */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Calendar Options
            </label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={data.notifyAttendees}
                  onChange={(e) => updateData({ notifyAttendees: e.target.checked })}
                  className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 transition-colors"
                />
                <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">Notify attendee via email</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={data.attachInvite}
                  onChange={(e) => updateData({ attachInvite: e.target.checked })}
                  className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 transition-colors"
                />
                <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">Attach standard calendar invite (.ics)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={data.recordMeeting}
                  onChange={(e) => updateData({ recordMeeting: e.target.checked })}
                  className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 transition-colors"
                />
                <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">Record meeting automatically (if supported)</span>
              </label>
            </div>
          </div>

        </div>

        {/* Action Bar */}
        <div className="mt-10 flex justify-end">
          <button 
            onClick={onNext}
            disabled={!data.title.trim()}
            className={`px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
              data.title.trim() 
              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            Continue to Review <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
