"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { BookingState } from "../booking-wizard";
import { CheckCircle2, ArrowRight, Clock, CalendarClock, LayoutDashboard } from "lucide-react";

interface ConfirmationStepProps {
  data: BookingState;
}

export function ConfirmationStep({ data }: ConfirmationStepProps) {
  const router = useRouter();

  return (
    <div className="max-w-xl mx-auto pt-10 pb-16 text-center">
      
      {/* Success Animation & Header */}
      <div className="mb-8 flex flex-col items-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">Meeting Request Sent</h2>
        <p className="text-base font-medium text-slate-500">
          Your request for <span className="font-bold text-slate-700">{data.selectedTime}</span> on <span className="font-bold text-slate-700">{data.selectedDate?.toLocaleDateString()}</span> has been sent successfully.
        </p>
      </div>

      {/* Progress Timeline */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-left mb-10">
        <h3 className="text-sm font-bold text-slate-900 mb-6">What happens next?</h3>
        
        <div className="relative border-l-2 border-slate-100 ml-3 space-y-8">
          
          <div className="relative">
            <div className="absolute -left-[33px] top-0.5 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center border-4 border-white">
              <CheckCircle2 className="w-3 h-3 text-white" />
            </div>
            <div className="pl-6">
              <h4 className="text-sm font-bold text-slate-900">Request Sent</h4>
              <p className="text-xs font-medium text-slate-500 mt-1">Invitation delivered to recipient.</p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-[33px] top-0.5 w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center border-4 border-white">
              <Clock className="w-3 h-3 text-amber-600" />
            </div>
            <div className="pl-6">
              <h4 className="text-sm font-bold text-slate-900">Waiting for Response</h4>
              <p className="text-xs font-medium text-slate-500 mt-1">The recipient will review and approve or suggest a new time.</p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-[33px] top-0.5 w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center border-4 border-white">
              <CalendarClock className="w-3 h-3 text-slate-400" />
            </div>
            <div className="pl-6">
              <h4 className="text-sm font-bold text-slate-400">Calendar Sync Pending</h4>
              <p className="text-xs font-medium text-slate-400 mt-1">Once approved, it will automatically appear on your calendar.</p>
            </div>
          </div>

        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <button 
          onClick={() => router.push("/connect/requests")}
          className="w-full py-3.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all flex items-center justify-center gap-2"
        >
          View My Requests <ArrowRight className="w-4 h-4" />
        </button>
        <button 
          onClick={() => router.push("/connect")}
          className="w-full py-3.5 rounded-xl text-sm font-bold bg-white border border-slate-200 hover:border-slate-300 text-slate-700 shadow-sm transition-all flex items-center justify-center gap-2"
        >
          <LayoutDashboard className="w-4 h-4" /> Return to Dashboard
        </button>
      </div>

    </div>
  );
}
