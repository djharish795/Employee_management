"use client";

import React, { useState, useEffect } from 'react';
import { Search, MoreVertical, Bell, Settings, Plus, Users, FolderKanban, ShieldCheck, UserPlus, Briefcase, ChevronRight, X, Loader2, Calendar, Clock, Lock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
<<<<<<< HEAD
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/store/auth';
import { apiClient } from '@/lib/api/client';

// Types
interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  members: ProjectMember[];
}

interface ProjectMember {
  id: string; // Assignment ID
  employeeId: string;
  projectRole: string;
  releasedAt: string | null;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    officialEmail: string;
    photoUrl: string;
    designation: { title: string };
    department: { name: string };
  };
}

interface BenchEmployee {
  id: string;
  name: string;
  subTeam: string;
  designation: string;
  initials: string;
}
=======
import Image from "next/image";

// Placeholder data structure for backend team to replace with API call
const mockTeamMembers = [
  { id: '1', name: 'Pooja J.', role: 'Frontend Developer', status: 'ACTIVE', tenure: '1.2 yrs', tasks: '3 Active', skills: ['React.js', 'TypeScript', 'Tailwind'], level: 'Senior Associate', avatar: 'https://i.pravatar.cc/150?img=47' },
  { id: '2', name: 'Karthik R.', role: 'Software Engineer', status: 'ACTIVE', tenure: '2.1 yrs', tasks: '2 Active', skills: ['Node.js', 'Go', 'PostgreSQL'], level: 'Senior Engineer', avatar: 'https://i.pravatar.cc/150?img=11' },
  { id: '3', name: 'Divya N.', role: 'QA Engineer', status: 'PROBATION', tenure: '2 months', tasks: '1 Active', skills: ['Selenium', 'PyTest'], level: 'Associate Engineer', avatar: 'https://i.pravatar.cc/150?img=32' },
  { id: '4', name: 'Sameer K.', role: 'Software Engineer', status: 'ON LEAVE', tenure: '1.5 yrs', tasks: '1 Active', skills: ['Java Spring', 'Docker', 'AWS'], level: 'Lead Engineer', avatar: 'https://i.pravatar.cc/150?img=12' },
];
>>>>>>> origin/developer

