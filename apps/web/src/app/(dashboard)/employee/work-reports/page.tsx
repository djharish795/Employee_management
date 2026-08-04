'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { apiClient } from '@/lib/api/client';
import toast from 'react-hot-toast';
import { FileText, Upload, Plus, Trash2, Edit2, Eye, X } from 'lucide-react';

export default function EmployeeWorkReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('DAILY');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // View State
  const [viewingReport, setViewingReport] = useState<any | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/work-reports/me');
      setReports(res.data?.data || res.data || []);
    } catch (err) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const openFormForEdit = (report: any) => {
    setEditingId(report.id);
    setTitle(report.title);
    setType(report.reportType);
    setContent(report.content?.text || '');
    setFiles([]); // Mock: ignoring existing files for simplicity
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setType('DAILY');
    setContent('');
    setFiles([]);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return toast.error('Title and content are required');
    
    setIsSubmitting(true);
    try {
      const mappedAttachments = files.map(f => ({ name: f.name, size: f.size, type: f.type }));
      
      if (editingId) {
        await apiClient.patch(`/work-reports/${editingId}`, {
          title,
          reportType: type,
          content: { text: content },
          attachments: mappedAttachments.length > 0 ? mappedAttachments : undefined
        });
        toast.success('Work report updated successfully!');
      } else {
        await apiClient.post('/work-reports', {
          title,
          reportType: type,
          content: { text: content },
          attachments: mappedAttachments
        });
        toast.success('Work report submitted successfully!');
      }
      resetForm();
      fetchReports();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    try {
      await apiClient.delete(`/work-reports/${id}`);
      toast.success('Report deleted successfully');
      fetchReports();
    } catch (err: any) {
      toast.error('Failed to delete report');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Work Reports</h1>
          <p className="text-slate-500 text-sm mt-1">Submit and manage your daily, weekly, and monthly work reports.</p>
        </div>
        {!showForm && (
          <button 
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Report
          </button>
        )}
      </div>

      {/* VIEW MODAL */}
      {viewingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                {viewingReport.title}
              </h3>
              <button onClick={() => setViewingReport(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex gap-4 mb-6">
                <div className="bg-slate-100 rounded-md px-3 py-1.5 text-xs font-semibold text-slate-700">
                  {viewingReport.reportType}
                </div>
                <div className="bg-slate-100 rounded-md px-3 py-1.5 text-xs font-semibold text-slate-700">
                  {new Date(viewingReport.submittedAt).toLocaleDateString()}
                </div>
              </div>
              <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">
                {viewingReport.content?.text || "No content provided."}
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button onClick={() => setViewingReport(null)} className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FORM */}
      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-8 animate-in slide-in-from-top-4 duration-300">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-500" />
            {editingId ? 'Edit Work Report' : 'Submit New Report'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Report Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Frontend Development Update"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Report Type</label>
                <select 
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 bg-white"
                >
                  <option value="DAILY">Daily Report</option>
                  <option value="WEEKLY">Weekly Report</option>
                  <option value="MONTHLY">Monthly Report</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Report Content</label>
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your detailed work report here..."
                rows={6}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Attachments (Optional)</label>
              <label className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative overflow-hidden group">
                <input 
                  type="file" 
                  multiple 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => {
                    if (e.target.files) {
                      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
                    }
                  }}
                />
                <Upload className="w-6 h-6 text-slate-400 mb-2 group-hover:text-slate-600 transition-colors" />
                <p className="text-sm font-medium text-slate-600">Click to upload files</p>
                <p className="text-xs text-slate-400 mt-1">PDF, Excel, Word, or Images up to 10MB</p>
              </label>

              {files.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-md border border-slate-200">
                      <FileText className="w-4 h-4 text-slate-500" />
                      <span className="text-xs font-medium text-slate-700 max-w-[150px] truncate" title={f.name}>{f.name}</span>
                      <button 
                        type="button" 
                        onClick={() => setFiles(files.filter((_, idx) => idx !== i))} 
                        className="text-slate-400 hover:text-red-500 text-lg leading-none ml-1 focus:outline-none"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button 
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (editingId ? 'Updating...' : 'Submitting...') : (editingId ? 'Update Report' : 'Submit Report')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* HISTORY TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Title & Type</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td className="px-6 py-8 text-center text-sm text-slate-500" colSpan={3}>Loading reports...</td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td className="px-6 py-8 text-center text-sm text-slate-500" colSpan={3}>No reports submitted yet.</td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                      {new Date(report.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-900">{report.title}</div>
                      <div className="text-xs text-slate-500 font-medium">{report.reportType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setViewingReport(report)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => openFormForEdit(report)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(report.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
