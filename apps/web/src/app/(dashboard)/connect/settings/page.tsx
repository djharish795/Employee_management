"use client";

import React, { useState } from "react";
import { Settings, Calendar as CalendarIcon, Clock, Bell, CheckCircle2, AlertCircle } from "lucide-react";

export default function ConnectSettingsPage() {
  const [googleConnected, setGoogleConnected] = useState(true);

  return (
    <div className="max-w-3xl mx-auto pb-10">
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Connect Settings</h2>
        <p className="text-sm font-medium text-slate-500 mt-1">Manage your availability, calendars, and scheduling preferences.</p>
      </div>

      <div className="space-y-6">
        
        {/* Calendar Integrations */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Calendar Integrations</h3>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Connect your calendar to automatically block busy slots.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center font-bold text-blue-600">G</div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Google Calendar</h4>
                  <p className="text-xs font-medium text-slate-500">ravi.kumar@naprocs.com</p>
                </div>
              </div>
              <button 
                onClick={() => setGoogleConnected(!googleConnected)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  googleConnected 
                  ? "bg-slate-100 text-slate-600 hover:bg-slate-200" 
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                }`}
              >
                {googleConnected ? "Disconnect" : "Connect"}
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl opacity-60 grayscale">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center font-bold text-blue-600">M</div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Microsoft Outlook</h4>
                  <p className="text-xs font-medium text-slate-500">Not connected</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600">
                Connect
              </button>
            </div>
          </div>
        </div>

        {/* Availability Preferences */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Availability Preferences</h3>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Define when people can schedule meetings with you.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Working Hours</label>
              <div className="flex items-center gap-2">
                <select className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                  <option>09:00 AM</option>
                  <option>10:00 AM</option>
                </select>
                <span className="text-slate-400 font-bold">to</span>
                <select className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                  <option>05:00 PM</option>
                  <option>06:00 PM</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Timezone</label>
              <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                <option>IST (UTC+5:30)</option>
                <option>EST (UTC-5:00)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Buffer Time</label>
              <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                <option>15 mins between meetings</option>
                <option>30 mins between meetings</option>
                <option>No buffer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Minimum Notice</label>
              <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                <option>2 hours</option>
                <option>4 hours</option>
                <option>1 day</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Notifications</h3>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Control how you are alerted about meetings.</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 transition-colors" />
              <div>
                <span className="block text-sm font-bold text-slate-700 group-hover:text-slate-900">Email Notifications</span>
                <span className="block text-xs text-slate-500">Receive emails for new requests and updates.</span>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 transition-colors" />
              <div>
                <span className="block text-sm font-bold text-slate-700 group-hover:text-slate-900">System Notifications</span>
                <span className="block text-xs text-slate-500">Show alerts in the EMS notification center.</span>
              </div>
            </label>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex justify-end pt-4">
          <button className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-sm transition-all flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Save Preferences
          </button>
        </div>

      </div>
    </div>
  );
}
