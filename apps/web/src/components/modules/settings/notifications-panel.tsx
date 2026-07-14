"use client";

import { usePermissions } from "@/hooks/use-permissions";
import React from "react";
import { Bell, Mail, Smartphone, Edit3, MessageSquare } from "lucide-react";
import { SettingsRole } from "@/types/settings";

interface NotificationsPanelProps {
  
}

export default function NotificationsPanel() {
  const { canManageSettings: canManage } = usePermissions();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Notification Center</h2>
          <p className="text-xs font-semibold text-slate-500">Manage communication rules and email templates.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Email Templates */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <Mail className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">Email Templates</h3>
          </div>
          <div className="p-0 divide-y divide-slate-100">
            {["Welcome Email (Onboarding)", "Password Reset Request", "Leave Approval Required", "MFA Setup Reminder"].map(template => (
              <div key={template} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div>
                  <div className="text-xs font-bold text-slate-900">{template}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Last updated: 1 month ago</div>
                </div>
                {canManage && (
                  <button className="text-[10px] font-bold text-slate-900 hover:text-slate-950 flex items-center gap-1 border border-slate-300 px-2 py-1 rounded bg-slate-100">
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Global Delivery Channels */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-900">Global Delivery Channels</h3>
          </div>
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> Email Delivery</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Allow system emails via AWS SES.</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked disabled={!canManage} />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 peer-disabled:opacity-50"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-2"><Bell className="w-3.5 h-3.5" /> In-App Notifications</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Bell icon alerts inside the portal.</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked disabled={!canManage} />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 peer-disabled:opacity-50"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-2"><Smartphone className="w-3.5 h-3.5" /> Push Notifications</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Mobile app push alerts (Firebase).</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" disabled={!canManage} />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 peer-disabled:opacity-50"></div>
              </label>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
