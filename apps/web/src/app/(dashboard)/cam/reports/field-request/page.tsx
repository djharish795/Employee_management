"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, MapPin, ShieldAlert, FileText, UploadCloud, X, ArrowLeft, Play, Save, CheckCircle2 
} from 'lucide-react';
import { fetchMyProfile } from '@/lib/api/profile';

export default function FieldWorkRequestPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    employeeName: '',
    employeeId: '',
    department: '',
    reportingManager: '',
    date: '',
    startTime: '',
    endTime: '',
    destination: '',
    client: '',
    purpose: '',
    description: '',
    transportation: '',
    returnTime: '',
    contact: '',
    remarks: ''
  });

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchMyProfile();
        setProfile(data);
        
        // Prefill form from profile details
        const fName = `${data.firstName || ''} ${data.middleName || ''} ${data.lastName || ''}`.replace(/\s+/g, ' ').trim();
        const mName = data.reportingManager
          ? `${data.reportingManager.firstName || ''} ${data.reportingManager.lastName || ''}`.replace(/\s+/g, ' ').trim()
          : 'Not Assigned';

        setFormData(prev => ({
          ...prev,
          employeeName: fName || 'Junaid',
          employeeId: data.employeeId || 'NAP/OH/001',
          department: data.department?.name || 'Operations',
          reportingManager: mName || 'Sarah Jenkins'
        }));
      } catch (err) {
        console.error("Failed to load user profile", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB limit.");
        return;
      }
      setFileName(file.name);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB limit.");
        return;
      }
      setFileName(file.name);
    }
  };

  const onUploadButtonClick = () => {
    fileInputRef.current?.click();
  };

  const saveRequest = (status: 'Submitted' | 'Draft') => {
    if (status === 'Submitted') {
      if (!formData.date || !formData.startTime || !formData.endTime || !formData.destination || !formData.purpose || !formData.description || !formData.transportation || !formData.returnTime || !formData.contact) {
        alert("Please fill in all required fields marked with *");
        return null;
      }
    }

    const id = `REQ-2023-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRequest = {
      ...formData,
      id,
      status,
      fileName,
      createdAt: new Date().toISOString()
    };

    const existing = localStorage.getItem('field_work_requests');
    const list = existing ? JSON.parse(existing) : [];
    list.unshift(newRequest);
    localStorage.setItem('field_work_requests', JSON.stringify(list));
    return id;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = saveRequest('Submitted');
    if (id) {
      setSubmittedId(id);
    }
  };

  const handleSaveDraft = (e: React.MouseEvent) => {
    e.preventDefault();
    const id = saveRequest('Draft');
    if (id) {
      router.push('/cam/reports');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-72px)] bg-slate-50 dark:bg-slate-950">
        <div className="w-8 h-8 border-4 border-slate-300 dark:border-slate-800 border-t-slate-900 dark:border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-72px)] bg-slate-50 dark:bg-slate-950 animate-in fade-in duration-300">
      <div className="flex-1 p-6 md:p-8 max-w-[1200px] mx-auto w-full pb-28">
        
        {/* Navigation & Header */}
        <div className="flex items-center gap-3 mb-6">
          <button 
            type="button"
            onClick={() => router.push('/cam/reports')}
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">New Field Work Request</h1>
              <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold rounded">Version 2.0</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Fill in the details below to initiate a field request for approval.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Card 1: Personnel Information */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-5 border-b border-slate-100 dark:border-slate-850 pb-3">
              <User className="w-4.5 h-4.5 text-slate-500" />
              Personnel Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Employee Name *</label>
                <input 
                  type="text" 
                  required
                  value={formData.employeeName}
                  onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-medium focus:border-slate-900 dark:focus:border-white focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/10 outline-none transition-all" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Employee ID *</label>
                <input 
                  type="text" 
                  required
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-medium focus:border-slate-900 dark:focus:border-white focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/10 outline-none transition-all" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Department *</label>
                <input 
                  type="text" 
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-medium focus:border-slate-900 dark:focus:border-white focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/10 outline-none transition-all" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Reporting Manager *</label>
                <input 
                  type="text" 
                  required
                  value={formData.reportingManager}
                  onChange={(e) => setFormData({ ...formData, reportingManager: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-medium focus:border-slate-900 dark:focus:border-white focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/10 outline-none transition-all" 
                />
              </div>
            </div>
          </div>

          {/* Card 2: Visit Logistics */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-5 border-b border-slate-100 dark:border-slate-850 pb-3">
              <MapPin className="w-4.5 h-4.5 text-slate-500" />
              Visit Logistics
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">Field Work Date *</label>
                <input 
                  type="date" 
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-medium focus:border-slate-900 dark:focus:border-white focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/10 outline-none transition-all [color-scheme:light] dark:[color-scheme:dark]" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">Start Time *</label>
                <input 
                  type="time" 
                  required
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-medium focus:border-slate-900 dark:focus:border-white focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/10 outline-none transition-all [color-scheme:light] dark:[color-scheme:dark]" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">End Time *</label>
                <input 
                  type="time" 
                  required
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-medium focus:border-slate-900 dark:focus:border-white focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/10 outline-none transition-all [color-scheme:light] dark:[color-scheme:dark]" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">Destination / Location *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Enter physical address or site name"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-medium placeholder-slate-400 focus:border-slate-900 dark:focus:border-white focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/10 outline-none transition-all" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">Client / Organization</label>
                <input 
                  type="text" 
                  placeholder="Search for clients..."
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-medium placeholder-slate-400 focus:border-slate-900 dark:focus:border-white focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/10 outline-none transition-all" 
                />
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">Purpose of Visit *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Maintenance, Site Inspection, Client Meeting"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-medium placeholder-slate-400 focus:border-slate-900 dark:focus:border-white focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/10 outline-none transition-all" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">Work Description *</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="Detailed scope of work to be performed..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-medium placeholder-slate-400 focus:border-slate-900 dark:focus:border-white focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/10 outline-none transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Travel & Safety */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-5 border-b border-slate-100 dark:border-slate-850 pb-3">
              <ShieldAlert className="w-4.5 h-4.5 text-slate-500" />
              Travel & Safety
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">Transportation Mode *</label>
                <select 
                  required
                  value={formData.transportation}
                  onChange={(e) => setFormData({ ...formData, transportation: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-medium focus:border-slate-900 dark:focus:border-white focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/10 outline-none transition-all [&>option]:bg-white dark:[&>option]:bg-slate-900"
                >
                  <option value="" disabled>Select mode</option>
                  <option value="company">Company Vehicle</option>
                  <option value="personal">Personal Vehicle</option>
                  <option value="public">Public Transport</option>
                  <option value="flight">Flight</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">Expected Return Time *</label>
                <input 
                  type="time" 
                  required
                  value={formData.returnTime}
                  onChange={(e) => setFormData({ ...formData, returnTime: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-medium focus:border-slate-900 dark:focus:border-white focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/10 outline-none transition-all [color-scheme:light] dark:[color-scheme:dark]" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">Contact Number *</label>
                <input 
                  type="text" 
                  required
                  placeholder="+1 (555) 000-0000"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-medium placeholder-slate-400 focus:border-slate-900 dark:focus:border-white focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/10 outline-none transition-all" 
                />
              </div>
            </div>
          </div>

          {/* Card 4: Supporting Documents */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-5 border-b border-slate-100 dark:border-slate-850 pb-3">
              <FileText className="w-4.5 h-4.5 text-slate-500" />
              Supporting Documents
            </h3>

            <div className="space-y-5">
              {/* Drag and Drop Zone */}
              <div 
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  dragActive 
                    ? "border-slate-900 bg-slate-50 dark:border-white dark:bg-slate-950" 
                    : "border-slate-200 hover:bg-slate-50/50 dark:border-slate-800 dark:hover:bg-slate-950/30"
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={onUploadButtonClick}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden" 
                />
                
                <UploadCloud className="w-10 h-10 text-slate-400 mb-3" />
                
                {fileName ? (
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Selected File:</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold mt-1">{fileName}</p>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">
                      PDF, JPG, or PNG (Max 5MB per file)
                    </p>
                  </>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">Additional Remarks (Optional)</label>
                <textarea 
                  rows={3}
                  placeholder="Any additional information for the approver..."
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-medium placeholder-slate-400 focus:border-slate-900 dark:focus:border-white focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/10 outline-none transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Sticky Bottom Actions Bar (strictly monochrome) */}
          <div className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between shrink-0 fixed bottom-0 left-0 right-0 z-30 lg:left-64 transition-all duration-300">
            <div>
              <button 
                type="button"
                onClick={() => router.push('/cam/reports')}
                className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button 
                type="button"
                onClick={handleSaveDraft}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-350 dark:border-slate-750 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-sm font-bold shadow-sm transition-colors"
              >
                <Save className="w-4 h-4" />
                Save as Draft
              </button>
              <button 
                type="submit"
                className="flex items-center gap-1.5 px-6 py-2.5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-lg text-sm font-bold shadow-sm transition-colors"
              >
                <Play className="w-4 h-4 fill-current" />
                Submit Request
              </button>
            </div>
          </div>

        </form>
      </div>

      {/* Dynamic Success Acknowledgement Modal */}
      {submittedId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 max-w-md w-full text-center shadow-2xl animate-in scale-in duration-200">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200 dark:border-slate-755">
              <CheckCircle2 className="w-8 h-8 text-slate-950 dark:text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Request Submitted</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
              Your field work request has been logged under ID <span className="font-bold text-slate-900 dark:text-white">{submittedId}</span>. It is currently under review by the operations department.
            </p>
            <button 
              onClick={() => router.push('/cam/reports')}
              className="w-full h-11 bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-lg text-sm font-bold shadow-sm transition-colors"
            >
              Go to Reports
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
