"use client";

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/store/auth';
import { CheckCircle2, XCircle, Loader2, Package, Search } from 'lucide-react';

export default function AssetApprovalsPage() {
  const queryClient = useQueryClient();
  const role = useAuthStore((state) => state.role);
  const employeeId = useAuthStore((state) => state.employeeId);

  const [toast, setToast] = useState({ show: false, message: '' });
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [ceoNotes, setCeoNotes] = useState("");
  const [damageNotes, setDamageNotes] = useState("");

  const showToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const { data: availableAssets = [] } = useQuery({
    queryKey: ['available-assets'],
    queryFn: async () => {
      const res = await apiClient.get('/assets', { params: { status: 'AVAILABLE', limit: 1000 } });
      return res.data?.data?.assets || res.data?.assets || [];
    },
    enabled: !!selectedRequest && (selectedRequest.action === 'OM' || selectedRequest.action === 'CEO')
  });

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['asset-requests'],
    queryFn: async () => {
      const res = await apiClient.get('/assets/requests');
      return res.data?.data || res.data || [];
    }
  });

  const omSelect = useMutation({
    mutationFn: async ({ id, assetIds }: { id: string, assetIds: string[] }) => {
      await apiClient.patch(`/assets/requests/${id}/om-select`, { assetIds });
    },
    onSuccess: () => {
      showToast("Assets selected successfully. Sent to CEO.");
      setSelectedRequest(null);
      queryClient.invalidateQueries({ queryKey: ['assetRequests'] });
    },
    onError: (error: any) => {
      showToast(error?.response?.data?.message || "Failed to process OM selection");
    }
  });

  const omRecover = useMutation({
    mutationFn: async ({ id, assetIds, notes }: { id: string, assetIds: string[], notes: string }) => {
      // For each asset to recover, call the OM return endpoint
      for (const assetId of assetIds) {
        await apiClient.post(`/assets/${assetId}/return`, { returnedCondition: notes || "Returned in Offboarding" });
      }
      // Finally, mark the request itself as APPROVED (completed)
      await apiClient.patch(`/assets/requests/${id}/ceo-approve`, { status: "APPROVED", notes });
    },
    onSuccess: () => {
      showToast("Assets recovered successfully.");
      setSelectedRequest(null);
      queryClient.invalidateQueries({ queryKey: ['assetRequests'] });
    },
    onError: (error: any) => {
      showToast(error?.response?.data?.message || "Failed to process OM recovery");
    }
  });

  const ceoApprove = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string, status: string, notes?: string }) => {
      await apiClient.patch(`/assets/requests/${id}/ceo-approve`, { status, notes });
    },
    onSuccess: () => {
      showToast("Request processed successfully.");
      setSelectedRequest(null);
      queryClient.invalidateQueries({ queryKey: ['assetRequests'] });
    },
    onError: (error: any) => {
      showToast(error?.response?.data?.message || "Failed to process CEO approval");
    }
  });

  if (isLoading) return <div className="flex h-full items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>;

  return (
    <div className="flex flex-col h-full font-sans bg-slate-50 overflow-y-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Asset Approvals</h1>
          <p className="text-sm text-slate-500 mt-1">Manage hardware and software requests.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {requests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No pending asset requests.</p>
          </div>
        ) : (
          requests.map((req: any) => (
            <div key={req.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase ${
                    req.type === 'ONBOARDING' ? 'bg-emerald-100 text-emerald-700' :
                    req.type === 'OFFBOARDING' ? 'bg-rose-100 text-rose-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {req.type}
                  </span>
                  <span className={`text-xs font-bold ${
                    req.status.includes('APPROVED') ? 'text-emerald-600' :
                    req.status.includes('REJECTED') ? 'text-rose-600' :
                    'text-amber-600'
                  }`}>
                    {req.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Request for {req.employee?.firstName} {req.employee?.lastName}
                </h3>
                <div className="mt-2 text-sm text-slate-600">
                  <span className="font-semibold">Items: </span>
                  {Array.isArray(req.requestedItems) ? req.requestedItems.join(", ") : "Assets"}
                </div>
                {req.reason && (
                  <div className="mt-1 text-sm text-slate-500">
                    <span className="font-semibold">Reason: </span>
                    {req.reason}
                  </div>
                )}
                <div className="mt-3 text-xs text-slate-400">
                  Requested by {req.requester?.firstName} {req.requester?.lastName} on {new Date(req.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {req.status === 'PENDING_OM_SELECTION' && role === 'OM' && req.type !== 'OFFBOARDING' && (
                  <button 
                    onClick={() => {
                      setSelectedRequest({ ...req, action: 'OM' });
                      setSelectedAssetIds([]);
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Select Assets
                  </button>
                )}
                {req.status === 'PENDING_OM_SELECTION' && role === 'OM' && req.type === 'OFFBOARDING' && (
                  <button 
                    onClick={() => {
                      setSelectedRequest({ ...req, action: 'OM_RECOVER' });
                      setDamageNotes("");
                    }}
                    className="px-4 py-2 bg-rose-600 text-white text-sm font-semibold rounded-lg hover:bg-rose-700 transition-colors"
                  >
                    Recover Assets
                  </button>
                )}
                {req.status === 'PENDING_CEO_APPROVAL' && role === 'CEO' && (
                  <button 
                    onClick={() => setSelectedRequest({ ...req, action: 'CEO' })}
                    className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Review & Approve
                  </button>
                )}
                {req.status === 'PENDING_CEO_APPROVAL' && role === 'OM' && (
                  <span className="text-sm font-semibold text-slate-500 italic">
                    Sent to CEO
                  </span>
                )}
                {req.status === 'PENDING_OM_SELECTION' && role === 'CEO' && (
                  <span className="text-sm font-semibold text-slate-500 italic">
                    Awaiting OM
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {selectedRequest && selectedRequest.action === 'OM' && (
        <div className="fixed inset-0 bg-slate-900/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">OM: Select Assets</h3>
              <p className="text-sm text-slate-500 mt-1">Enter the inventory Asset IDs to allocate.</p>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-3">Select Available Assets to Allocate</label>
                
                {(() => {
                  if (availableAssets.length === 0) {
                    return (
                      <div className="p-4 bg-amber-50 text-amber-700 text-sm rounded-lg border border-amber-100">
                        No available assets found in inventory. You can still send to CEO empty or cancel.
                      </div>
                    );
                  }

                  const groupedAssets = availableAssets.reduce((acc: any, asset: any) => {
                    if (!acc[asset.category]) acc[asset.category] = [];
                    acc[asset.category].push(asset);
                    return acc;
                  }, {});

                  const entries = Object.entries(groupedAssets);

                  if (entries.length === 0) {
                    return (
                      <div className="p-4 bg-amber-50 text-amber-700 text-sm rounded-lg border border-amber-100">
                        No available assets found in inventory. You can still send to CEO empty or cancel.
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      {entries.map(([category, assets]: [string, any]) => {
                        const isCategoryFulfilled = selectedAssetIds.some(id => {
                          const a = availableAssets.find((a: any) => a.id === id);
                          return a?.category === category;
                        });

                        return (
                          <div key={category} className="space-y-2">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{category.replace(/_/g, ' ')}</h4>
                            <div className="grid grid-cols-1 gap-2">
                              {assets.map((asset: any) => {
                                const isSelected = selectedAssetIds.includes(asset.id);
                                const isDisabled = isCategoryFulfilled && !isSelected;

                                return (
                                  <label 
                                    key={asset.id} 
                                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                                      isSelected 
                                        ? 'bg-indigo-50 border-indigo-200' 
                                        : isDisabled
                                        ? 'bg-slate-50 border-slate-100 opacity-50 cursor-not-allowed'
                                        : 'bg-white border-slate-200 hover:bg-slate-50 cursor-pointer'
                                    }`}
                                  >
                                    <input 
                                      type="checkbox" 
                                      disabled={isDisabled}
                                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 disabled:opacity-50"
                                      checked={isSelected}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedAssetIds(prev => [...prev, asset.id]);
                                        } else {
                                          setSelectedAssetIds(prev => prev.filter(id => id !== asset.id));
                                        }
                                      }}
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm font-bold text-slate-900 truncate">{asset.name}</div>
                                      <div className="text-xs font-medium text-slate-500">{asset.assetTag} {asset.brand ? `· ${asset.brand}` : ''}</div>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
                Cancel
              </button>
              <button 
                onClick={() => {
                  omSelect.mutate({ id: selectedRequest.id, assetIds: selectedAssetIds });
                }}
                disabled={omSelect.isPending}
                className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50">
                {omSelect.isPending ? 'Sending...' : 'Send to CEO'}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedRequest && selectedRequest.action === 'OM_RECOVER' && (
        <div className="fixed inset-0 bg-slate-900/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">OM: Recover Assets</h3>
              <p className="text-sm text-slate-500 mt-1">Verify physical return of assets and flag any damage.</p>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-3">Assets to Recover</label>
                <div className="space-y-2">
                  {selectedRequest.requestedItems && selectedRequest.requestedItems.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-slate-900 truncate">{item.name || "Asset"}</div>
                        <div className="text-xs font-medium text-slate-500">{item.category} {item.serialNumber ? `· S/N: ${item.serialNumber}` : ''}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Damage Rating & Notes (Optional)</label>
                <p className="text-xs text-slate-500 mb-2">If any asset is damaged (e.g. scratched screen), describe it here for Finance.</p>
                <textarea 
                  value={damageNotes}
                  onChange={(e) => setDamageNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  rows={3}
                  placeholder="e.g., Laptop screen is heavily scratched."
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
                Cancel
              </button>
              <button 
                onClick={() => {
                  const assetIds = selectedRequest.requestedItems.map((i: any) => i.assetId);
                  omRecover.mutate({ id: selectedRequest.id, assetIds, notes: damageNotes });
                }}
                disabled={omRecover.isPending}
                className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors disabled:opacity-50">
                {omRecover.isPending ? 'Processing...' : 'Mark as Returned'}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedRequest && selectedRequest.action === 'CEO' && (
        <div className="fixed inset-0 bg-slate-900/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">CEO: Final Approval</h3>
              <p className="text-sm text-slate-500 mt-1">Approve asset allocation for {selectedRequest.employee?.firstName}.</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <span className="font-bold mb-2 block">OM Selected Assets: </span>
                {selectedRequest.selectedAssetIds?.length ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {selectedRequest.selectedAssetIds.map((id: string) => {
                      const asset = availableAssets.find((a: any) => a.id === id);
                      if (asset) {
                        return (
                          <li key={id} className="text-slate-900 font-medium text-xs">
                            {asset.name} <span className="text-slate-500 font-normal">({asset.assetTag})</span>
                          </li>
                        );
                      }
                      return <li key={id} className="text-slate-500 text-xs">ID: {id}</li>;
                    })}
                  </ul>
                ) : (
                  <span className="italic">None</span>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notes (Optional)</label>
                <textarea 
                  value={ceoNotes}
                  onChange={(e) => setCeoNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={2}
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
                Cancel
              </button>
              <button 
                onClick={() => ceoApprove.mutate({ id: selectedRequest.id, status: 'REJECTED', notes: ceoNotes })}
                disabled={ceoApprove.isPending}
                className="px-4 py-2 text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors disabled:opacity-50">
                Reject
              </button>
              <button 
                onClick={() => ceoApprove.mutate({ id: selectedRequest.id, status: 'APPROVED', notes: ceoNotes })}
                disabled={ceoApprove.isPending}
                className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50">
                {ceoApprove.isPending ? 'Processing...' : 'Approve & Allocate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast.show && (
        <div className="fixed bottom-4 right-4 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
