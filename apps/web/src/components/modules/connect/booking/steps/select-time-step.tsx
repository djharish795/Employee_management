"use client";

import React from "react";
import { BookingState } from "../booking-wizard";
import { ChevronLeft, Calendar as CalendarIcon, Clock, ArrowRight } from "lucide-react";

interface SelectTimeStepProps {
  data: BookingState;
  updateData: (data: Partial<BookingState>) => void;
  onNext: () => void;
  onCancel: () => void;
}

export function SelectTimeStep({ data, updateData, onNext, onCancel }: SelectTimeStepProps) {
  // Mock Employee Data based on ID
  const employeeName = data.employeeId === "2" ? "Lokesh" : "Anita Menon";
  const employeeRole = data.employeeId === "2" ? "Chief Technology Officer" : "Senior Engineering Manager";

  const meetingTypes = [
    "Quick Sync", "One-on-One", "Technical Discussion", 
    "Architecture Review", "Code Review", "Sprint Planning", "Custom"
  ];
  
  // Generate next 10 days for horizontal list
  const days = Array.from({ length: 10 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  const timeSlots = ["9:00 AM", "9:30 AM", "10:00 AM", "11:00 AM", "11:30 AM", "2:00 PM", "3:00 PM", "3:30 PM", "4:00 PM"];

  const isSameDay = (d1: Date, d2: Date | null) => {
    return d1.getFullYear() === d2?.getFullYear() && d1.getMonth() === d2?.getMonth() && d1.getDate() === d2?.getDate();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-[1200px] mx-auto pb-10 mt-4">
      
      {/* Left Side - Navigation, Profile & Meeting Types */}
      <div className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-6">
        <button onClick={onCancel} className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors w-fit pl-2">
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        {/* Profile Card */}
        <div className="bg-white border border-slate-100 rounded-[20px] p-6 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-slate-900 text-white flex items-center justify-center text-xl font-bold mb-4">
            {employeeName.charAt(0)}
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">{employeeName}</h2>
          <p className="text-[13px] font-medium text-slate-500">{employeeRole}</p>
          <div className="flex items-center gap-2 mt-4 text-[13px] font-medium text-slate-600">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            Available • IST (UTC+5:30)
          </div>
        </div>

        {/* Quick Meeting Types */}
        <div className="bg-white border border-slate-100 rounded-[20px] p-6 shadow-sm">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">Quick Meeting Types</h3>
          <div className="flex flex-col gap-2">
            {meetingTypes.map((type) => (
              <button
                key={type}
                onClick={() => updateData({ meetingType: type })}
                className={`text-left px-5 py-3 rounded-xl text-sm font-semibold transition-all ${
                  data.meetingType === type 
                  ? "bg-slate-900 text-white shadow-sm" 
                  : "bg-slate-50/80 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Section - Date & Time Selection */}
      <div className="flex-1 lg:pl-4">
        <div className="flex items-center justify-between mb-8 mt-2 lg:mt-0">
          <h3 className="text-xl font-bold text-slate-900">Select Date & Time</h3>
        </div>

        {/* Horizontal Day Picker */}
        <div className="flex overflow-x-auto gap-3 pb-4 mb-8 scrollbar-hide">
          {days.map((day, idx) => {
            const isSelected = isSameDay(day, data.selectedDate);
            return (
              <button
                key={idx}
                onClick={() => updateData({ selectedDate: day, selectedTime: null })}
                className={`flex flex-col items-center justify-center min-w-[76px] h-[84px] rounded-2xl border transition-all flex-shrink-0 ${
                  isSelected 
                  ? "bg-blue-50 border-blue-200" 
                  : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <span className={`text-[11px] font-bold uppercase mb-1 ${isSelected ? "text-blue-600" : "text-slate-500"}`}>
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <span className={`text-xl font-black ${isSelected ? "text-blue-700" : "text-slate-800"}`}>
                  {day.getDate()}
                </span>
              </button>
            );
          })}
        </div>

        {/* Time Slots Grid */}
        <div>
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2">
            Available Times <span className="text-slate-300">•</span> {data.selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase()}
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {timeSlots.map((time) => {
              const isSelected = data.selectedTime === time;
              return (
                <button
                  key={time}
                  onClick={() => updateData({ selectedTime: time })}
                  className={`py-3.5 px-4 rounded-[14px] text-sm font-semibold text-center transition-all border ${
                    isSelected 
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Bar (Sticky at bottom if needed, or just inline) */}
        <div className="mt-12 flex justify-end">
          <button 
            onClick={onNext}
            disabled={!data.selectedTime}
            className={`px-8 py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              data.selectedTime 
              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            Continue to Details <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
