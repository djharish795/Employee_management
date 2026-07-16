import React, { useState } from 'react';
import { User, Briefcase, FileBadge, Landmark, FileText, Phone, Laptop, ShieldCheck, ChevronDown, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

const SECTIONS = [
  { id: 'personal', title: 'Personal Information', icon: <User className="w-5 h-5 text-blue-600" /> },
  { id: 'employment', title: 'Employment Information', icon: <Briefcase className="w-5 h-5 text-blue-600" /> },
  { id: 'identity', title: 'Identity & Compliance', icon: <FileBadge className="w-5 h-5 text-blue-600" /> },
  { id: 'banking', title: 'Banking & Payroll', icon: <Landmark className="w-5 h-5 text-blue-600" /> },
  { id: 'documents', title: 'Documents', icon: <FileText className="w-5 h-5 text-blue-600" /> },
  { id: 'emergency', title: 'Emergency Contacts', icon: <Phone className="w-5 h-5 text-blue-600" /> },
  { id: 'assets', title: 'Asset Assignment', icon: <Laptop className="w-5 h-5 text-blue-600" /> },
  { id: 'access', title: 'System Access', icon: <ShieldCheck className="w-5 h-5 text-blue-600" /> },
];

export function ReviewSection() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    personal: true,
  });

  const toggleSection = (id: string) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Profile Header Card */}
      <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 h-24 w-full" />
        <CardContent className="px-8 pb-8 pt-0 relative">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-12 mb-6">
            <div className="w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-md flex items-center justify-center text-3xl font-black text-slate-300 overflow-hidden shrink-0">
              JD
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-black text-slate-900">John Doe</h2>
              <p className="text-sm font-semibold text-slate-500">EMP-2024-0892 • Senior Software Engineer</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold uppercase tracking-wider">
                Draft
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Department</p>
              <p className="text-sm font-bold text-slate-800">Engineering</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Manager</p>
              <p className="text-sm font-bold text-slate-800">David Miller</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Location</p>
              <p className="text-sm font-bold text-slate-800">San Francisco HQ</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Joining Date</p>
              <p className="text-sm font-bold text-slate-800">Oct 01, 2024</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accordion Sections */}
      <div className="space-y-3">
        {SECTIONS.map((section) => {
          const isOpen = openSections[section.id];
          return (
            <Card key={section.id} className="border-slate-200 shadow-sm rounded-xl overflow-hidden transition-all">
              <button 
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-5 bg-white hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    {section.icon}
                  </div>
                  <h3 className="text-base font-bold text-slate-800">{section.title}</h3>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Valid
                  </div>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>
              
              {isOpen && (
                <div className="px-5 pb-5 pt-0 border-t border-slate-100 bg-slate-50/50">
                  <div className="py-4 text-sm font-medium text-slate-500 italic text-center">
                    Data for {section.title.toLowerCase()} is verified and ready for submission.
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

    </div>
  );
}
