"use client";

import React, { useState, useEffect } from "react";
import { Calendar as BigCalendar, dateFnsLocalizer, View, Views } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar.css"; // Custom overrides for styling
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { connectApi } from "@/lib/api/connect";
import { MeetingDetailsModal } from "@/components/modules/connect/calendar/MeetingDetailsModal";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/store/auth";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function FullCalendarPage() {
  const router = useRouter();
  const role = useAuthStore((state) => state.role);
  const [events, setEvents] = useState<any[]>([]);
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());
  
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  const loadMeetings = async () => {
    try {
      const res = await connectApi.getMyMeetings();
      const mappedEvents = res.data.map((m: any) => ({
        id: m.id,
        title: m.title,
        start: new Date(m.startTime),
        end: new Date(m.endTime),
        resource: m,
      }));
      setEvents(mappedEvents);
    } catch (error) {
      console.error("Failed to load meetings", error);
    }
  };

  useEffect(() => {
    loadMeetings();
  }, []);

  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event.resource);
  };

  const handleSelectSlot = (slotInfo: any) => {
    const r = role?.toLowerCase();
    const allowedSchedulerRoles = ['oe', 'om', 'cem', 'crm'];
    if (r && allowedSchedulerRoles.includes(r)) {
      router.push(`/${r}/scheduler?date=${slotInfo.start.toISOString()}`);
    } else {
      router.push(`/connect?date=${slotInfo.start.toISOString()}`);
    }
  };

  const eventStyleGetter = (event: any) => {
    const status = event.resource.status;
    let backgroundColor = "#3b82f6"; // blue (ACCEPTED)
    if (status === "PENDING") backgroundColor = "#f59e0b"; // amber
    if (status === "REJECTED" || status === "CANCELLED") backgroundColor = "#ef4444"; // red

    return {
      style: {
        backgroundColor,
        borderRadius: "6px",
        opacity: 0.9,
        color: "white",
        border: "0px",
        display: "block",
        fontWeight: "bold",
        fontSize: "12px",
      },
    };
  };

  return (
    <div className="max-w-6xl mx-auto pb-10 px-4 h-[calc(100vh-100px)] flex flex-col">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/connect/meetings" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ChevronLeft className="w-5 h-5 text-slate-500" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Full Calendar</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage all your scheduled events</p>
        </div>
      </div>

      <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm p-6 overflow-hidden">
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          selectable
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          eventPropGetter={eventStyleGetter}
          views={["month", "week", "day"]}
        />
      </div>

      {selectedEvent && (
        <MeetingDetailsModal 
          isOpen={!!selectedEvent} 
          onClose={() => setSelectedEvent(null)} 
          meeting={selectedEvent} 
        />
      )}
    </div>
  );
}
