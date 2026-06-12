import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { QuickLinkType } from '../../types/executive-dashboard';
import { UserPlus, Network, ShieldCheck, Download } from 'lucide-react';

const icons = {
  userPlus: UserPlus,
  orgChart: Network,
  audit: ShieldCheck,
  export: Download,
};

export function QuickLinks({ links }: { links: QuickLinkType[] }) {
  return (
    <Card className="border-slate-200 shadow-sm h-full">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-slate-800">Quick links</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {links.map((link) => {
            const Icon = icons[link.iconType];
            return (
              <a 
                key={link.id} 
                href={link.href}
                className="flex flex-col items-center justify-center p-4 border border-slate-100 rounded-xl hover:bg-slate-50 hover:border-slate-200 transition-colors group cursor-pointer"
              >
                <div className="p-3 bg-white rounded-lg shadow-sm border border-slate-100 mb-3 group-hover:shadow-md transition-shadow">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm font-semibold text-slate-700 text-center">{link.title}</span>
              </a>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
