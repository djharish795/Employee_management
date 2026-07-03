"use client";

import React, { useEffect, useState } from "react";
import { BookingState } from "../booking-wizard";
import { ChevronLeft, Calendar as CalendarIcon, Clock, ArrowRight } from "lucide-react";
import { connectApi } from "@/lib/api/connect";

interface SelectTimeStepProps {
  data: BookingState;
  updateData: (data: Partial<BookingState>) => void;
  onNext: () => void;
  onCancel: () => void;
}

export function SelectTimeStep({ data, updateData, onNext, onCancel }: SelectTimeStepProps) {
  const employeeName = data.employeeId === "2" ? "Lokesh" : "Anita Menon";
  const employeeRole = data.employeeId === "2" ? "Chief Technology Officer" : "Senior Engineering Manager";

  const meetingTypes = [
    "Quick Sync", "One-on-One", "Technical Discussion", 
    "Architecture Review", "Code Review", "Sprint Planning", "Custom"
  ];
  
  const days = Array.from({ length: 10 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  const isSameDay = (d1: Date, d2: Date | null) => {
    return d1.getFullYear() === d2?.getFullYear() && d1.getMonth() === d2?.getMonth() && d1.getDate() === d2?.getDate();
  };

  const [availableSlots, setAvailableSlots] = useState<{ time: string; available: boolean }[]>([]);
  const [loading, setLoading] = useState(false);
  const [employeeTimezone, setEmployeeTimezone] = useState("Asia/Kolkata");

  useEffect(() => {
    async function loadAvailability() {
      if (!data.selectedDate) return;
      try {
        setLoading(true);
        const dateStr = data.selectedDate.toISOString();
        const res = await connectApi.getAvailability(data.employeeId, dateStr);
        const { busySlots, settings } = res.data;

        // Extract settings
        const bufferMinutes = settings?.bufferMinutes || 15;
        const minNoticeHours = settings?.minNoticeHours || 2;
        const targetTimezone = settings?.timezone || "Asia/Kolkata";
        const bufferMs = bufferMinutes * 60000;
        const minNoticeMs = minNoticeHours * 60 * 60000;
        const now = new Date().getTime();
        
        setEmployeeTimezone(targetTimezone);

        // Generate 30-min slots from 10:00 AM to 6:00 PM
        const slots: { time: string; available: boolean }[] = [];
        const startHour = 10;
        const endHour = 18; // 6 PM
        
        for (let hour = startHour; hour < endHour; hour++) {
          for (let min of [0, 30]) {
            const dateObj = new Date(data.selectedDate!);
            dateObj.setHours(hour, min, 0, 0);
            
            const timeString = dateObj.toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit',
              timeZone: targetTimezone
            });
            
            // Check if this slot overlaps with any busy slots
            // A slot is 30 mins
            const slotStart = dateObj.getTime();
            const slotEnd = slotStart + 30 * 60000;

            // 1. Check Minimum Notice Period
            const violatesMinNotice = slotStart < (now + minNoticeMs);

            // 2. Check Overlap & Buffer
            const isBusy = busySlots.some((busy: any) => {
              const bStart = new Date(busy.startTime).getTime() - bufferMs;
              const bEnd = new Date(busy.endTime).getTime() + bufferMs;
              // Overlap logic with buffers applied
              return slotStart < bEnd && slotEnd > bStart;
            });

            slots.push({ time: timeString, available: !isBusy && !violatesMinNotice });
          }
        }
        
        setAvailableSlots(slots);
      } catch (err) {
        console.error("Failed to load availability", err);
      } finally {
        setLoading(false);
      }
    }
    loadAvailability();
  }, [data.selectedDate, data.employeeId]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-[1200px] mx-auto pb-10 mt-4">
      
      <div className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-6">
        <button onClick={onCancel} className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors w-fit pl-2">
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="bg-white border border-slate-100 rounded-[20px] p-6 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-slate-900 text-white flex items-center justify-center text-xl font-bold mb-4">
            {employeeName.charAt(0)}
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">{employeeName}</h2>
          <p className="text-[13px] font-medium text-slate-500">{employeeRole}</p>
          <div className="flex items-center gap-2 mt-4 text-[13px] font-medium text-slate-600">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            Available • {employeeTimezone}
          </div>
        </div>

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

      <div className="flex-1 lg:pl-4">
        <div className="flex items-center justify-between mb-8 mt-2 lg:mt-0">
          <h3 className="text-xl font-bold text-slate-900">Select Date & Time</h3>
        </div>

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

        <div>
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2">
            Available Times <span className="text-slate-300">•</span> {data.selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase()}
          </h4>
          
          {loading ? (
            <div className="text-sm font-medium text-slate-500">Loading available times...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableSlots.map(({ time, available }) => {
                const isSelected = data.selectedTime === time;
                return (
                  <button
                    key={time}
                    disabled={!available}
                    onClick={() => updateData({ selectedTime: time })}
                    className={`py-3.5 px-4 rounded-[14px] text-sm font-semibold text-center transition-all border ${
                      isSelected 
                        ? "bg-slate-900 text-white border-slate-900"
                        : !available
                        ? "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed line-through"
                        : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          )}
        </div>

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
