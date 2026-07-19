"use client";

import React, { useState } from 'react';
import { format } from 'date-fns';
import { CamSchedulerChat, Message } from '../../../../components/cam/CamSchedulerChat';
import { FolderOpen, Download, Eye, X, FileText, FileImage, FileSpreadsheet } from 'lucide-react';

export default function TeamChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isFilesModalOpen, setIsFilesModalOpen] = useState(false);

  // Derive files from real-time chat messages
  const existingFiles = messages
    .filter(m => m.isFile)
    .map(m => {
      const name = m.text.replace('Shared a file: ', '');
      const type = name.endsWith('.pdf') ? 'pdf' : 
                   name.match(/\.(png|jpg|jpeg|gif)$/i) ? 'image' : 
                   name.match(/\.(xlsx|csv|xls)$/i) ? 'excel' : 'doc';
      
      return {
        id: m.id,
        name: name,
        size: m.senderName, // Show sender name instead of size
        date: format(new Date(m.timestamp), "MMM dd, yyyy - hh:mm a"),
        type: type,
        url: m.fileUrl || "#"
      };
    });

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <FileImage className="w-5 h-5 text-blue-500" />;
      case 'excel': return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
      default: return <FileText className="w-5 h-5 text-slate-500" />;
    }
  };

  const handleDownload = (file: typeof existingFiles[0]) => {
    if (file.url === "#") return;
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleView = (file: typeof existingFiles[0]) => {
    if (file.url === "#") return;
    // For images, we can open in a new tab easily
    window.open(file.url, '_blank');
  };

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-300 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Team Chat</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Communicate and sync with your internal team.</p>
        </div>
        <div>
          <button 
            onClick={() => setIsFilesModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
          >
            <FolderOpen className="w-4 h-4" />
            Existing Files
          </button>
        </div>
      </div>
      
      <div className="h-full" style={{ height: "calc(100vh - 200px)", minHeight: "600px" }}>
        <CamSchedulerChat messages={messages} setMessages={setMessages} />
      </div>

      {/* Existing Files Modal */}
      {isFilesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                <h3 className="font-bold text-slate-900 dark:text-white">Existing Files</h3>
              </div>
              <button 
                onClick={() => setIsFilesModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="overflow-y-auto p-4 flex-1">
              <div className="space-y-3">
                {existingFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        {getFileIcon(file.type)}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">{file.name}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          <span>{file.size}</span>
                          <span>•</span>
                          <span>{file.date}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleView(file)}
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors tooltip-trigger"
                        title="View File"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDownload(file)}
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors tooltip-trigger"
                        title="Download File"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Shared files from this team chat are available here.
              </p>
              <button 
                onClick={() => setIsFilesModalOpen(false)} 
                className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
