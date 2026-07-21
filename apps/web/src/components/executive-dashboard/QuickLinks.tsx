import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { QuickLinkType } from '../../types/executive-dashboard';
import { UserPlus, Network, ShieldCheck, Download, Users } from 'lucide-react';

const icons = {
  userPlus: UserPlus,
  orgChart: Network,
  audit: ShieldCheck,
  export: Download,
  users: Users,
};

export function QuickLinks({ links }: { links: QuickLinkType[] }) {
  return (
    <Card className="border-slate-200/70 shadow-sm shadow-slate-200/50 h-full relative overflow-hidden bg-white/80 backdrop-blur-md">
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
                className="flex flex-col items-center justify-center p-4 border border-slate-100 rounded-xl bg-white hover:bg-slate-50 hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
              >
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100/50 mb-3 group-hover:bg-blue-100 transition-colors">
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
