"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  User, ArrowLeft, Download, PenSquare, Clock, Calendar, MapPin, 
  Eye, Check, Lock, FileText, Image, AlertTriangle, XCircle, Copy, Map
} from 'lucide-react';
import { useRbac } from '@/hooks/use-rbac';
import { Permission } from '@naprocs/types';

export default function FieldWorkRequestDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const requestId = params.id as string;

  const [request, setRequest] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTeamRequest, setIsTeamRequest] = useState(false);

  const { hasPermission } = useRbac();
  const canApprove = hasPermission(Permission.APPROVE_FIELD_REQUESTS);

  // Mockup fallback matching the screenshot perfectly
  const mockFallback = {
    id: 'REQ-2023-0482',
    employeeName: 'John S. Miller',
    employeeId: 'EMS-77492',
    department: 'Technical Operations',
    reportingManager: 'Sarah Jenkins',
    client: 'Naprocs Global Solutions Ltd.',
    destination: 'Regional Headquarters, Site B, Singapore',
    purpose: 'Annual hardware audit and system synchronization for high-density server racks. Verification of cooling efficiency and backup power redundancy protocols.',
    date: '2023-10-24',
    startTime: '09:00',
    endTime: '17:00',
    description: 'Conduct thorough inspection of Series-X enclosures. Check cabling integrity, swap redundant PSU units if required, and update firmware on peripheral controllers. Full report expected within 24 hours of site exit.',
    transportation: 'company',
    returnTime: '18:00',
    contact: '+65 9123 4567',
    remarks: 'Awaiting site credentials confirmation.',
    status: 'Under Review',
    fileName: 'Site_Safety_Protocol.pdf',
    createdAt: '2023-10-18T14:32:00.000Z'
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check team requests first
      const storedTeam = localStorage.getItem('team_field_requests');
      if (storedTeam) {
        const list = JSON.parse(storedTeam);
        const found = list.find((item: any) => item.id === requestId);
        if (found) {
          setRequest(found);
          setIsTeamRequest(true);
          setIsLoading(false);
          return;
        }
      }

      // Check own requests
      const stored = localStorage.getItem('field_work_requests');
      if (stored) {
        const list = JSON.parse(stored);
        const found = list.find((item: any) => item.id === requestId);
        if (found) {
          setRequest(found);
          setIsTeamRequest(false);
          setIsLoading(false);
          return;
        }
      }
      
      // Fallback for mock IDs
      setRequest(mockFallback);
      setIsTeamRequest(false);
      setIsLoading(false);
    }
  }, [requestId]);

  const handleCancelRequest = () => {
    if (confirm("Are you sure you want to cancel this request? Canceled requests cannot be reinstated.")) {
      // Remove from localStorage if it exists
      const stored = localStorage.getItem('field_work_requests');
      if (stored) {
        const list = JSON.parse(stored);
        const filtered = list.filter((item: any) => item.id !== requestId);
        localStorage.setItem('field_work_requests', JSON.stringify(filtered));
      }
      alert("Request canceled successfully.");
      router.push('/cam/reports');
    }
  };

  const handleCopyCoordinates = () => {
    navigator.clipboard.writeText("1.290270, 103.851959");
    alert("Coordinates copied to clipboard: 1.290270, 103.851959");
  };

  const handleApproveReject = (newStatus: 'Approved' | 'Rejected') => {
    const storedTeam = localStorage.getItem('team_field_requests');
    if (storedTeam) {
      const list = JSON.parse(storedTeam);
      const updated = list.map((item: any) => {
        if (item.id === requestId) {
          return { ...item, status: newStatus };
        }
        return item;
      });
      localStorage.setItem('team_field_requests', JSON.stringify(updated));
    }
    alert(`Request ${newStatus.toLowerCase()} successfully.`);
    router.push('/cam/reports');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-72px)] bg-slate-50 dark:bg-slate-950">
        <div className="w-8 h-8 border-4 border-slate-300 dark:border-slate-800 border-t-slate-900 dark:border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  // Format date display
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // Format submission date display
  const formatSubmittedDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
      }) + ' - ' + date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch {
      return 'Oct 18, 2023 - 14:32';
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-72px)] bg-slate-50 dark:bg-slate-950 animate-in fade-in duration-300">
      <div className="flex-1 p-6 md:p-8 max-w-[1400px] mx-auto w-full pb-20">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider">
          <button onClick={() => router.push('/cam/reports')} className="hover:text-slate-900 dark:hover:text-white transition-colors">Requests</button>
          <span>&gt;</span>
          <span className="text-slate-900 dark:text-white">{request.id}</span>
        </div>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push('/cam/reports')}
              className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">{request.id}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span className="text-xs font-semibold text-slate-500">{formatSubmittedDate(request.createdAt)}</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5 mt-0.5">
                Field Work Request Details
                <span className="px-2.5 py-0.5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-[10px] font-extrabold rounded-lg uppercase tracking-wider">
                  {request.status || 'UNDER REVIEW'}
                </span>
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {canApprove && isTeamRequest && request.status === 'Under Review' ? (
              <>
                <button 
                  onClick={() => handleApproveReject('Approved')}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-lg text-sm font-bold shadow-sm transition-all"
                >
                  Approve
                </button>
                <button 
                  onClick={() => handleApproveReject('Rejected')}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-350 dark:border-slate-750 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-sm font-bold shadow-sm transition-all"
                >
                  Reject
                </button>
              </>
            ) : (
              <>
                <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-750 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
                <button 
                  onClick={() => alert("Edit mode is only available for drafts.")}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-lg text-sm font-bold transition-all shadow-sm"
                >
                  <PenSquare className="w-4 h-4" />
                  Edit Request
                </button>
              </>
            )}
          </div>
        </div>

        {/* Main Layout */}
        <div className="space-y-6">
            
            {/* Visit Details Card */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-5 border-b border-slate-100 dark:border-slate-850 pb-3">
                <MapPin className="w-4.5 h-4.5 text-slate-500" />
                Visit Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Client / Organization</h4>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{request.client || 'Unspecified'}</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Destination</h4>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{request.destination}</p>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Purpose of Visit</h4>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-350 leading-relaxed">{request.purpose}</p>
              </div>
            </div>

            {/* Schedule & Scope Card */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-5 border-b border-slate-100 dark:border-slate-850 pb-3">
                <Calendar className="w-4.5 h-4.5 text-slate-500" />
                Schedule & Scope
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Date</h4>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {formatDate(request.date)}
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Time Duration</h4>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {request.startTime} — {request.endTime} (Expected Return: {request.returnTime})
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Work Description</h4>
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-150 dark:border-slate-850 text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                  {request.description}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Logistics & Transport</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-lg capitalize">
                    {request.transportation} Transport
                  </span>
                  <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-lg">
                    Secure Entry Permit
                  </span>
                  <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-lg">
                    Tool Clearance
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom row cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* On-site Contact */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-5 border-b border-slate-100 dark:border-slate-850 pb-3">
                  <User className="w-4.5 h-4.5 text-slate-500" />
                  On-site Contact
                </h3>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-slate-800 dark:text-white">
                    JD
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">James D. Wilson</h4>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">Site Supervisor</p>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">{request.contact}</p>
                  </div>
                </div>
              </div>

              {/* Attachments */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-5 border-b border-slate-100 dark:border-slate-850 pb-3">
                  <FileText className="w-4.5 h-4.5 text-slate-500" />
                  Attachments
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2.5 border border-slate-100 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors">
                    <FileText className="w-4.5 h-4.5 text-slate-400" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                      {request.fileName || 'Site_Safety_Protocol.pdf'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 border border-slate-100 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors">
                    <Image className="w-4.5 h-4.5 text-slate-400" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                      Rack_Layout_Diagram.jpg
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        {/* Danger Zone Block */}
        <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-rose-600 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              Danger Zone
            </h4>
            <p className="text-xs font-semibold text-slate-500 mt-1">Canceled requests cannot be reinstated.</p>
          </div>
          <button 
            onClick={handleCancelRequest}
            className="flex items-center gap-1.5 px-4 py-2 border border-rose-350 hover:bg-rose-50 text-rose-600 rounded-lg text-xs font-bold transition-colors"
          >
            <XCircle className="w-4 h-4" />
            Cancel This Request
          </button>
        </div>

      </div>
    </div>
  );
}
