import React from "react";
import { User, Building2, Users, HeartPulse, Clock } from "lucide-react";

interface QuickContactProps {
  onSelectContact: (id: string) => void;
}

export function QuickContacts({ onSelectContact }: QuickContactProps) {
  const contacts = [
    {
      id: "1",
      role: "My manager",
      name: "Anita Menon",
      icon: Building2,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100",
      status: "available",
      nextAvailable: "Now",
    },
    {
      id: "2",
      role: "Department head",
      name: "Lokesh, CTO",
      icon: User,
      iconColor: "text-indigo-600",
      iconBg: "bg-indigo-100",
      status: "busy",
      nextAvailable: "2:00 PM",
    },
    {
      id: "3",
      role: "My team lead",
      name: "Arjun Thomas",
      icon: Users,
      iconColor: "text-teal-600",
      iconBg: "bg-teal-100",
      status: "available",
      nextAvailable: "Now",
    },
    {
      id: "4",
      role: "HR",
      name: "Tejesh Kumar",
      icon: HeartPulse,
      iconColor: "text-rose-600",
      iconBg: "bg-rose-100",
      status: "away",
      nextAvailable: "Tomorrow",
    },
  ];

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
            
            <h3 className="text-sm font-bold text-slate-900">{contact.role}</h3>
            <p className="text-xs font-medium text-slate-500 mt-1">{contact.name}</p>

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
