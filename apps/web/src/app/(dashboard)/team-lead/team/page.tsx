"use client";

import React, { useState, useEffect } from 'react';
import { Search, MoreVertical, Bell, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from "next/image";

// Placeholder data structure for backend team to replace with API call
const mockTeamMembers = [
  { id: '1', name: 'Pooja J.', role: 'Frontend Developer', status: 'ACTIVE', tenure: '1.2 yrs', tasks: '3 Active', skills: ['React.js', 'TypeScript', 'Tailwind'], level: 'Senior Associate', avatar: 'https://i.pravatar.cc/150?img=47' },
  { id: '2', name: 'Karthik R.', role: 'Software Engineer', status: 'ACTIVE', tenure: '2.1 yrs', tasks: '2 Active', skills: ['Node.js', 'Go', 'PostgreSQL'], level: 'Senior Engineer', avatar: 'https://i.pravatar.cc/150?img=11' },
  { id: '3', name: 'Divya N.', role: 'QA Engineer', status: 'PROBATION', tenure: '2 months', tasks: '1 Active', skills: ['Selenium', 'PyTest'], level: 'Associate Engineer', avatar: 'https://i.pravatar.cc/150?img=32' },
  { id: '4', name: 'Sameer K.', role: 'Software Engineer', status: 'ON LEAVE', tenure: '1.5 yrs', tasks: '1 Active', skills: ['Java Spring', 'Docker', 'AWS'], level: 'Lead Engineer', avatar: 'https://i.pravatar.cc/150?img=12' },
];

export default function MyTeamPage() {
  const [teamMembers, setTeamMembers] = useState(mockTeamMembers);
  const [isLoading, setIsLoading] = useState(false); // For backend to use later
  return (
    <div className="flex-1 w-full bg-slate-50 min-h-screen flex flex-col font-sans overflow-x-hidden">
      


      {/* Main Content Area */}
      <main className="p-8 max-w-7xl mx-auto w-full space-y-8">
        
        {/* Controls Row */}
        <div className="flex items-center justify-between">
          <div className="bg-slate-200/60 text-slate-700 font-semibold text-xs px-3 py-1.5 rounded-full shadow-sm">
            4 direct reports
          </div>
          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search your team..." 
              className="w-full bg-white border border-slate-300 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-all"
            />
          </div>
        </div>

        {/* Team Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member) => (
            <TeamMemberCard 
              key={member.id}
              avatar={member.avatar}
              name={member.name}
              role={member.role}
              status={member.status}
              tenure={member.tenure}
              tasks={member.tasks}
            />
          ))}
        </div>

        {/* Team Skill Snapshot Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mt-10">
          <div className="p-6 pb-4 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Team skill snapshot</h2>
            <p className="text-sm text-slate-500 mt-1.5 font-medium">Detailed competency and experience mapping for direct reports.</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 w-1/4">MEMBER</th>
                  <th className="px-6 py-4 w-5/12">PRIMARY SKILLS</th>
                  <th className="px-6 py-4 w-1/4">EXPERIENCE LEVEL</th>
                  <th className="px-6 py-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teamMembers.map((member) => (
                  <TableRow 
                    key={member.id}
                    avatar={member.avatar}
                    name={member.name}
                    skills={member.skills}
                    level={member.level}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}

// Components

function TeamMemberCard({ avatar, name, role, status, tenure, tasks }: any) {
  
  const isProbation = status === 'PROBATION';
  const isLeave = status === 'ON LEAVE';
  
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center shadow-sm hover:shadow-md transition-shadow">
      <div className="w-20 h-20 rounded-full overflow-hidden border border-slate-200 shadow-sm mb-4 bg-slate-100 flex items-center justify-center">
        <Image src={avatar} alt={name} className="w-full h-full object-cover" fill style={{ objectFit: "cover" }} />
      </div>
      
      <h3 className="font-bold text-lg text-slate-900 tracking-tight">{name}</h3>
      <p className="text-xs text-slate-500 font-medium mt-0.5">{role}</p>
      
      <div className={`mt-3 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-sm
        ${isProbation ? 'text-amber-700 bg-amber-50 border border-amber-200' : 
          isLeave ? 'text-rose-600 bg-rose-50 border border-rose-200' : 
          'text-emerald-700 bg-emerald-50 border border-emerald-200'}
      `}>
        {!isProbation && !isLeave && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
        {status}
      </div>
      
      <div className="w-full h-px bg-slate-100 mt-6 mb-4"></div>
      
      <div className="w-full flex items-center justify-between px-2">
        <div className="text-left flex flex-col gap-0.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tenure</span>
          <span className="text-sm font-bold text-slate-800">{tenure}</span>
        </div>
        <div className="text-right flex flex-col gap-0.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tasks</span>
          <span className="text-sm font-bold text-slate-800">{tasks}</span>
        </div>
      </div>
    </div>
  );
}

function TableRow({ avatar, name, skills, level }: any) {
  return (
    <tr className="hover:bg-slate-50/50 transition-colors group">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
            <Image src={avatar} alt={name} className="w-full h-full object-cover" fill style={{ objectFit: "cover" }} />
          </div>
          <span className="font-bold text-slate-900 text-sm">{name}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2 flex-wrap">
          {skills.map((skill: string) => (
            <span key={skill} className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-600 rounded-md text-xs font-bold shadow-sm">
              {skill}
            </span>
          ))}
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm font-semibold text-slate-600">{level}</span>
      </td>
      <td className="px-6 py-4 text-right">
        <button className="text-slate-400 hover:text-slate-900 p-1.5 rounded-md hover:bg-slate-100 transition-colors opacity-0 group-hover:opacity-100">
          <MoreVertical className="w-5 h-5" />
        </button>
      </td>
    </tr>
  );
}
