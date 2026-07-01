"use client";

import React from "react";
import { BookingState } from "../booking-wizard";
import { ChevronLeft, Check, AlertTriangle, Calendar, Clock, Video, FileText, User } from "lucide-react";

interface ReviewRequestStepProps {
  data: BookingState;
  onNext: () => void;
  onPrev: () => void;
}

export function ReviewRequestStep({ data, onNext, onPrev }: ReviewRequestStepProps) {
  const employeeName = data.employeeId === "2" ? "Lokesh" : "Anita Menon";
  
  // Mock conflict detection
  const hasConflict = data.selectedTime === "10:30 AM";

  return (
    <div className="max-w-2xl mx-auto pb-10">
      
      {/* Header & Progress */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={onPrev} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Edit Details
        </button>
        <div className="flex items-center gap-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Step 3 of 4</div>
          <div className="flex gap-1.5">
            <div className="w-8 h-1.5 rounded-full bg-slate-900"></div>
            <div className="w-8 h-1.5 rounded-full bg-slate-900"></div>
            <div className="w-8 h-1.5 rounded-full bg-slate-900"></div>
            <div className="w-8 h-1.5 rounded-full bg-slate-200"></div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Review Request</h2>
        <p className="text-sm font-medium text-slate-500 mb-8">Please confirm the details below before sending.</p>

        {/* Conflict Warning */}
        {hasConflict && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-900">Potential Schedule Conflict</h4>
              <p className="text-xs font-medium text-amber-700 mt-1">{employeeName} recently accepted another meeting near this time. They may ask to reschedule.</p>
            </div>
            <button onClick={onPrev} className="ml-auto text-xs font-bold text-amber-700 hover:text-amber-900 underline">Change Time</button>
          </div>
        )}

        {/* Summary Card */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 space-y-6">
          
          <div>
            <h3 className="text-lg font-bold text-slate-900">{data.title}</h3>
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                data.priority === 'Urgent' ? 'bg-red-100 text-red-700' :
                data.priority === 'High' ? 'bg-amber-100 text-amber-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {data.priority} Priority
              </span>
              <span className="text-xs font-bold text-slate-500">{data.meetingType}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-6 gap-x-4">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><User className="w-3 h-3" /> With</p>
              <p className="text-sm font-bold text-slate-900">{employeeName}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Video className="w-3 h-3" /> Platform</p>
              <p className="text-sm font-bold text-slate-900">{data.platform}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Date</p>
              <p className="text-sm font-bold text-slate-900">{data.selectedDate?.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Clock className="w-3 h-3" /> Time</p>
              <p className="text-sm font-bold text-slate-900">{data.selectedTime} <span className="text-slate-400 font-medium ml-1">({data.duration}m)</span></p>
            </div>
          </div>

          {data.agenda && (
            <div className="pt-4 border-t border-slate-200">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><FileText className="w-3 h-3" /> Agenda</p>
              <p className="text-sm font-medium text-slate-700 whitespace-pre-wrap">{data.agenda}</p>
            </div>
          )}

          <div className="pt-4 border-t border-slate-200 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
              <Check className="w-3.5 h-3.5 text-emerald-500" /> Notifications enabled
            </div>
            {data.attachInvite && (
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                <Check className="w-3.5 h-3.5 text-emerald-500" /> Calendar invite attached
              </div>
            )}
          </div>
        </div>

        {/* Action Bar */}
        <div className="mt-8">
          <button 
            onClick={onNext}
            className="w-full py-4 rounded-xl text-base font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20 transition-all flex items-center justify-center gap-2"
          >
            Confirm & Send Request
          </button>
        </div>

      </div>
    </div>
  );
}
