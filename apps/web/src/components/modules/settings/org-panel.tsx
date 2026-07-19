"use client";

import { usePermissions } from "@/hooks/use-permissions";
import React, { useState, useEffect } from "react";
import { Building2, MapPin, Save, UploadCloud, Users, Plus, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import toast from "react-hot-toast";

interface Location {
  id: string;
  name: string;
  isPrimary: boolean;
  address: string;
}

export default function OrgPanel() {
  const { canManageSettings: canEdit } = usePermissions();
  const queryClient = useQueryClient();

  const [companyName, setCompanyName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [website, setWebsite] = useState("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [logoKey, setLogoKey] = useState<string | null>(null);
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  const { data: orgProfile, isLoading: isOrgLoading } = useQuery({
    queryKey: ["org-profile"],
    queryFn: async () => {
      const res = await apiClient.get('/settings/org-profile');
      return res.data;
    }
  });

  useEffect(() => {
    if (orgProfile) {
      setCompanyName(orgProfile.companyName || "");
      setRegistrationNumber(orgProfile.registrationNumber || "");
      setWebsite(orgProfile.website || "");
      setLocations(orgProfile.locations || []);
      setLogoKey(orgProfile.logoKey || null);
    }
  }, [orgProfile]);

  const { data: logoViewUrl } = useQuery({
    queryKey: ["document-view-url", logoKey],
    queryFn: async () => {
      if (!logoKey) return null;
      const res = await apiClient.get(`/documents/view-url?objectKey=${logoKey}`);
      return res.data?.data?.url;
    },
    enabled: !!logoKey
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiClient.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data?.data?.objectKey;
    },
    onSuccess: (objectKey) => {
      setLogoKey(objectKey);
      toast.success("Logo uploaded temporarily. Don't forget to save changes!");
    },
    onError: () => {
      toast.error("Failed to upload logo.");
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  const { data: departments = [], isLoading: isDeptLoading } = useQuery({
    queryKey: ["org-departments-list"],
    queryFn: async () => {
      const res = await apiClient.get('/departments?limit=100');
      return res.data?.data || [];
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiClient.put('/settings/org-profile', data);
    },
    onSuccess: () => {
      toast.success("Organization profile saved successfully!");
      queryClient.invalidateQueries({ queryKey: ["org-profile"] });
    },
    onError: () => {
      toast.error("Failed to save organization profile.");
    }
  });

  const handleSave = () => {
    updateProfileMutation.mutate({
      companyName,
      registrationNumber,
      website,
      locations,
      logoKey
    });
  };

  const handleSaveLocation = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const address = formData.get('address') as string;
    const isPrimary = formData.get('isPrimary') === 'on';

    let newLocations = [...locations];

    if (editingLocation) {
      newLocations = newLocations.map(loc => {
        if (loc.id === editingLocation.id) {
          return { ...loc, name, address, isPrimary };
        }
        return loc;
      });
    } else {
      newLocations.push({
        id: `loc-${Date.now()}`,
        name,
        address,
        isPrimary
      });
    }

    if (isPrimary) {
      newLocations = newLocations.map(loc => ({
        ...loc,
        isPrimary: loc.name === name ? true : false
      }));
    }

    setLocations(newLocations);
    setIsLocationModalOpen(false);
    setEditingLocation(null);
  };

  return (
    <div className="space-y-6">
      
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Organization Profile</h2>
          <p className="text-xs font-semibold text-slate-500">Manage corporate identity, locations, and departments.</p>
        </div>
        
        {canEdit && (
          <button 
            onClick={handleSave}
            disabled={updateProfileMutation.isPending || isOrgLoading}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" /> {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ── Left Column ──────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Company Details */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-bold text-slate-900">Company Details</h3>
            </div>
            <div className="p-6">
              <div className="flex items-start gap-6">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                />
                <div 
                  onClick={() => canEdit && fileInputRef.current?.click()}
                  className={`relative w-24 h-24 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 overflow-hidden flex-shrink-0 group ${canEdit ? 'hover:bg-slate-100 hover:border-teal-400 cursor-pointer' : ''}`}
                >
                  {uploadMutation.isPending ? (
                    <span className="text-[10px] font-bold text-teal-600 animate-pulse">Uploading...</span>
                  ) : logoViewUrl ? (
                    <div className="relative w-full h-full group/logo">
                      <img src={logoViewUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                      {canEdit && (
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setLogoKey(null); }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover/logo:opacity-100 transition-opacity shadow-sm hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      <UploadCloud className={`w-6 h-6 mb-1 transition-colors ${canEdit ? 'group-hover:text-teal-500' : ''}`} />
                      <span className={`text-[9px] font-bold uppercase tracking-wider ${canEdit ? 'group-hover:text-teal-600' : ''}`}>Logo</span>
                    </>
                  )}
                </div>
                
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Company Name</label>
                    <input 
                      type="text" 
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      disabled={!canEdit || isOrgLoading}
                      placeholder="e.g. Acme Corp"
                      className="w-full h-9 px-3 text-sm font-semibold bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 disabled:bg-slate-50 disabled:text-slate-500" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Registration Number</label>
                    <input 
                      type="text" 
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      disabled={!canEdit || isOrgLoading}
                      placeholder="e.g. U72900KA..."
                      className="w-full h-9 px-3 text-sm font-mono text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 disabled:bg-slate-50 disabled:text-slate-500" 
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Primary Website</label>
                    <input 
                      type="text" 
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      disabled={!canEdit || isOrgLoading}
                      placeholder="https://example.com"
                      className="w-full h-9 px-3 text-sm font-semibold bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 disabled:bg-slate-50 disabled:text-slate-500" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Departments */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
             <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-bold text-slate-900">Departments</h3>
              </div>
            </div>
            <div className="p-0">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Department Name</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Head</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Employees</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isDeptLoading ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-center text-sm text-slate-500">Loading departments...</td>
                    </tr>
                  ) : departments.length > 0 ? (
                    departments.map((dept: any) => (
                      <tr key={dept.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-3 text-sm font-bold text-slate-900">{dept.name}</td>
                        <td className="px-6 py-3 text-xs font-semibold text-slate-600">
                          {dept.head ? `${dept.head.firstName || ""} ${dept.head.lastName || ""}`.trim() || "Unassigned" : "Unassigned"}
                        </td>
                        <td className="px-6 py-3 text-xs font-semibold text-slate-600">{dept._count?.employees || 0}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-center text-sm text-slate-500">No departments found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* ── Right Column ─────────────────────────────────────────────── */}
        <div className="space-y-6">
          
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-bold text-slate-900">Locations</h3>
              </div>
              {canEdit && (
                <button 
                  onClick={() => { setEditingLocation(null); setIsLocationModalOpen(true); }}
                  className="p-1 hover:bg-slate-100 text-slate-500 rounded transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="p-4 space-y-3">
              {isOrgLoading ? (
                <div className="text-xs text-center text-slate-500 py-4">Loading locations...</div>
              ) : locations.length > 0 ? (
                locations.map(loc => (
                  <div 
                    key={loc.id} 
                    onClick={() => { if (canEdit) { setEditingLocation(loc); setIsLocationModalOpen(true); } }}
                    className={`p-3 border rounded-lg transition-colors ${canEdit ? 'cursor-pointer hover:border-teal-300 bg-slate-50' : 'bg-white border-slate-200'}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold text-slate-900">{loc.name}</span>
                      {loc.isPrimary && (
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200">PRIMARY</span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium leading-tight whitespace-pre-line">
                      {loc.address}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-center text-slate-500 py-4">No locations added.</div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Location Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">{editingLocation ? 'Edit Location' : 'Add Location'}</h3>
              <button 
                onClick={() => setIsLocationModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveLocation}>
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Location Name</label>
                  <input 
                    name="name"
                    required
                    defaultValue={editingLocation?.name}
                    placeholder="e.g. Guntur Office"
                    className="w-full h-9 px-3 text-sm font-semibold bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Address</label>
                  <textarea 
                    name="address"
                    required
                    defaultValue={editingLocation?.address}
                    rows={4}
                    placeholder="Enter full address..."
                    className="w-full p-3 text-sm font-medium bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 resize-none" 
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="isPrimary"
                    defaultChecked={editingLocation?.isPrimary}
                    className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                  />
                  <span className="text-xs font-bold text-slate-700">Set as Primary Location</span>
                </label>
              </div>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsLocationModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg transition-colors"
                >
                  Save Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
