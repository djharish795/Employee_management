"use client";

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search,
  Filter,
  Plus,
  RefreshCw,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Edit2
} from 'lucide-react';
import { crmApi } from '@/lib/api/crm';
import toast, { Toaster } from 'react-hot-toast';

export default function CrmRequirementsView() {
  const [requirements, setRequirements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('All Priorities');
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<any>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newReq, setNewReq] = useState({
    title: '',
    clientName: '',
    category: 'Core',
    priority: 'Medium',
    status: 'Pending',
    description: ''
  });
  
  const handleEdit = (req: any) => {
    setSelectedReq({ ...req });
    setIsEditModalOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await crmApi.createRequirement(newReq);
      toast.success('Requirement created successfully');
      setIsAddModalOpen(false);
      setNewReq({
        title: '',
        clientName: '',
        category: 'Core',
        priority: 'Medium',
        status: 'Pending',
        description: ''
      });
      fetchRequirements();
    } catch (error) {
      toast.error('Failed to create requirement');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await crmApi.updateRequirement(selectedReq.id, selectedReq);
      toast.success('Requirement updated successfully');
      setIsEditModalOpen(false);
      fetchRequirements();
    } catch (error) {
      toast.error('Failed to update requirement');
    }
  };

  const fetchRequirements = async () => {
    try {
      setIsLoading(true);
      const res = await crmApi.getRequirements();
      const reqData = res.data?.data || res.data || [];
      setRequirements(Array.isArray(reqData) ? reqData : []);
    } catch (error) {
      toast.error('Failed to load CRM requirements');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequirements();
  }, []);

  const filteredRequirements = requirements.filter(req => {
    const title = req.title || req.name || '';
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (req.category || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === 'All Priorities' || req.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  return (
    <div className="flex-1 w-full p-6 md:p-8 bg-slate-50 min-h-screen font-sans">
      <Toaster position="top-right" />
      
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Requirement Management</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">
              Manage and track client business needs across CRM modules.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select 
              value={filterPriority}
              onChange={e => setFilterPriority(e.target.value)}
              className="px-3 py-2 text-xs font-bold bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="All Priorities">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <button 
              onClick={fetchRequirements}
              className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> New Requirement
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by ID, title, or category..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
          />
        </div>

        {/* Requirements Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
          ) : filteredRequirements.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wide bg-slate-50/80">
                    <th className="py-4 px-6">Requirement ID & Name</th>
                    <th className="py-4 px-4">Client</th>
                    <th className="py-4 px-4">Category</th>
                    <th className="py-4 px-4">Priority</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-800">
                  {filteredRequirements.map((req: any) => (
                    <tr key={req.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900">{req.title || req.name || 'Untitled'}</div>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">{req.id}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-700">{req.clientName || req.client?.company || 'Unknown Client'}</div>
                      </td>
                      <td className="py-4 px-4 text-slate-600">
                        {req.category || 'Core'}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                          req.priority === 'High' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                          'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {req.priority || 'Medium'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                          req.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          req.status === 'Validation Needed' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-slate-50 text-slate-600 border-slate-200'
                        }`}>
                          {req.status === 'Approved' && <CheckCircle2 className="w-3 h-3" />}
                          {req.status === 'Validation Needed' && <AlertCircle className="w-3 h-3" />}
                          {req.status || 'Pending'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button 
                          onClick={() => handleEdit(req)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 mb-4">
                <FileText className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">No requirements match your filters</h3>
              <p className="text-sm text-slate-500 font-medium">
                Get started by adding a new client requirement or adjust your search.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Create New Requirement</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>
            
            <form onSubmit={handleCreate} className="overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Title / Name</label>
                <input 
                  type="text" 
                  value={newReq.title}
                  onChange={e => setNewReq({...newReq, title: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Client Name</label>
                <input 
                  type="text" 
                  value={newReq.clientName}
                  onChange={e => setNewReq({...newReq, clientName: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Priority</label>
                  <select 
                    value={newReq.priority} 
                    onChange={e => setNewReq({...newReq, priority: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Status</label>
                  <select 
                    value={newReq.status} 
                    onChange={e => setNewReq({...newReq, status: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Validation Needed">Validation Needed</option>
                    <option value="Approved">Approved</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Description</label>
                <textarea 
                  value={newReq.description}
                  onChange={e => setNewReq({...newReq, description: e.target.value})}
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-900 text-sm focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-sm transition-colors"
                >
                  Create Requirement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedReq && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Edit Requirement</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>
            
            <form onSubmit={handleUpdate} className="overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Title / Name</label>
                <input 
                  type="text" 
                  value={selectedReq.name || selectedReq.title || ''}
                  onChange={e => setSelectedReq({...selectedReq, title: e.target.value, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Priority</label>
                  <select 
                    value={selectedReq.priority || 'Medium'} 
                    onChange={e => setSelectedReq({...selectedReq, priority: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Status</label>
                  <select 
                    value={selectedReq.status || 'Pending'} 
                    onChange={e => setSelectedReq({...selectedReq, status: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Validation Needed">Validation Needed</option>
                    <option value="Approved">Approved</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Description</label>
                <textarea 
                  value={selectedReq.description || ''}
                  onChange={e => setSelectedReq({...selectedReq, description: e.target.value})}
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-900 text-sm focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-sm transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
