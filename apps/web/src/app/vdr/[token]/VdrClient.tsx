"use client";

import React, { useEffect, useState, useRef } from 'react';
import { apiClient } from '@/lib/api/client';
import { Loader2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

export default function VdrClient({ token }: { token: string }) {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBlurred, setIsBlurred] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const employeeId = useAuthStore(state => state.employeeId);

  useEffect(() => {
    // Disable right click, copy, and print
    const preventCopy = (e: ClipboardEvent) => e.preventDefault();
    const preventContextMenu = (e: MouseEvent) => e.preventDefault();
    
    document.addEventListener('copy', preventCopy);
    document.addEventListener('contextmenu', preventContextMenu);
    
    // Blur window on unfocus to prevent screenshots
    const handleBlur = () => setIsBlurred(true);
    const handleFocus = () => setIsBlurred(false);
    
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('copy', preventCopy);
      document.removeEventListener('contextmenu', preventContextMenu);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  useEffect(() => {
    const fetchVdr = async () => {
      try {
        const res = await apiClient.get(`/reports/vdr/${token}`);
        setData(res.data.payload);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Secure link is invalid, revoked, or has expired.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchVdr();
  }, [token]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-slate-300">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
          <p className="font-semibold tracking-wide">Decrypting Secure Vault...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-800 border border-slate-700 p-8 rounded-xl shadow-2xl text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-slate-400 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body {
            display: none !important;
          }
        }
        .watermark-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          pointer-events: none;
          z-index: 9999;
          overflow: hidden;
          opacity: 0.04;
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
        }
        .watermark-text {
          font-size: 24px;
          font-weight: 800;
          color: black;
          transform: rotate(-45deg);
          margin: 40px;
          white-space: nowrap;
          user-select: none;
        }
      `}} />
      
      <div 
        ref={containerRef}
        className={`min-h-screen bg-slate-50 transition-all duration-300 select-none ${isBlurred ? 'blur-xl grayscale' : ''}`}
        onCopy={(e) => e.preventDefault()}
      >
        {/* Dynamic Watermark Layer */}
        <div className="watermark-overlay">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="watermark-text">
              {employeeId || 'CONFIDENTIAL'} • {new Date().toISOString()} • CONFIDENTIAL
            </div>
          ))}
        </div>

        {/* VDR Header */}
        <div className="bg-slate-900 text-white px-8 py-4 flex items-center justify-between sticky top-0 z-50 shadow-md">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <div>
              <h1 className="font-bold text-lg tracking-tight">Virtual Data Room</h1>
              <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">Data Loss Prevention Active</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-300">HR Overview Report</p>
            <p className="text-xs text-slate-500">Access Monitored & Logged</p>
          </div>
        </div>

        {/* Report Content */}
        <div className="max-w-5xl mx-auto p-8 relative z-10">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-800 mb-8 pb-4 border-b border-slate-100">Executive HR Summary</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
              <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-100">
                <p className="text-xs font-bold text-indigo-600 uppercase mb-1">Total Headcount</p>
                <p className="text-3xl font-black text-indigo-900">{data?.headcount?.total || 0}</p>
              </div>
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100">
                <p className="text-xs font-bold text-emerald-600 uppercase mb-1">Present Today</p>
                <p className="text-3xl font-black text-emerald-900">{data?.attendance?.present || 0}</p>
              </div>
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-100">
                <p className="text-xs font-bold text-amber-600 uppercase mb-1">On Leave</p>
                <p className="text-3xl font-black text-amber-900">{data?.attendance?.onLeave || 0}</p>
              </div>
              <div className="p-4 rounded-lg bg-rose-50 border border-rose-100">
                <p className="text-xs font-bold text-rose-600 uppercase mb-1">Absent</p>
                <p className="text-3xl font-black text-rose-900">{data?.attendance?.absent || 0}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="border border-slate-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Recruitment Pipeline</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-sm font-medium text-slate-600">Open Positions</span>
                    <span className="font-bold text-slate-800">{data?.recruitment?.openPositions || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-sm font-medium text-slate-600">Candidates in Pipeline</span>
                    <span className="font-bold text-slate-800">{data?.recruitment?.candidatesInPipeline || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-slate-600">Offers Extended</span>
                    <span className="font-bold text-slate-800">{data?.recruitment?.offersExtended || 0}</span>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Leave Overview</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-sm font-medium text-slate-600">Pending Requests</span>
                    <span className="font-bold text-amber-600">{data?.leaves?.pendingRequests || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-sm font-medium text-slate-600">Approved (This Month)</span>
                    <span className="font-bold text-emerald-600">{data?.leaves?.approvedThisMonth || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-slate-600">Rejected (This Month)</span>
                    <span className="font-bold text-rose-600">{data?.leaves?.rejectedThisMonth || 0}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