export default function MyTeamPage() {
  const isTeamLead = useAuthStore((state) => state.isTeamLead);
  const employeeId = useAuthStore((state) => state.employeeId);
  
  const [activeTab, setActiveTab] = useState<'GLOBAL' | 'PROJECTS'>('PROJECTS');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [searchBench, setSearchBench] = useState('');
  const [draggedEmployee, setDraggedEmployee] = useState<BenchEmployee | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [bench, setBench] = useState<BenchEmployee[]>([]);

  // Resume Viewer State
  const [viewingEmployeeId, setViewingEmployeeId] = useState<string | null>(null);
  const [fullEmployeeProfile, setFullEmployeeProfile] = useState<any>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  const [directReports, setDirectReports] = useState<any[]>([]);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch projects where TL is assigned
        const pRes = await apiClient.get('/projects');
        setProjects(pRes.data);
        if (pRes.data.length > 0) {
          setSelectedProjectId(pRes.data[0].id);
        }

        // Fetch bench
        const bRes = await apiClient.get('/employees/cto-team');
        if (bRes.data && bRes.data.engineers) {
          // Filter out QA as per requirements
          const techBench = bRes.data.engineers.filter((e: any) => e.subTeam !== 'QA');
          setBench(techBench);
        }

        // Fetch direct reports (Global Org)
        if (employeeId) {
          const eRes = await apiClient.get(`/employees/${employeeId}`);
          if (eRes.data && eRes.data.subordinates) {
            setDirectReports(eRes.data.subordinates);
          }
        }
      } catch (err) {
        console.error('Failed to fetch TL data', err);
        toast.error('Failed to load team data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch specific project details
  useEffect(() => {
    if (selectedProjectId) {
      fetchProjectDetails(selectedProjectId);
    }
  }, [selectedProjectId]);

  const fetchProjectDetails = async (id: string) => {
    try {
      const res = await apiClient.get(`/projects/${id}`);
      setProjects(prev => prev.map(p => {
        if (p.id === id) {
          return {
            ...p,
            members: res.data.assignments || []
          };
        }
        return p;
      }));
    } catch (err) {
      console.error('Failed to fetch project details', err);
    }
  };

  const activeProject = projects.find(p => p.id === selectedProjectId);

  // Handlers
  const handleDragStart = (e: React.DragEvent, emp: BenchEmployee) => {
    setDraggedEmployee(emp);
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = async (e: React.DragEvent, role: string) => {
    e.preventDefault();
    if (!draggedEmployee || !selectedProjectId) return;

    setIsAssigning(true);
    const assignToast = toast.loading(`Assigning ${draggedEmployee.name} as ${role}...`);

    try {
      await apiClient.post(`/projects/${selectedProjectId}/assign`, {
        employeeId: draggedEmployee.id,
        projectRole: role
      });
      toast.success(`${draggedEmployee.name} successfully assigned as ${role}!`, { id: assignToast });
      await fetchProjectDetails(selectedProjectId);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to assign member', { id: assignToast });
    } finally {
      setDraggedEmployee(null);
      setIsAssigning(false);
    }
  };

  const handleRemove = async (employeeId: string, name: string) => {
    if (!selectedProjectId) return;
    if (!confirm(`Are you sure you want to remove ${name} from this project?`)) return;

    const removeToast = toast.loading(`Removing ${name}...`);
    try {
      await apiClient.post(`/projects/${selectedProjectId}/release`, { employeeId });
      toast.success(`${name} successfully removed from project`, { id: removeToast });
      await fetchProjectDetails(selectedProjectId);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to remove member', { id: removeToast });
    }
  };

  const handleViewEmployee = async (id: string) => {
    setViewingEmployeeId(id);
    setIsProfileLoading(true);
    try {
      const res = await apiClient.get(`/employees/${id}`);
      setFullEmployeeProfile(res.data);
    } catch (err) {
      console.error('Failed to fetch employee details', err);
      toast.error('Failed to load employee profile');
      setViewingEmployeeId(null);
    } finally {
      setIsProfileLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 h-full">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
<<<<<<< HEAD
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between sticky top-0 z-20 shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Team Management</h1>
            <p className="text-xs text-slate-500 font-medium">Manage your global direct reports and project assignments</p>
          </div>
        </div>
        
        {/* Tab Toggle */}
        <div className="bg-slate-100 p-1 rounded-xl flex items-center shadow-inner border border-slate-200/50">
          <button 
            onClick={() => setActiveTab('GLOBAL')}
            className={`px-5 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'GLOBAL' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Global Org (Direct Reports)
          </button>
          <button 
            onClick={() => setActiveTab('PROJECTS')}
            className={`px-5 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'PROJECTS' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 border border-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <FolderKanban className="w-4 h-4" />
            Project Assignment
          </button>
        </div>
      </header>
=======
    <div className="flex-1 w-full bg-slate-50 min-h-screen flex flex-col font-sans overflow-x-hidden">
      

>>>>>>> origin/developer

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'GLOBAL' ? (
          <div className="flex-1 p-8 overflow-y-auto bg-slate-50">
            <div className="max-w-5xl mx-auto">
              <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Direct Reports</h2>
                  <p className="text-sm font-medium text-slate-500 mt-1">Employees officially reporting to you in the HR system.</p>
                </div>
                <div className="bg-white px-4 py-1.5 rounded-lg border border-slate-200 shadow-sm text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-500" />
                  {directReports.length} Reports
                </div>
              </div>
              
              {directReports.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {directReports.map((report) => (
                    <div 
                      key={report.id} 
                      className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
                      onClick={() => handleViewEmployee(report.id)}
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-lg overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                          {report.photoUrl ? (
                            <img src={report.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            `${report.firstName[0]}${report.lastName?.[0] || ''}`
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                            {report.firstName} {report.lastName}
                          </h3>
                          <p className="text-xs font-medium text-slate-500">{report.designation?.title || 'Employee'}</p>
                          <span className="inline-block mt-1.5 px-2 py-0.5 bg-slate-100 text-slate-600 font-bold text-[10px] rounded border border-slate-200">
                            {report.employeeId}
                          </span>
                        </div>
                      </div>
                      
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" /> View Full Profile
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 border-dashed p-12 text-center flex flex-col items-center justify-center mt-10">
                  <Users className="w-12 h-12 text-slate-300 mb-4" />
                  <h3 className="text-lg font-bold text-slate-800">No Direct Reports</h3>
                  <p className="text-slate-500 mt-2 max-w-sm">You do not have any employees formally reporting to you in the HR system.</p>
                  <Button variant="outline" onClick={() => setActiveTab('PROJECTS')} className="mt-6">Manage Projects Instead</Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            {/* Left Side: Active Project Board */}
            <div className="flex-[2] border-r border-slate-200 bg-white flex flex-col overflow-hidden relative z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
              {/* Project Selector */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Active Project Workspace</span>
                  <div className="flex items-center gap-2">
                    {projects.length > 0 ? (
                      <select 
                        className="bg-transparent text-xl font-bold text-slate-900 border-none focus:ring-0 p-0 cursor-pointer hover:text-indigo-700 transition-colors"
                        value={selectedProjectId || ''}
                        onChange={(e) => setSelectedProjectId(e.target.value)}
                      >
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    ) : (
                      <span className="text-xl font-bold text-slate-900">No Projects Assigned</span>
                    )}
                    {projects.length > 0 && <ChevronRight className="w-5 h-5 text-slate-400" />}
                  </div>
                </div>
                {activeProject && (
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 font-bold text-xs rounded-full border border-emerald-200 shadow-sm">
                      {activeProject.status}
                    </span>
                  </div>
                )}
              </div>

<<<<<<< HEAD
              {/* Assignment Canvas */}
              {activeProject ? (
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30">
                  <div className="mb-8 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-slate-800">Project Hierarchy & Assignments</h2>
                      <p className="text-sm font-medium text-slate-500 mt-1">Drag and drop members from the bench to assign roles.</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-white px-3 py-1.5 border border-slate-200 rounded-lg shadow-sm">
                      <ShieldCheck className="w-4 h-4 text-indigo-500" />
                      As TL, you can assign TR and TS roles
                    </div>
                  </div>

                  {/* Role Slots */}
                  <div className="space-y-6 max-w-3xl mx-auto">
                    
                    {/* TL Slot (You) */}
                    <div className="bg-white rounded-xl border-2 border-indigo-200 shadow-sm p-5 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center border border-indigo-200 shadow-sm">
                            <span className="font-bold text-indigo-700">TL</span>
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900">Project Team Lead</h3>
                            <p className="text-xs font-medium text-slate-500">Oversees project execution</p>
                          </div>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 flex items-center gap-3 shadow-sm">
                          <div className="text-sm font-bold text-slate-800">You (Assigned by CTO)</div>
                        </div>
                      </div>
                    </div>

                    {/* Connect Line */}
                    <div className="w-px h-6 bg-slate-300 mx-auto"></div>

                    {/* TR / TS Drop Zones Container */}
                    <div className="grid grid-cols-2 gap-6">
                      {/* TR Drop Zone */}
                      <div 
                        className={`bg-white rounded-xl border-2 border-dashed p-6 transition-all ${draggedEmployee ? 'border-indigo-400 bg-indigo-50/50 shadow-[0_0_15px_rgba(99,102,241,0.15)]' : 'border-slate-200 hover:border-slate-300'}`}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, 'TR')}
                      >
                        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
                          <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center border border-sky-200 text-sky-700 font-bold">TR</div>
                          <div>
                            <h3 className="font-bold text-slate-900 text-sm">Tech Resources</h3>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Drop here to assign</p>
                          </div>
                        </div>

                        <div className="space-y-3 min-h-[150px]">
                          {activeProject?.members?.filter(m => m.projectRole === 'TR' && !m.releasedAt).map(member => (
                            <div key={member.id} className="bg-white border border-slate-200 shadow-sm rounded-lg p-3 flex items-center gap-3 group hover:border-sky-300 hover:shadow-md transition-all">
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs shrink-0">
                                {member.employee.firstName[0]}{member.employee.lastName?.[0]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-slate-800 text-sm truncate">{member.employee.firstName} {member.employee.lastName}</h4>
                                <p className="text-xs text-slate-500 font-medium truncate">{member.employee.designation?.title}</p>
                              </div>
                              <button 
                                onClick={() => handleRemove(member.employee.id, `${member.employee.firstName} ${member.employee.lastName}`)}
                                className="text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                title="Release Member"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          {(!activeProject?.members || activeProject.members.filter(m => m.projectRole === 'TR' && !m.releasedAt).length === 0) && (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-6">
                              <UserPlus className="w-8 h-8 mb-2 opacity-50" />
                              <span className="text-xs font-bold">No TRs Assigned</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* TS Drop Zone */}
                      <div 
                        className={`bg-white rounded-xl border-2 border-dashed p-6 transition-all ${draggedEmployee ? 'border-indigo-400 bg-indigo-50/50 shadow-[0_0_15px_rgba(99,102,241,0.15)]' : 'border-slate-200 hover:border-slate-300'}`}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, 'TS')}
                      >
                        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
                          <div className="w-10 h-10 bg-fuchsia-100 rounded-lg flex items-center justify-center border border-fuchsia-200 text-fuchsia-700 font-bold">TS</div>
                          <div>
                            <h3 className="font-bold text-slate-900 text-sm">Tech Support</h3>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Drop here to assign</p>
                          </div>
                        </div>

                        <div className="space-y-3 min-h-[150px]">
                          {activeProject?.members?.filter(m => m.projectRole === 'TS' && !m.releasedAt).map(member => (
                            <div key={member.id} className="bg-white border border-slate-200 shadow-sm rounded-lg p-3 flex items-center gap-3 group hover:border-fuchsia-300 hover:shadow-md transition-all">
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs shrink-0">
                                {member.employee.firstName[0]}{member.employee.lastName?.[0]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-slate-800 text-sm truncate">{member.employee.firstName} {member.employee.lastName}</h4>
                                <p className="text-xs text-slate-500 font-medium truncate">{member.employee.designation?.title}</p>
                              </div>
                              <button 
                                onClick={() => handleRemove(member.employee.id, `${member.employee.firstName} ${member.employee.lastName}`)}
                                className="text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                title="Release Member"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          {(!activeProject?.members || activeProject.members.filter(m => m.projectRole === 'TS' && !m.releasedAt).length === 0) && (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-6">
                              <UserPlus className="w-8 h-8 mb-2 opacity-50" />
                              <span className="text-xs font-bold">No TSs Assigned</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-slate-400">
                    <FolderKanban className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-bold text-slate-500">No Project Selected</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side: Available Bench Sidebar */}
            <div className="flex-[1] min-w-[320px] max-w-[400px] bg-slate-50 flex flex-col shrink-0 border-l border-slate-200">
              <div className="p-6 bg-white border-b border-slate-200 shrink-0 shadow-[0_4px_20px_rgba(0,0,0,0.02)] relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-indigo-600" />
                      Available Bench
                    </h2>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">Tech engineers ready for assignment</p>
                  </div>
                  <span className="bg-slate-100 text-slate-600 font-bold text-[10px] px-2 py-1 rounded-md border border-slate-200">
                    {bench.length} Available
                  </span>
                </div>
                
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text"
                    placeholder="Search roles, names..."
                    value={searchBench}
                    onChange={(e) => setSearchBench(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 pl-9 pr-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700 shadow-inner"
=======
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
>>>>>>> origin/developer
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 relative">
                {isAssigning && (
                   <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-20" />
                )}
                {bench
                  .filter(b => 
                    b.name.toLowerCase().includes(searchBench.toLowerCase()) || 
                    b.designation.toLowerCase().includes(searchBench.toLowerCase()) ||
                    b.subTeam.toLowerCase().includes(searchBench.toLowerCase())
                  )
                  // Don't show people already in the active project
                  .filter(b => !activeProject?.members?.some(m => m.employeeId === b.id && !m.releasedAt))
                  .map(emp => (
                  <div 
                    key={emp.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, emp)}
                    onClick={() => handleViewEmployee(emp.id)}
                    className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-grab active:cursor-grabbing group relative overflow-hidden"
                  >
                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end pr-2">
                      <ChevronRight className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 text-sm shadow-sm shrink-0">
                        {emp.initials}
                      </div>
                      <div className="min-w-0 pr-6">
                        <h4 className="font-bold text-slate-900 text-sm truncate">{emp.name}</h4>
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide truncate mt-0.5">{emp.designation}</p>
                        <div className="flex gap-1.5 mt-2 flex-wrap">
                            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold border border-slate-200 shadow-sm">{emp.subTeam}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Employee Talent Dashboard SlideOver (Corporate Theme) */}
      {viewingEmployeeId && (
        <>
          <div 
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity duration-300"
            onClick={() => setViewingEmployeeId(null)}
          />
          <div className="fixed top-0 right-0 h-full w-[850px] max-w-[95vw] bg-white shadow-2xl z-50 flex flex-col transform transition-transform animate-in slide-in-from-right duration-300 border-l border-slate-200">
            {isProfileLoading || !fullEmployeeProfile ? (
              <div className="flex-1 flex flex-col items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
                <p className="text-sm text-slate-500 font-medium">Loading employee profile...</p>
              </div>
            ) : (
              <>
                {/* Header Area */}
                <div className="bg-slate-50 border-b border-slate-200 shrink-0">
                  <div className="flex justify-end p-4 pb-0">
                    <button 
                      onClick={() => setViewingEmployeeId(null)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-md transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="px-8 pb-8 pt-2 flex items-start gap-6">
                    <div className="w-20 h-20 rounded-xl bg-indigo-50 border border-indigo-100 shadow-sm flex items-center justify-center font-bold text-indigo-700 text-2xl overflow-hidden shrink-0">
                      {fullEmployeeProfile.photoUrl ? (
                        <img src={fullEmployeeProfile.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        `${fullEmployeeProfile.firstName[0]}${fullEmployeeProfile.lastName?.[0] || ''}`
                      )}
                    </div>
                    <div className="flex-1 mt-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-2xl font-bold text-slate-900">
                          {fullEmployeeProfile.firstName} {fullEmployeeProfile.lastName}
                        </h2>
                        {fullEmployeeProfile.status === 'ACTIVE' && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 font-bold text-[10px] rounded border border-emerald-200 uppercase tracking-wide">
                            Available
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4 text-slate-400" />
                        {fullEmployeeProfile.designation?.title} <span className="text-slate-300">•</span> {fullEmployeeProfile.department?.name}
                      </p>
                      
                      {/* Executive Summary Stats */}
                      <div className="flex gap-4 mt-6">
                        <div className="bg-white px-4 py-3 rounded-lg border border-slate-200 shadow-sm flex-1">
                          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Company Tenure</p>
                          <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            {(() => {
                              const joinDate = new Date(fullEmployeeProfile.joiningDate);
                              const now = new Date();
                              const months = (now.getFullYear() - joinDate.getFullYear()) * 12 + (now.getMonth() - joinDate.getMonth());
                              const yrs = Math.floor(months / 12);
                              const mos = months % 12;
                              if (yrs > 0) return `${yrs} yr${yrs > 1 ? 's' : ''} ${mos > 0 ? mos + ' mo' : ''}`;
                              return `${mos || 1} month${mos > 1 ? 's' : ''}`;
                            })()}
                          </p>
                        </div>
                        <div className="bg-white px-4 py-3 rounded-lg border border-slate-200 shadow-sm flex-1">
                          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Projects</p>
                          <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                            <FolderKanban className="w-4 h-4 text-slate-400" />
                            {fullEmployeeProfile.projectAssignments?.length || 0} Total
                          </p>
                        </div>
                        <div className="bg-white px-4 py-3 rounded-lg border border-slate-200 shadow-sm flex-1">
                          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Avg Rating</p>
                          <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                            <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
                            {fullEmployeeProfile.reviewsAsSubject?.length > 0 
                              ? (fullEmployeeProfile.reviewsAsSubject.reduce((acc: number, rev: any) => acc + Number(rev.overallRating || 0), 0) / fullEmployeeProfile.reviewsAsSubject.length).toFixed(1)
                              : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto p-8 bg-white">
                  <div className="grid grid-cols-3 gap-8">
                    
                    {/* Left Column (2/3) */}
                    <div className="col-span-2 space-y-10">
                      
                      {/* Project History */}
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                          <FolderKanban className="w-4 h-4 text-slate-400" /> Project History
                        </h3>
                        <div className="space-y-4">
                          {fullEmployeeProfile.projectAssignments?.length > 0 ? (
                            fullEmployeeProfile.projectAssignments.map((pa: any) => (
                              <div key={pa.id} className="bg-white border border-slate-200 rounded-lg p-5 hover:border-slate-300 transition-colors">
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <h4 className="font-bold text-slate-900">{pa.project.name}</h4>
                                    <p className="text-xs font-medium text-slate-500 mt-1">
                                      Role: <span className="text-slate-700 font-bold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 ml-1">{pa.projectRole}</span>
                                    </p>
                                  </div>
                                  <div className="flex flex-col items-end gap-2">
                                    <span className={`px-2 py-1 text-[10px] font-bold rounded border uppercase tracking-wide ${
                                      pa.releasedAt ? 'bg-slate-50 text-slate-500 border-slate-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    }`}>
                                      {pa.releasedAt ? 'Completed' : 'Active'}
                                    </span>
                                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-1">
                                      <Clock className="w-3.5 h-3.5" />
                                      {(() => {
                                        const d1 = new Date(pa.assignedAt || pa.project.startDate);
                                        const d2 = pa.releasedAt ? new Date(pa.releasedAt) : new Date();
                                        const months = (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
                                        if (months < 1) return '< 1 Month';
                                        return `${months} Months`;
                                      })()}
                                    </span>
                                  </div>
                                </div>
                                {pa.project.description ? (
                                  <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-md border border-slate-100 mt-2">
                                    {pa.project.description}
                                  </p>
                                ) : (
                                  <p className="text-sm text-slate-400 italic mt-2">No description provided.</p>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="border border-slate-200 border-dashed rounded-lg p-8 text-center text-slate-500 bg-slate-50/50">
                              <p className="font-medium text-sm">No project history available.</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Remarks */}
                      <div>
                        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
                          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                            <Users className="w-4 h-4 text-slate-400" /> Confidential Remarks
                          </h3>
                          <span className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold rounded border border-amber-200 uppercase tracking-wide">
                            <Lock className="w-3 h-3" /> Management Only
                          </span>
                        </div>
                        
                        <div className="space-y-4">
                          {fullEmployeeProfile.reviewsAsSubject?.length > 0 ? (
                            fullEmployeeProfile.reviewsAsSubject.map((review: any) => (
                              <div key={review.id} className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm relative overflow-hidden">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400"></div>
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold border border-slate-200">
                                      {review.reviewer.firstName[0]}
                                    </div>
                                    <div>
                                      <p className="text-sm font-bold text-slate-900">
                                        {review.reviewer.firstName} {review.reviewer.lastName}
                                      </p>
                                      <p className="text-[11px] font-medium text-slate-500">{review.reviewer.designation?.title}</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-xs font-bold text-slate-700">
                                      <Star className="w-3.5 h-3.5 fill-orange-400 text-orange-400" /> {review.overallRating || 'N/A'}
                                    </span>
                                    <p className="text-[10px] font-medium text-slate-400 mt-1">
                                      {new Date(review.submittedAt || review.createdAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                <p className="text-sm text-slate-700 italic bg-slate-50 p-3 rounded-md border border-slate-100">
                                  "{review.feedback || 'No written feedback provided.'}"
                                </p>
                              </div>
                            ))
                          ) : (
                            <div className="border border-slate-200 border-dashed rounded-lg p-8 text-center text-slate-500 bg-slate-50/50">
                              <p className="font-medium text-sm">No performance remarks on record.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Column (1/3) */}
                    <div className="col-span-1">
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 sticky top-0">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-5 flex items-center gap-2 border-b border-slate-200 pb-2">
                          <ShieldCheck className="w-4 h-4 text-slate-400" /> Skills Matrix
                        </h3>
                        
                        <div className="space-y-4">
                          {fullEmployeeProfile.employeeSkills?.length > 0 ? (
                            fullEmployeeProfile.employeeSkills.map((es: any) => (
                              <div key={es.id} className="bg-white p-3 rounded-md border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-bold text-xs text-slate-800">{es.skill.name}</span>
                                  {es.isVerified && (
                                    <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 uppercase tracking-wide">
                                      <ShieldCheck className="w-3 h-3" /> Verified
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                                    <div className={`h-full rounded-full ${
                                      es.proficiencyLevel === 'EXPERT' ? 'w-full bg-indigo-600' :
                                      es.proficiencyLevel === 'ADVANCED' ? 'w-3/4 bg-indigo-500' :
                                      es.proficiencyLevel === 'INTERMEDIATE' ? 'w-1/2 bg-indigo-400' :
                                      'w-1/4 bg-slate-400'
                                    }`}></div>
                                  </div>
                                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider w-16 text-right">
                                    {es.proficiencyLevel || 'BEGINNER'}
                                  </span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="py-8 text-center text-slate-500">
                              <p className="text-sm font-medium">No verified skills.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Footer */}
                <div className="p-5 bg-slate-50 border-t border-slate-200 shrink-0 flex justify-between items-center">
                   <p className="text-xs text-slate-500 font-medium">
                     Review this profile before allocation.
                   </p>
                   <div className="flex gap-3">
                     <Button variant="outline" onClick={() => setViewingEmployeeId(null)} className="text-sm font-medium px-4">
                       Cancel
                     </Button>
                     <Button 
                       onClick={() => {
                         setViewingEmployeeId(null);
                         toast.success(`You can now drag ${fullEmployeeProfile.firstName} into your project slots!`, { icon: '🎯' });
                       }} 
                       className="text-sm font-medium px-6 bg-indigo-600 hover:bg-indigo-700 text-white"
                     >
                       Close & Allocate
                     </Button>
                   </div>
                </div>
              </>
            )}
          </div>
        </>
      )}

    </div>
  );
}
<<<<<<< HEAD
=======

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
>>>>>>> origin/developer
