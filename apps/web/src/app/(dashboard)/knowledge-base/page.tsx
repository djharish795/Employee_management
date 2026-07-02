"use client";

import React, { useState } from 'react';
import { Search, Plus, BookOpen, MoreHorizontal, Edit, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

// Interface for KB Data. Real data will be fetched by the backend team.
interface KnowledgeDocument {
  id: string;
  title: string;
  category: 'HR Policy' | 'SOP' | 'Compliance' | 'Training';
  status: 'Published' | 'Draft';
  author: string;
  lastUpdated: string;
}

const CATEGORIES = ['All', 'HR Policies', 'SOPs', 'Compliance', 'Training'];

export default function KnowledgeBasePage() {
  const role = useAuthStore((state) => state.role);
  const [activeCategory, setActiveCategory] = useState('All');
  
  // This will be replaced with real backend API hooks (e.g. useQuery)
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]); 
  const [isLoading, setIsLoading] = useState(false); // Simulated loading state

  // Protect route: Only HR can access (Knowledge base management is HR-only per rules)
  if (role !== "HR" && role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-slate-500">
        <AlertCircle className="w-10 h-10 text-rose-400 mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Access Restricted</h2>
        <p className="mt-2 text-sm">Only authorized personnel can manage the Knowledge Base.</p>
      </div>
    );
  }

  // Derived state
  const filteredDocs = documents.filter(doc => {
    if (activeCategory === 'All') return true;
    if (activeCategory === 'HR Policies' && doc.category === 'HR Policy') return true;
    if (activeCategory === 'SOPs' && doc.category === 'SOP') return true;
    if (activeCategory === 'Compliance' && doc.category === 'Compliance') return true;
    if (activeCategory === 'Training' && doc.category === 'Training') return true;
    return false;
  });

  return (
    <div className="flex flex-col h-full font-sans bg-white overflow-y-auto">
      
      {/* Header section matching screenshot exactly */}
      <div className="border-b border-slate-200 px-8 py-6">
        <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">Knowledge Base</h1>
      </div>

      <div className="p-8 max-w-[1400px] mx-auto w-full space-y-6">
        
        {/* Action Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="px-3 py-1.5 bg-slate-100 text-slate-600 text-sm font-medium rounded-full border border-slate-200 shadow-sm">
              {documents.length} documents
            </span>
            <div className="relative w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search documents..." 
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
              />
            </div>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> New document
          </button>
        </div>

        {/* Categories / Filters */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {CATEGORIES.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 text-sm font-semibold rounded-full border transition-colors whitespace-nowrap ${
                activeCategory === cat 
                  ? 'bg-slate-900 text-white border-slate-900' 
                  : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Data Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest w-[35%]">Title</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Category</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Author</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Last Updated</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[13px]">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium">
                      Loading documents...
                    </td>
                  </tr>
                ) : documents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium bg-slate-50/50">
                      <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                      No documents found. Waiting for backend data.
                    </td>
                  </tr>
                ) : (
                  filteredDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 font-bold text-slate-900">{doc.title}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-100 rounded-md">
                          {doc.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {doc.status === 'Published' ? (
                          <span className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 rounded-md">
                            Published
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200 rounded-md">
                            Draft
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600">{doc.author}</td>
                      <td className="px-6 py-4 text-slate-500">{doc.lastUpdated}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="text-blue-600 hover:text-blue-800 font-semibold text-xs">Edit</button>
                          <button className="text-slate-400 hover:text-slate-700"><MoreHorizontal className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-500 bg-slate-50/50">
            <span>Showing 1-{Math.min(8, filteredDocs.length)} of {documents.length}</span>
            <div className="flex gap-2">
              <button className="px-2 py-1.5 border border-slate-200 rounded bg-white hover:bg-slate-50 text-slate-400">&lt;</button>
              <button className="px-3 py-1.5 border border-slate-900 rounded bg-slate-900 text-white">1</button>
              <button className="px-3 py-1.5 border border-slate-200 rounded bg-white hover:bg-slate-50 text-slate-700">2</button>
              <button className="px-2 py-1.5 border border-slate-200 rounded bg-white hover:bg-slate-50 text-slate-700">&gt;</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
