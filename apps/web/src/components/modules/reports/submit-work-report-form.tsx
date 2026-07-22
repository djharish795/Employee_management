"use client";

import React, { useState } from 'react';
import { Send, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { PremiumDashboardLayout, PremiumCard } from '@/components/shared/premium-dashboard';
import { apiClient } from '@/lib/api/client';
import toast from 'react-hot-toast';

export function SubmitWorkReportForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    reportType: 'Daily Standup',
    title: '',
    priority: 'MEDIUM',
    content: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await apiClient.post('/work-reports', {
        ...formData,
        content: { details: formData.content }
      });
      setSubmitted(true);
      toast.success("Report submitted successfully");
    } catch (error: any) {
      console.error("Failed to submit report", error);
      toast.error(error?.response?.data?.message || "Failed to submit report");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <PremiumDashboardLayout className="p-0 bg-transparent min-h-0 max-w-3xl mx-auto w-full">
        <PremiumCard className="p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Report Submitted Successfully</h2>
          <p className="text-slate-500 mb-8">Your Operations Manager has been notified and will review your submission shortly.</p>
          <button 
            onClick={() => {
              setSubmitted(false);
              setFormData({ ...formData, title: '', content: '' });
            }}
            className="px-6 py-2.5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 font-bold rounded-lg transition-colors"
          >
            Submit Another Report
          </button>
        </PremiumCard>
      </PremiumDashboardLayout>
    );
  }

  return (
    <PremiumDashboardLayout className="p-0 bg-transparent min-h-0 space-y-6 max-w-4xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Submit Work Report</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">Log your daily progress, weekly updates, or incident reports.</p>
      </div>

      <PremiumCard className="p-0 overflow-hidden border border-slate-200">
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Report Type</label>
              <select 
                value={formData.reportType}
                onChange={(e) => setFormData({...formData, reportType: e.target.value})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-slate-800"
              >
                <option value="Daily Standup">Daily Standup</option>
                <option value="Weekly Sync">Weekly Sync</option>
                <option value="Incident Report">Incident Report</option>
                <option value="Budget Reconciliation">Budget Reconciliation</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Priority</label>
              <select 
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-slate-800"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Report Title</label>
            <input 
              required
              type="text"
              placeholder="e.g. Q4 Marketing Campaign Standup"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-slate-800"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Detailed Content</label>
            <textarea 
              required
              rows={8}
              placeholder="What did you accomplish? Any blockers?"
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-slate-800 resize-none leading-relaxed"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
              <AlertCircle className="w-4 h-4" />
              <span>This will be sent directly to your assigned Operations Manager.</span>
            </div>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-70 disabled:cursor-not-allowed text-sm font-bold rounded-lg transition-colors shadow-sm"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </PremiumCard>
    </PremiumDashboardLayout>
  );
}
