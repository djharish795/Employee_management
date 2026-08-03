"use client";

import React, { useState, useEffect } from 'react';
import { Search, Bell, HelpCircle, Filter, ChevronLeft, ChevronRight, Activity, TrendingUp, Calendar, Loader2, FolderKanban, Users, ShieldCheck, UserPlus, Briefcase, ChevronRight as ChevronRightIcon, X, Plus } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { fetchCtoTeam } from '@/lib/api/cto';
import { apiClient } from '@/lib/api/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

interface EngineerData {
  id: string;
  name: string;
  initials: string;
  subTeam: string;
  designation: string;
  experience: number;
  status: string;
  projects?: { id: string; name: string; role: string }[];
}

// Project Types
interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  _count: { assignments: number };
  assignments: ProjectMember[];
}

interface ProjectMember {
  id: string;
  employeeId: string;
  projectRole: string;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    designation: { title: string } | null;
  };
}

export default function EngineeringTeamPage() {
  const router = useRouter();
  const role = useAuthStore((state) => state.role);
  
  // Tabs State
  const [activeMainTab, setActiveMainTab] = useState<'GLOBAL' | 'PROJECTS'>('PROJECTS');

  // Global Org Data State
  const [engineers, setEngineers] = useState<EngineerData[]>([]);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Project Assignment State
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  
  const [searchBench, setSearchBench] = useState('');
  const [expandedTop, setExpandedTop] = useState<Record<string, boolean>>({});
  const [expandedDesignations, setExpandedDesignations] = useState<Record<string, boolean>>({});
  const [draggedEmployee, setDraggedEmployee] = useState<EngineerData | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  
  // Project Lifecycle State
  const [isDeletingProject, setIsDeletingProject] = useState(false);
  const [isCompletingProject, setIsCompletingProject] = useState(false);
  const [signatureName, setSignatureName] = useState('');

  // Custom Dropdown State
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProjectDropdownOpen(false);
      }
    }
    if (isProjectDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProjectDropdownOpen]);

  const fetchProjects = async () => {
    try {
      const res = await apiClient.get('/projects?status=ACTIVE');
      setProjects(res.data || []);
      if (res.data?.length > 0 && !selectedProjectId) {
        setSelectedProjectId(res.data[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch projects", err);
    }
  };

  const fetchProjectDetails = async (id: string) => {
    try {
      const res = await apiClient.get(`/projects/${id}`);
      setActiveProject(res.data);
    } catch (err) {
      toast.error('Failed to load project details');
    }
  };

  useEffect(() => {
    if (role === 'CTO') {
      setIsLoading(true);
      fetchCtoTeam()
        .then((data) => {
          setEngineers(data.engineers || []);
          setTotalCount(data.totalCount || 0);
          
          // Default to Engineering or Technology tab if they exist
          const hasEng = data.engineers?.some((e: any) => e.subTeam === 'Engineering ');
          const hasTech = data.engineers?.some((e: any) => e.subTeam === 'Technology');
          if (hasEng) setActiveTab('Engineering ');
          else if (hasTech) setActiveTab('Technology');
        })
        .catch((err) => console.error("Failed to fetch CTO team", err))
        .finally(() => setIsLoading(false));
        
      fetchProjects();
    }
  }, [role]);

  useEffect(() => {
    if (selectedProjectId) {
      fetchProjectDetails(selectedProjectId);
    }
  }, [selectedProjectId]);

  // Pagination Logic
  const tabs = ['All', ...Array.from(new Set(engineers.map(e => e.subTeam)))];
  const filteredEngineers = engineers.filter(e => {
    const matchesTab = activeTab === 'All' || e.subTeam === activeTab;
    const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          e.subTeam.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });
  const totalPages = Math.ceil(filteredEngineers.length / itemsPerPage);
  const paginatedEngineers = filteredEngineers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent, emp: EngineerData) => {
    setDraggedEmployee(emp);
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = async (e: React.DragEvent, dropRole: string) => {
    e.preventDefault();
    if (!draggedEmployee || !activeProject) return;

    const existingAssignment = activeProject.assignments?.find(m => m.employeeId === draggedEmployee.id);
    if (existingAssignment) {
      if (existingAssignment.projectRole === dropRole) {
        setDraggedEmployee(null);
        return; // Already in this exact role
      }
    }

    setIsAssigning(true);
    toast.loading(`Assigning ${draggedEmployee.name} as ${dropRole}...`, { id: 'assign' });

    try {
      await apiClient.post(`/projects/${activeProject.id}/assign`, {
        employeeId: draggedEmployee.id,
        projectRole: dropRole
      });
      toast.success(`${draggedEmployee.name} successfully assigned as ${dropRole}!`, { id: 'assign' });
      await fetchProjectDetails(activeProject.id);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to assign role', { id: 'assign' });
    } finally {
      setIsAssigning(false);
      setDraggedEmployee(null);
    }
  };

  const handleRemoveMember = async (employeeId: string, employeeName: string) => {
    if (!activeProject) return;
    setIsAssigning(true);
    toast.loading(`Removing ${employeeName}...`, { id: 'remove' });
    try {
      await apiClient.post(`/projects/${activeProject.id}/release`, { employeeId });
      toast.success(`${employeeName} removed from project`, { id: 'remove' });
      await fetchProjectDetails(activeProject.id);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to remove member', { id: 'remove' });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    setIsAssigning(true);
    try {
      const res = await apiClient.post('/projects', { name: newProjectName });
      toast.success('Project created!');
      await fetchProjects();
      setSelectedProjectId(res.data.id);
      setIsCreatingProject(false);
      setNewProjectName('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!activeProject) return;
    try {
      await apiClient.post(`/projects/${activeProject.id}/delete`);
      toast.success('Project deleted successfully');
      setProjects(prev => prev.filter(p => p.id !== activeProject.id));
      setSelectedProjectId(projects.find(p => p.id !== activeProject.id)?.id || null);
      setActiveProject(null);
      setIsDeletingProject(false);
    } catch (err) {
      toast.error('Failed to delete project');
    }
  };

  const handleCompleteProject = async () => {
    if (!activeProject) return;
    if (!signatureName.trim()) {
      toast.error('Digital e-signature is required');
      return;
    }
    try {
      await apiClient.patch(`/projects/${activeProject.id}/complete`, { signatureName });
      toast.success('Project officially marked as COMPLETED');
      await fetchProjects();
      setActiveProject(null);
      setSelectedProjectId(null);
      setIsCompletingProject(false);
      setSignatureName('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to complete project');
    }
  };

  if (role !== "CTO") {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-slate-500">
        <h2 className="text-xl font-bold text-slate-800">Access Restricted</h2>
      </div>
    );
  }

  const renderDropZone = (roleCode: string, title: string, colorClass: string, bgClass: string, borderClass: string) => (
    <div 
      className={`bg-white rounded-xl border-2 border-dashed p-6 transition-all ${draggedEmployee ? `${borderClass} ${bgClass} shadow-md` : 'border-slate-200 hover:border-slate-300'}`}
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, roleCode)}
    >
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
        <div className={`w-10 h-10 ${bgClass} rounded-lg flex items-center justify-center border ${borderClass} ${colorClass} font-bold`}>{roleCode}</div>
        <div>
          <h3 className="font-bold text-slate-900 text-sm">{title}</h3>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Drop to assign</p>
        </div>
      </div>
      <div className="space-y-3 min-h-[100px]">
        {activeProject?.assignments?.filter(m => m.projectRole === roleCode).map(member => (
          <div key={member.id} className={`bg-white border border-slate-200 shadow-sm rounded-lg p-3 flex items-center gap-3 group hover:${borderClass} transition-all`}>
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs shrink-0">
              {member.employee.firstName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-slate-800 text-sm truncate">{member.employee.firstName} {member.employee.lastName}</h4>
              {member.employee.designation && (
                <p className="text-[10px] font-medium text-slate-500 truncate">{member.employee.designation.title}</p>
              )}
            </div>
            <button 
              onClick={() => handleRemoveMember(member.employeeId, member.employee.firstName)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md shrink-0"
              title="Remove from project"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex-1 w-full bg-slate-50 min-h-screen flex flex-col font-sans overflow-hidden">
      
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between sticky top-0 z-20 shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-md shadow-slate-300">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Executive Engineering Control</h1>
            <p className="text-xs text-slate-500 font-medium">Manage global org metrics and high-level project resourcing</p>
          </div>
        </div>
        
        {/* Toggle Mode */}
        <div className="bg-slate-100 p-1 rounded-xl flex items-center shadow-inner border border-slate-200/50">
          <button 
            onClick={() => setActiveMainTab('GLOBAL')}
            className={`px-5 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${activeMainTab === 'GLOBAL' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Users className="w-4 h-4" />
            Global Org View
          </button>
          <button 
            onClick={() => setActiveMainTab('PROJECTS')}
            className={`px-5 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${activeMainTab === 'PROJECTS' ? 'bg-slate-900 text-white shadow-md border border-slate-950' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <FolderKanban className="w-4 h-4" />
            Project Hub
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {activeMainTab === 'GLOBAL' ? (
          /* GLOBAL ORG VIEW */
          <div className="flex-1 overflow-y-auto p-8 max-w-[1400px] mx-auto w-full space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="px-3 py-1 bg-slate-200 text-slate-700 rounded-full text-xs font-bold">
                {totalCount} engineers
              </div>
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search by name or sub-team..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-900 transition-colors shadow-sm"
                />
              </div>
            </div>

            {/* Pill Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors whitespace-nowrap shadow-sm ${
                    activeTab === tab 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Engineer</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Sub-Team</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Designation</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Experience</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {isLoading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-20 text-center text-sm font-medium text-slate-400">
                          <div className="flex items-center justify-center">
                            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading engineer data...
                          </div>
                        </td>
                      </tr>
                    ) : paginatedEngineers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-20 text-center text-sm font-medium text-slate-400">
                          No engineers found matching your filters.
                        </td>
                      </tr>
                    ) : (
                      paginatedEngineers.map(engineer => (
                        <tr key={engineer.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                {engineer.initials}
                              </div>
                              <span className="text-sm font-bold text-slate-900">{engineer.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-slate-600">{engineer.subTeam}</td>
                          <td className="px-6 py-4 text-sm font-medium text-slate-600">{engineer.designation}</td>
                          <td className="px-6 py-4 text-sm font-medium text-slate-600">{engineer.experience} yrs</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              {engineer.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => router.push(`/employees/${engineer.id}`)} 
                              className="text-blue-600 hover:text-blue-700 hover:underline font-bold text-sm"
                            >
                              View Profile
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-white">
                  <div className="text-sm font-medium text-slate-500">
                    Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredEngineers.length)} of {filteredEngineers.length}
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button 
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 flex items-center justify-center rounded text-sm font-bold ${
                          currentPage === page 
                            ? 'bg-slate-900 text-white' 
                            : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* PROJECT MANAGEMENT HUB */
          <div className="flex-1 flex overflow-hidden">
            {/* Left Side: Active Project Board */}
            <div className="flex-[2] border-r border-slate-200 bg-white flex flex-col overflow-hidden relative z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
              
              <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
                <div className="flex flex-col gap-1 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">CTO Project Command Center</span>
                  <div className="flex items-center gap-2">
                    {projects.length > 0 ? (
                      <div className="relative" ref={dropdownRef}>
                        <button 
                          onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                          className="flex items-center gap-2 bg-transparent text-xl font-bold text-slate-900 hover:text-slate-700 transition-colors focus:outline-none"
                        >
                          <span className="max-w-[300px] truncate">
                            {projects.find(p => p.id === selectedProjectId)?.name || 'Select Project'}
                          </span>
                          <ChevronRightIcon className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isProjectDropdownOpen ? 'rotate-90' : ''}`} />
                        </button>
                        
                        {isProjectDropdownOpen && (
                          <div className="absolute top-[calc(100%+8px)] left-0 min-w-[280px] bg-white rounded-xl shadow-lg border-2 border-slate-200 py-1.5 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            {projects.map(p => (
                              <button
                                key={p.id}
                                onClick={() => {
                                  setSelectedProjectId(p.id);
                                  setIsProjectDropdownOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2.5 text-sm font-bold transition-all duration-200 flex items-center justify-between group ${
                                  selectedProjectId === p.id 
                                    ? 'bg-indigo-50 text-indigo-700' 
                                    : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-700'
                                }`}
                              >
                                <span className="truncate group-hover:translate-x-1 transition-transform duration-200">{p.name}</span>
                                {selectedProjectId === p.id && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0 shadow-[0_0_8px_rgba(79,70,229,0.5)]"></div>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xl font-bold text-slate-400">No Projects Found</span>
                    )}
                    {!projects.length && <ChevronRightIcon className="w-5 h-5 text-slate-400" />}
                    <Button variant="ghost" size="sm" onClick={() => setIsCreatingProject(true)} className="ml-2 text-slate-500 hover:text-slate-900">
                      <Plus className="w-4 h-4 mr-1" /> New Project
                    </Button>
                  </div>
                </div>
                {activeProject && (
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 font-bold text-xs rounded-full border shadow-sm ${activeProject.status === 'COMPLETED' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'}`}>
                      {activeProject.status}
                    </span>
                    {activeProject.status !== 'COMPLETED' && (
                      <Button variant="outline" size="sm" onClick={() => setIsCompletingProject(true)} className="h-8 font-bold border-purple-300 text-purple-700 hover:bg-purple-50">
                        E-Sign & Complete
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => setIsDeletingProject(true)} className="h-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50">
                      Delete
                    </Button>
                  </div>
                )}
              </div>

              {/* Delete Modal */}
              {isDeletingProject && activeProject && (
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Project?</h3>
                      <p className="text-sm text-slate-500 mb-6">Are you sure you want to completely delete <strong>{activeProject.name}</strong>? This will remove all assignments and cannot be undone.</p>
                      <div className="flex items-center justify-end gap-3">
                        <Button variant="outline" onClick={() => setIsDeletingProject(false)}>Cancel</Button>
                        <Button onClick={handleDeleteProject} className="bg-rose-600 hover:bg-rose-700 text-white">Delete Project</Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Complete Modal */}
              {isCompletingProject && activeProject && (
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border-t-4 border-purple-500">
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-slate-900 mb-2">Sign-off Project Completion</h3>
                      <p className="text-sm text-slate-500 mb-4">You are about to formally mark <strong>{activeProject.name}</strong> as COMPLETED. Please enter your full name as a digital signature to confirm.</p>
                      
                      <div className="space-y-4 mb-6">
                        <div>
                          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 block">Digital Signature</label>
                          <input 
                            type="text"
                            placeholder="Type your full name..."
                            value={signatureName}
                            onChange={e => setSignatureName(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 font-medium"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-3">
                        <Button variant="outline" onClick={() => setIsCompletingProject(false)}>Cancel</Button>
                        <Button onClick={handleCompleteProject} className="bg-purple-600 hover:bg-purple-700 text-white">Sign & Complete</Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isCreatingProject && (
                <div className="p-4 bg-slate-100 border-b border-slate-200 flex gap-3 items-center">
                  <input 
                    type="text" 
                    placeholder="Enter project name..." 
                    value={newProjectName}
                    onChange={e => setNewProjectName(e.target.value)}
                    className="flex-1 bg-white border border-slate-300 rounded-lg py-2 px-4 text-sm focus:outline-none focus:border-slate-900"
                    autoFocus
                  />
                  <Button onClick={handleCreateProject} disabled={isAssigning} className="bg-slate-900 text-white">Create</Button>
                  <Button variant="outline" onClick={() => setIsCreatingProject(false)}>Cancel</Button>
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30">
                <div className="mb-8 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Dynamic Leadership Assignment</h2>
                    <p className="text-sm font-medium text-slate-500 mt-1">Drag and drop any engineering member from the bench to assign high-level project roles.</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-white px-3 py-1.5 border border-slate-200 rounded-lg shadow-sm">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Promote talent based on performance
                  </div>
                </div>

                {activeProject ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {renderDropZone('SDM', 'Software Delivery Mgr', 'text-fuchsia-700', 'bg-fuchsia-100', 'border-fuchsia-200')}
                    {renderDropZone('DM', 'Delivery Manager', 'text-amber-700', 'bg-amber-100', 'border-amber-200')}
                    {renderDropZone('QM', 'Quality Manager', 'text-rose-700', 'bg-rose-100', 'border-rose-200')}
                    
                    {renderDropZone('SPM', 'Senior Project Mgr', 'text-blue-700', 'bg-blue-100', 'border-blue-200')}
                    {renderDropZone('PM', 'Project Manager', 'text-teal-700', 'bg-teal-100', 'border-teal-200')}
                    {renderDropZone('TL', 'Team Lead', 'text-indigo-700', 'bg-indigo-100', 'border-indigo-200')}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px] text-slate-400">
                    <FolderKanban className="w-16 h-16 mb-4 opacity-20" />
                    <p>Select or create a project to assign roles.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side: Available Bench Sidebar (All Engineers) */}
            <div className="flex-[1] min-w-[320px] max-w-[400px] bg-slate-50 flex flex-col shrink-0 border-l border-slate-200">
              <div className="p-6 bg-white border-b border-slate-200 shrink-0 shadow-[0_4px_20px_rgba(0,0,0,0.02)] relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-slate-900" />
                      Engineering Bench
                    </h2>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">All available talent</p>
                  </div>
                  <span className="bg-slate-100 text-slate-600 font-bold text-[10px] px-2 py-1 rounded-md border border-slate-200">
                    {engineers.length} Engineers
                  </span>
                </div>
                
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text"
                    placeholder="Search by name or global role..."
                    value={searchBench}
                    onChange={(e) => setSearchBench(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 pl-9 pr-3 text-sm font-medium focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all text-slate-700 shadow-inner"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 relative">
                {isAssigning && (
                   <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-20" />
                )}
                {(() => {
                  const filteredEngineers = engineers
                    .filter(e => 
                      e.name.toLowerCase().includes(searchBench.toLowerCase()) || 
                      e.designation.toLowerCase().includes(searchBench.toLowerCase())
                    );
                  
                  // Build hierarchical structure: hierarchy[topLevel][subLevel] = EngineerData[]
                  const hierarchy: Record<string, Record<string, typeof engineers>> = {};

                  filteredEngineers.forEach((emp) => {
                    let topLevel = 'Other';
                    let spec = emp.designation || 'Unassigned';
                    const title = spec.toLowerCase();

                    // 1. Determine Top Level Category
                    if (title.includes('chief') || title === 'cto' || title === 'ceo') topLevel = 'Executive';
                    else if (title.includes('delivery manager') || title.includes('sdm') || title.includes('dm')) topLevel = 'DM / SDM';
                    else if (title.includes('project manager') || title.includes('spm') || title.includes('pm')) topLevel = 'Project Managers';
                    else if (title.includes('team lead') || title.includes('tl')) topLevel = 'Team Leads';
                    else if (title.includes('quality') || title.includes('qa') || title.includes('test') || title.includes('qe')) topLevel = 'QA';
                    else if (title.includes('architect')) topLevel = 'Architecture';
                    else if (title.includes('it executive') || title.includes('it manager') || title.includes('technical support') || title.includes('it ')) topLevel = 'IT & Support';
                    else if (
                        title.includes('developer') || 
                        title.includes('engineer') || 
                        title.includes('technical resource') ||
                        title.includes('ai') ||
                        title.includes('data')
                    ) {
                      topLevel = 'TR'; // Technical Resource
                    } else if (title === 'tr') {
                      topLevel = 'TR';
                    } else {
                      topLevel = 'Other Roles'; // Default for other engineering staff
                    }

                    // 2. Determine Sub Level (Specialization)
                    let subGroup = spec;
                    if (topLevel === 'TR') {
                       if (title.includes('back')) subGroup = 'Backend';
                       else if (title.includes('front')) subGroup = 'Frontend';
                       else if (title.includes('full')) subGroup = 'Full Stack';
                       else if (title.includes('ai') || title.includes('artificial')) subGroup = 'AI / ML';
                       else if (title.includes('devops')) subGroup = 'DevOps';
                       else if (title.includes('mobile') || title.includes('ios') || title.includes('android')) subGroup = 'Mobile';
                       else if (title === 'tr' || title.includes('technical resource')) subGroup = 'General / TR';
                    }

                    if (!hierarchy[topLevel]) hierarchy[topLevel] = {};
                    if (!hierarchy[topLevel][subGroup]) hierarchy[topLevel][subGroup] = [];
                    hierarchy[topLevel][subGroup].push(emp);
                  });

                  const sortedTopLevels = Object.keys(hierarchy).sort((a, b) => {
                    // Force TR to top, QA next, TL next
                    const order = { 'TR': 1, 'QA': 2, 'Team Leads': 3, 'Project Managers': 4, 'DM / SDM': 5 };
                    return (order[a as keyof typeof order] || 99) - (order[b as keyof typeof order] || 99);
                  });

                  if (sortedTopLevels.length === 0) {
                    return (
                      <div className="text-center text-slate-400 py-8 text-sm font-medium">
                        No engineers found matching your search.
                      </div>
                    );
                  }

                  return sortedTopLevels.map(topLevel => {
                    const subGroups = hierarchy[topLevel];
                    const sortedSubGroups = Object.keys(subGroups).sort();
                    const topIsExpanded = expandedTop[topLevel] ?? false;
                    const totalInTopLevel = Object.values(subGroups).reduce((sum, arr) => sum + arr.length, 0);

                    return (
                      <div key={topLevel} className="mb-4">
                        {/* Top Level Accordion */}
                        <button 
                          onClick={() => setExpandedTop(prev => ({ ...prev, [topLevel]: !prev[topLevel] }))}
                          className="w-full flex items-center justify-between bg-white border border-slate-200 rounded-lg p-3 shadow-sm hover:border-indigo-300 hover:bg-indigo-50/30 transition-all text-left group"
                        >
                          <div className="flex items-center gap-2">
                            <div className={`transition-transform duration-200 ${topIsExpanded ? 'rotate-90 text-indigo-500' : 'text-slate-400 group-hover:text-indigo-400'}`}>
                              <ChevronRight className="w-4 h-4" />
                            </div>
                            <span className="font-bold text-slate-800 text-sm group-hover:text-indigo-700 transition-colors uppercase tracking-wide">{topLevel}</span>
                          </div>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full transition-colors ${topIsExpanded ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                            {totalInTopLevel}
                          </span>
                        </button>
                        
                        {/* Sub Level Rendering */}
                        {topIsExpanded && (
                          <div className="mt-2 space-y-2 pl-3 border-l-2 border-slate-200 ml-4 py-1">
                            {sortedSubGroups.map(designation => {
                              const emps = subGroups[designation];
                              const subKey = `${topLevel}-${designation}`;
                              const isSubExpanded = expandedDesignations[subKey] ?? false;
                              
                              return (
                                <div key={subKey} className="mb-2">
                                  {/* Sub Level Accordion */}
                                  <button 
                                    onClick={() => setExpandedDesignations(prev => ({ ...prev, [subKey]: !prev[subKey] }))}
                                    className="w-full flex items-center justify-between bg-white border border-slate-200 rounded-lg p-2.5 shadow-sm hover:border-indigo-300 hover:bg-indigo-50/30 transition-all text-left group"
                                  >
                                    <div className="flex items-center gap-2">
                                      <div className={`transition-transform duration-200 ${isSubExpanded ? 'rotate-90 text-indigo-500' : 'text-slate-400 group-hover:text-indigo-400'}`}>
                                        <ChevronRight className="w-3.5 h-3.5" />
                                      </div>
                                      <span className="font-bold text-slate-700 text-xs group-hover:text-indigo-700 transition-colors">{designation}</span>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${isSubExpanded ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                                      {emps.length}
                                    </span>
                                  </button>

                                  {/* Employee Cards */}
                                  {isSubExpanded && (
                                    <div className="mt-2 space-y-2 pl-3 border-l-2 border-indigo-100 ml-3 py-1">
                                      {emps.map(emp => {
                                        const isBench = !emp.projects || emp.projects.length === 0;
                                        return (
                                        <div 
                                          key={emp.id}
                                          draggable
                                          onDragStart={(e) => handleDragStart(e, emp)}
                                          className="bg-white border border-slate-200 rounded-lg p-2.5 shadow-sm hover:shadow-md hover:border-slate-400 transition-all cursor-grab active:cursor-grabbing group relative overflow-hidden"
                                        >
                                          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end pr-2 z-10">
                                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                          </div>
                                          <div className="flex gap-2.5 items-start">
                                            <div className="w-7 h-7 rounded-full bg-slate-900 border border-slate-950 flex items-center justify-center font-bold text-white text-[10px] shadow-sm shrink-0 mt-0.5">
                                              {emp.initials}
                                            </div>
                                            <div className="min-w-0 pr-6 flex-1">
                                              <div className="flex items-center justify-between gap-2 mb-1">
                                                <h4 className="font-bold text-slate-800 text-xs truncate">{emp.name}</h4>
                                                {isBench ? (
                                                  <span className="shrink-0 bg-emerald-100 text-emerald-700 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">Bench</span>
                                                ) : (
                                                  <span className="shrink-0 bg-indigo-100 text-indigo-700 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">{emp.projects!.length} Proj</span>
                                                )}
                                              </div>
                                              {!isBench && (
                                                <div className="text-[10px] text-slate-500 font-medium leading-tight">
                                                  {emp.projects!.map(p => (
                                                    <div key={p.id} className="truncate group-hover:text-slate-700 transition-colors">
                                                      • {p.name} <span className="text-slate-400 text-[9px]">({p.role})</span>
                                                    </div>
                                                  ))}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      )})}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
