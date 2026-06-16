"use client";

import React from "react";
import { ShieldAlert, KeyRound, Smartphone, Save, History, Clock } from "lucide-react";
import { SettingsRole } from "@/types/settings";

interface SecurityPanelProps {
  activeRole: SettingsRole;
}

export default function SecurityPanel({ activeRole }: SecurityPanelProps) {
  const canManageSecurity = ["SUPER_ADMIN", "ADMIN", "IT_ADMIN"].includes(activeRole);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Authentication & Security</h2>
          <p className="text-xs font-semibold text-slate-500">Configure MFA, passwords, and session management rules.</p>
        </div>
        {canManageSecurity && (
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors">
            <Save className="w-4 h-4" /> Save Security Policies
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
                <input type="checkbox" className="sr-only peer" defaultChecked disabled={!canManageSecurity} />
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
              <input type="number" defaultValue={12} disabled={!canManageSecurity} className="w-20 h-8 px-2 text-xs border border-slate-200 rounded focus:outline-none focus:border-indigo-500 disabled:bg-slate-50" />
            </div>
            <div className="flex items-center justify-between gap-4">
              <label className="text-xs font-bold text-slate-700">Password Expiration (Days)</label>
              <input type="number" defaultValue={90} disabled={!canManageSecurity} className="w-20 h-8 px-2 text-xs border border-slate-200 rounded focus:outline-none focus:border-indigo-500 disabled:bg-slate-50" />
            </div>
            <hr className="border-slate-100" />
            <label className="flex items-center gap-3 mt-2">
              <input type="checkbox" defaultChecked disabled={!canManageSecurity} className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-600 disabled:opacity-50" />
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

        {/* Failed Login Activity */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <h3 className="text-sm font-bold text-slate-900">Recent Failed Logins</h3>
            </div>
            <button className="text-[10px] font-bold text-indigo-600 hover:underline">View All Logs</button>
          </div>
          <div className="p-0">
            <div className="divide-y divide-slate-100">
              <div className="p-4 hover:bg-slate-50 transition-colors flex items-start justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">Invalid Password Attempt</div>
                  <div className="text-[10px] font-medium text-slate-500">User: john.smith@naprocs.com</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-rose-600">Blocked</div>
                  <div className="text-[10px] text-slate-400">10 mins ago</div>
                </div>
              </div>
              <div className="p-4 hover:bg-slate-50 transition-colors flex items-start justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">MFA Token Expired</div>
                  <div className="text-[10px] font-medium text-slate-500">User: emily.c@naprocs.com</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-amber-600">Warning</div>
                  <div className="text-[10px] text-slate-400">1 hour ago</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
