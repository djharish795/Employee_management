import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { QuickLinkType } from '../../types/executive-dashboard';
import { UserPlus, Network, ShieldCheck, Download, Users, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

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
                onClick={(e) => {
                  if (link.isLocked) {
                    e.preventDefault();
                    toast.error("This module will be unlocked in Phase 2.");
                  }
                }}
                className={`flex flex-col items-center justify-center p-4 border rounded-xl transition-all duration-300 group ${
                  link.isLocked 
                    ? 'border-slate-100 bg-slate-50 opacity-75 cursor-not-allowed' 
                    : 'border-slate-100 bg-white hover:bg-slate-50 hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-1 cursor-pointer'
                }`}
              >
                <div className={`p-3 rounded-xl border mb-3 transition-colors relative ${
                  link.isLocked ? 'bg-slate-100 border-slate-200' : 'bg-blue-50 border-blue-100/50 group-hover:bg-blue-100'
                }`}>
                  <Icon className={`w-5 h-5 ${link.isLocked ? 'text-slate-400' : 'text-blue-600'}`} />
                  {link.isLocked && (
                    <div className="absolute -top-1.5 -right-1.5 bg-slate-200 rounded-full p-0.5">
                      <Lock className="w-3 h-3 text-slate-500" />
                    </div>
                  )}
                </div>
                <span className={`text-sm font-semibold text-center ${link.isLocked ? 'text-slate-400' : 'text-slate-700'}`}>
                  {link.title}
                </span>
              </a>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
