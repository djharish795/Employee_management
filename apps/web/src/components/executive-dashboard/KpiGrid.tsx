import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Users, Calendar, Umbrella, UserPlus, UserMinus } from 'lucide-react';
import { KpiMetric } from '../../types/executive-dashboard';

const icons = {
  users: Users,
  calendar: Calendar,
  umbrella: Umbrella,
  userPlus: UserPlus,
  userMinus: UserMinus,
};

export function KpiGrid({ metrics }: { metrics: KpiMetric[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => {
        const Icon = icons[metric.iconType];
        return (
          <Card key={metric.id} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
                    {metric.title}
                  </p>
                  <h3 className="text-3xl font-bold text-slate-900">{metric.value}</h3>
                  <p className="text-sm mt-2 text-slate-500 font-medium">{metric.subtext}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <Icon className="w-5 h-5 text-slate-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
