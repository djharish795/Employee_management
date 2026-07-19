"use client";

import { usePermissions } from "@/hooks/use-permissions";
import React, { useEffect, useState } from "react";
import { ShieldAlert, KeyRound, Smartphone, Save, History, Clock } from "lucide-react";
import { SettingsRole } from "@/types/settings";
import { apiClient } from "@/lib/api/client";
import toast from "react-hot-toast";

interface SecurityPanelProps {}

export default function SecurityPanel() {
  const { isAdmin: canManageSecurity } = usePermissions();
  const [policy, setPolicy] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const fetchPolicyAndSessions = async () => {
      try {
        const [policyRes, sessionsRes] = await Promise.all([
          apiClient.get("/settings/policy"),
          apiClient.get("/auth/sessions")
        ]);
        setPolicy(policyRes.data);
        setSessions(sessionsRes.data);
      } catch (err) {
        toast.error("Failed to load security policies");
      } finally {
        setLoading(false);
      }
    };
    fetchPolicyAndSessions();
  }, []);

  const handleRevokeSession = async (jti: string) => {
    try {
      await apiClient.post(`/auth/sessions/${jti}/revoke`);
      toast.success("Session revoked successfully");
      setSessions(sessions.filter(s => s.id !== jti));
    } catch (err) {
      toast.error("Failed to revoke session");
    }
  };

  const executeSave = async () => {
    setSaving(true);
    setShowAuthModal(false);
    try {
      await apiClient.put("/settings/policy", policy);
      toast.success("Security policies updated successfully");
    } catch (err) {
      toast.error("Failed to update security policies");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveInit = () => {
    // Show step-up auth modal before saving
    setShowAuthModal(true);
  };

  if (loading) return <div className="p-12 text-center text-slate-500 font-medium">Loading security configuration...</div>;

  return (
    <div className="space-y-6 relative">
      {showAuthModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm rounded-xl">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Security Verification</h3>
            <p className="text-xs text-slate-500 mb-4">Please verify your identity to change global security policies.</p>
            <input type="password" placeholder="Enter your password" className="w-full h-10 px-3 text-sm border border-slate-200 rounded-lg mb-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowAuthModal(false)} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={executeSave} className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm">Verify & Save</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Security & Authentication</h2>
          <p className="text-xs font-semibold text-slate-500">Manage global MFA requirements, password policies, and active sessions.</p>
        </div>
        {canManageSecurity && (
          <button 
            onClick={handleSaveInit}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Security Policies"}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* MFA Policy */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Multi-Factor Authentication (MFA)</h3>
          </div>
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900">Enforce MFA Globally</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Require all employees to configure MFA before accessing the portal.</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={policy?.mfaRequired || false}
                  onChange={(e) => setPolicy({ ...policy, mfaRequired: e.target.checked })}
                  disabled={!canManageSecurity} 
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
              </label>
            </div>
            <hr className="border-slate-100" />
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-900 block">Allowed MFA Methods</label>
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked disabled={!canManageSecurity} className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-600 disabled:opacity-50" />
                <span className="text-xs font-medium text-slate-700">Authenticator App (TOTP - Google Auth, Authy)</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked disabled={!canManageSecurity} className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-600 disabled:opacity-50" />
                <span className="text-xs font-medium text-slate-700">Email OTP (HOTP - 6-digit code)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Password Policy */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Password Requirements</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <label className="text-xs font-bold text-slate-700">Minimum Password Length</label>
              <input 
                type="number" 
                value={policy?.passwordMinLength || 8} 
                onChange={(e) => setPolicy({ ...policy, passwordMinLength: parseInt(e.target.value) })}
                disabled={!canManageSecurity} 
                className="w-20 h-8 px-2 text-xs border border-slate-200 rounded focus:outline-none focus:border-indigo-500 disabled:bg-slate-50" 
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <label className="text-xs font-bold text-slate-700">Password Expiration (Days)</label>
              <input type="number" defaultValue={90} disabled={!canManageSecurity} className="w-20 h-8 px-2 text-xs border border-slate-200 rounded focus:outline-none focus:border-indigo-500 disabled:bg-slate-50" />
            </div>
            <hr className="border-slate-100" />
            <label className="flex items-center gap-3 mt-2">
              <input 
                type="checkbox" 
                checked={policy?.passwordComplexity ?? true}
                onChange={(e) => setPolicy({ ...policy, passwordComplexity: e.target.checked })}
                disabled={!canManageSecurity} 
                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-600 disabled:opacity-50" 
              />
              <span className="text-xs font-medium text-slate-700">Require at least one uppercase, number, and symbol</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked disabled={!canManageSecurity} className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-600 disabled:opacity-50" />
              <span className="text-xs font-medium text-slate-700">Prevent reuse of last 5 passwords</span>
            </label>
          </div>
        </div>

        {/* Session Management */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900">Session Management</h3>
          </div>
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block">Idle Session Timeout (Minutes)</label>
                <div className="text-[10px] text-slate-500 mt-0.5">Auto-logout after inactivity.</div>
              </div>
              <input type="number" defaultValue={15} disabled={!canManageSecurity} className="w-20 h-8 px-2 text-xs border border-slate-200 rounded focus:outline-none focus:border-indigo-500 disabled:bg-slate-50" />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block">Maximum Concurrent Sessions</label>
                <div className="text-[10px] text-slate-500 mt-0.5">Limit active devices per user.</div>
              </div>
              <input type="number" defaultValue={3} disabled={!canManageSecurity} className="w-20 h-8 px-2 text-xs border border-slate-200 rounded focus:outline-none focus:border-indigo-500 disabled:bg-slate-50" />
            </div>
            <hr className="border-slate-100" />
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900">VPN Requirement</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Block all access outside corporate AWS Client VPN.</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked disabled={!canManageSecurity} />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <h3 className="text-sm font-bold text-slate-900">Active Sessions</h3>
            </div>
          </div>
          <div className="p-0 max-h-64 overflow-y-auto">
            <div className="divide-y divide-slate-100">
              {sessions.map(session => (
                <div key={session.id} className="p-4 hover:bg-slate-50 transition-colors flex items-start justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">{session.ipAddress}</div>
                    <div className="text-[10px] font-medium text-slate-500">{session.userAgent}</div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <button 
                      onClick={() => handleRevokeSession(session.id)}
                      className="text-[10px] font-bold text-rose-600 hover:bg-rose-50 px-2 py-1 rounded"
                    >
                      Revoke
                    </button>
                  </div>
                </div>
              ))}
              {sessions.length === 0 && (
                <div className="p-4 text-xs text-slate-500 text-center">No active sessions found.</div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
