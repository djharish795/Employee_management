import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Users, Calendar, Umbrella, UserPlus, UserMinus, UserCheck, Activity, LogOut, Briefcase } from 'lucide-react';
import { KpiMetric } from '../../types/executive-dashboard';

const icons: Record<string, any> = {
  users: Users,
  calendar: Calendar,
  umbrella: Umbrella,
  userPlus: UserPlus,
  userMinus: UserMinus,
  userCheck: UserCheck,
  logOut: LogOut,
  briefcase: Briefcase,
};

export function KpiGrid({ metrics }: { metrics: KpiMetric[] }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.max(3, Math.min(4, metrics.length))} gap-4`}>
      {metrics.map((metric) => {
        const Icon = icons[metric.iconType] || Activity;
        return (
          <Card key={metric.id} className="relative overflow-hidden border-slate-200/70 shadow-sm hover:shadow-xl shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 bg-white/80 backdrop-blur-md">
            {/* Decorative background shape */}
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-50/20 rounded-full blur-2xl pointer-events-none" />
            
            <CardContent className="p-5 relative z-10">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    {metric.title}
                  </p>
                  <h3 className="text-2xl leading-tight font-bold text-slate-900 tracking-tight">{metric.value}</h3>
                  <p className="text-[11px] mt-1 text-slate-500 font-medium">{metric.subtext}</p>
                </div>
                <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100/50">
                  <Icon className="w-4 h-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
