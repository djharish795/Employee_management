"use client";

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';
import { FileText, Calendar, Users, CheckCircle, Search, Clock, FileArchive, X } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  key: string;
  startDate: string;
  endDate: string | null;
  createdAt: string;
  _count?: {
    assignments: number;
  };
}

export default function CTOProjectHistoryPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    const fetchCompletedProjects = async () => {
      try {
        const res = await apiClient.get('/projects?status=COMPLETED');
        setProjects(res.data || []);
      } catch (err) {
        console.error("Failed to fetch completed projects", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCompletedProjects();
  }, []);

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.key && p.key.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
      {/* Header */}
      <div className="flex-none bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <FileArchive className="w-6 h-6 text-indigo-600" />
              Project History
            </h1>
            <p className="text-slate-500 text-sm mt-1">Archive of all completed projects and their details.</p>
          </div>
          
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <CheckCircle className="w-16 h-16 text-slate-300 mb-4" />
            <p className="text-lg font-medium">No completed projects found.</p>
            <p className="text-sm">When a project is completed, it will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div key={project.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-100 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">{project.name}</h3>
                      <p className="text-xs font-mono text-slate-500 mt-1 bg-slate-100 inline-block px-2 py-0.5 rounded">
                        {project.key || 'NO-KEY'}
                      </p>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Completed
                    </span>
                  </div>
                  
                  <p className="text-sm text-slate-600 line-clamp-3 mb-4">
                    {project.description || 'No description provided.'}
                  </p>
                </div>
                
                <div className="bg-slate-50 p-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Started
                    </p>
                    <p className="font-medium text-slate-700">
                      {new Date(project.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Completed
                    </p>
                    <p className="font-medium text-slate-700">
                      {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                
                <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Users className="w-4 h-4" />
                    <span>{project._count?.assignments || 0} Team Members</span>
                  </div>
                  <button 
                    onClick={() => setSelectedProject(project)}
                    className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1"
                  >
                    <FileText className="w-4 h-4" /> View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">{selectedProject.name} Details</h2>
              <button onClick={() => setSelectedProject(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-500 mb-1">Project Key</h4>
                <p className="text-slate-800 font-mono text-sm bg-slate-100 inline-block px-2 py-0.5 rounded">{selectedProject.key || 'NO-KEY'}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-500 mb-1">Description</h4>
                <p className="text-slate-800 text-sm">{selectedProject.description || 'No description provided.'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-500 mb-1">Start Date</h4>
                  <p className="text-slate-800 text-sm">{new Date(selectedProject.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-500 mb-1">End Date</h4>
                  <p className="text-slate-800 text-sm">{selectedProject.endDate ? new Date(selectedProject.endDate).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-500 mb-1">Team Size</h4>
                <p className="text-slate-800 text-sm">{selectedProject._count?.assignments || 0} Members assigned</p>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button onClick={() => setSelectedProject(null)} className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-sm font-bold transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
