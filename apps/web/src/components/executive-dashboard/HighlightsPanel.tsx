import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Highlight } from '../../types/executive-dashboard';
import { CheckCircle2, Info, AlertTriangle } from 'lucide-react';

const icons = {
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
};

const colors = {
  success: 'text-green-600',
  info: 'text-slate-900',
  warning: 'text-amber-600',
};

export function HighlightsPanel({ highlights }: { highlights: Highlight[] }) {
  return (
    <Card className="border-slate-200/70 shadow-sm shadow-slate-200/50 h-full relative overflow-hidden bg-white/80 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-slate-800">This month highlights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {highlights.map((highlight) => {
            const Icon = icons[highlight.type];
            const colorClass = colors[highlight.type];
            return (
              <div key={highlight.id} className="flex space-x-3 p-3 -mx-3 rounded-xl hover:bg-slate-50 transition-colors cursor-default">
                <div className={`mt-0.5 ${colorClass}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{highlight.title}</p>
                  <p className="text-sm text-slate-500 mt-1 font-medium">{highlight.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
