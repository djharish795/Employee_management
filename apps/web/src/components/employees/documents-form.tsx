import React, { useState } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, Eye, Download, Trash2, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

const CATEGORIES = [
  { id: 'personal', label: 'Personal', icon: <FileText className="w-4 h-4" /> },
  { id: 'identity', label: 'Identity', icon: <FileText className="w-4 h-4" /> },
  { id: 'education', label: 'Education', icon: <FileText className="w-4 h-4" /> },
  { id: 'employment', label: 'Previous Employment', icon: <FileText className="w-4 h-4" /> },
  { id: 'financial', label: 'Financial', icon: <FileText className="w-4 h-4" /> },
];

export function DocumentsForm() {
  const [activeTab, setActiveTab] = useState('personal');

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      
      {/* Left Sidebar - Categories */}
      <div className="md:col-span-1 space-y-6">
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">Categories</h4>
          <nav className="space-y-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-bold transition-colors ${
                  activeTab === cat.id 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {cat.icon}
                {cat.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <h4 className="text-sm font-bold text-slate-800 mb-2">Submission Guidelines</h4>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <div className="w-1 h-1 rounded-full bg-slate-400" /> Max file size 5MB
            </li>
            <li className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <div className="w-1 h-1 rounded-full bg-slate-400" /> PDF, JPG, or PNG
            </li>
            <li className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <div className="w-1 h-1 rounded-full bg-slate-400" /> High resolution scan
            </li>
          </ul>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="md:col-span-3 space-y-6">
        
        {/* Upload Dropzone */}
        <div className="border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 flex flex-col items-center justify-center py-12 px-4 cursor-pointer hover:bg-slate-100 hover:border-slate-400 transition-colors">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <UploadCloud className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">Drag and drop documents here</h3>
          <p className="text-sm font-semibold text-slate-500 mb-4">Supported formats: PDF, PNG, JPG (Max 5MB each)</p>
          <button className="h-10 px-6 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors shadow-sm">
            Select Files
          </button>
        </div>

        {/* Document Lists */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">Personal Documents</h3>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">0 Items</span>
          </div>

          <div className="space-y-3">
            {/* Empty State */}
            <div className="flex flex-col items-center justify-center py-10 px-4 border border-dashed border-slate-200 rounded-xl bg-white">
              <FileText className="w-10 h-10 text-slate-300 mb-3" />
              <h4 className="text-sm font-bold text-slate-700">No documents uploaded</h4>
              <p className="text-xs font-semibold text-slate-500 mt-1">Files uploaded in this category will appear here</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
