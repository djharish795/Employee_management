import React, { useEffect, useState } from "react";
import { User, Building2, Users, HeartPulse, Clock } from "lucide-react";
import { connectApi } from "@/lib/api/connect";
import { apiClient } from "@/lib/api/client";

interface QuickContactProps {
  onSelectContact: (id: string) => void;
  employees: any[];
}

interface ContactState {
  status: "available" | "busy";
  nextAvailable: string;
}

export function QuickContacts({ onSelectContact }: QuickContactProps) {
  const [statuses, setStatuses] = useState<Record<string, ContactState>>({});
  const [contactsData, setContactsData] = useState<any[]>([]);

  useEffect(() => {
    const loadStatuses = async () => {
      try {
        const contactsRes = await apiClient.get('/connect/quick-contacts');
        const loadedContacts = contactsRes.data || [];
        setContactsData(loadedContacts);

        if (loadedContacts.length === 0) return;

        const newStatuses: Record<string, ContactState> = {};
        const now = new Date();
        
        await Promise.all(loadedContacts.map(async (emp: any) => {
        try {
          const res = await connectApi.getAvailability(emp.id, now.toISOString());
          const busySlots = res.data?.busySlots || [];
          
          let isBusy = false;
          let nextAvailableTime = "Now";

          for (const slot of busySlots) {
            const start = new Date(slot.startTime);
            const end = new Date(slot.endTime);
            if (now >= start && now <= end) {
              isBusy = true;
              nextAvailableTime = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              break;
            }
          }
          newStatuses[emp.id] = { status: isBusy ? "busy" : "available", nextAvailable: nextAvailableTime };
        } catch (err) {
          newStatuses[emp.id] = { status: "available", nextAvailable: "Now" };
        }
      }));
      setStatuses(newStatuses);
    } catch (err) {
      console.error("Failed to load quick contacts", err);
    }
    };
    loadStatuses();
  }, []);

  // If no employees loaded yet, show a skeleton or nothing
  if (contactsData.length === 0) return null;

  // Use the loaded contacts, mapping them to the UI icons
  const icons = [Building2, User, Users, HeartPulse];
  const iconColors = ["text-blue-600", "text-indigo-600", "text-teal-600", "text-rose-600"];
  const iconBgs = ["bg-blue-100", "bg-indigo-100", "bg-teal-100", "bg-rose-100"];

  const contacts = contactsData.map((emp, idx) => {
    const s = statuses[emp.id] || { status: "available", nextAvailable: "..." };
    return {
      id: emp.id,
      role: emp.designation?.title || "Employee",
      name: `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || "Colleague",
      icon: icons[idx % icons.length],
      iconColor: iconColors[idx % iconColors.length],
      iconBg: iconBgs[idx % iconBgs.length],
      status: s.status,
      nextAvailable: s.nextAvailable,
    };
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {contacts.map((contact) => {
        const Icon = contact.icon;
        return (
          <div
            key={contact.id}
            onClick={() => onSelectContact(contact.id)}
            className="group relative bg-white border border-slate-200 rounded-[20px] p-6 text-center cursor-pointer transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 hover:border-slate-300 flex flex-col items-center justify-center min-h-[160px]"
          >
            <div className={`w-12 h-12 rounded-full ${contact.iconBg} ${contact.iconColor} flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300`}>
              <Icon className="w-5 h-5" />
            </div>
            
            <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{contact.role}</h3>
            <p className="text-xs font-medium text-slate-500 mt-1 line-clamp-1">{contact.name}</p>

            {/* Availability Indicator */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="relative flex h-2 w-2">
                {contact.status === 'available' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  contact.status === 'available' ? 'bg-emerald-500' :
                  contact.status === 'busy' ? 'bg-red-500' : 'bg-amber-500'
                }`}></span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden md:block">
                {contact.nextAvailable}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
