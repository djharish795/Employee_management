"use client";

import React, { useState, useEffect } from "react";
import { Settings, Calendar as CalendarIcon, Clock, Bell, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { connectApi } from "@/lib/api/connect";

export default function ConnectSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    googleCalendarConnected: false,
    workingHoursStart: "09:00",
    workingHoursEnd: "18:00",
    timezone: "Asia/Kolkata",
    bufferMinutes: 15,
    minNoticeHours: 2,
    emailNotifications: true,
    systemNotifications: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await connectApi.getSettings();
      if (res.data) {
        setSettings({
          googleCalendarConnected: res.data.googleCalendarConnected,
          workingHoursStart: res.data.workingHoursStart || "09:00",
          workingHoursEnd: res.data.workingHoursEnd || "18:00",
          timezone: res.data.timezone || "Asia/Kolkata",
          bufferMinutes: res.data.bufferMinutes ?? 15,
          minNoticeHours: res.data.minNoticeHours ?? 2,
          emailNotifications: res.data.emailNotifications ?? true,
          systemNotifications: res.data.systemNotifications ?? true,
        });
      }
    } catch (error) {
      console.error("Failed to load settings", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await connectApi.updateSettings(settings);
    } catch (error) {
      console.error("Failed to save settings", error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return <div className="p-10 text-center text-slate-500 font-medium">Loading settings...</div>;
  }

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
                  <p className="text-xs font-medium text-slate-500">
                    {settings.googleCalendarConnected ? "Connected" : "Not connected"}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => handleChange("googleCalendarConnected", !settings.googleCalendarConnected)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  settings.googleCalendarConnected 
                  ? "bg-slate-100 text-slate-600 hover:bg-slate-200" 
                  : "bg-slate-900 text-white hover:bg-slate-800 shadow-sm"
                }`}
              >
                {settings.googleCalendarConnected ? "Disconnect" : "Connect"}
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
                <select 
                  value={settings.workingHoursStart}
                  onChange={(e) => handleChange("workingHoursStart", e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="08:00">08:00 AM</option>
                  <option value="09:00">09:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                </select>
                <span className="text-slate-400 font-bold">to</span>
                <select 
                  value={settings.workingHoursEnd}
                  onChange={(e) => handleChange("workingHoursEnd", e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="17:00">05:00 PM</option>
                  <option value="18:00">06:00 PM</option>
                  <option value="19:00">07:00 PM</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Timezone</label>
              <select 
                value={settings.timezone}
                onChange={(e) => handleChange("timezone", e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="Asia/Kolkata">IST (UTC+5:30)</option>
                <option value="America/New_York">EST (UTC-5:00)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Buffer Time</label>
              <select 
                value={settings.bufferMinutes}
                onChange={(e) => handleChange("bufferMinutes", parseInt(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value={15}>15 mins between meetings</option>
                <option value={30}>30 mins between meetings</option>
                <option value={0}>No buffer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Minimum Notice</label>
              <select 
                value={settings.minNoticeHours}
                onChange={(e) => handleChange("minNoticeHours", parseInt(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value={2}>2 hours</option>
                <option value={4}>4 hours</option>
                <option value={24}>1 day</option>
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
              <input 
                type="checkbox" 
                checked={settings.emailNotifications}
                onChange={(e) => handleChange("emailNotifications", e.target.checked)}
                className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 transition-colors" 
              />
              <div>
                <span className="block text-sm font-bold text-slate-700 group-hover:text-slate-900">Email Notifications</span>
                <span className="block text-xs text-slate-500">Receive emails for new requests and updates.</span>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={settings.systemNotifications}
                onChange={(e) => handleChange("systemNotifications", e.target.checked)}
                className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 transition-colors" 
              />
              <div>
                <span className="block text-sm font-bold text-slate-700 group-hover:text-slate-900">System Notifications</span>
                <span className="block text-xs text-slate-500">Show alerts in the EMS notification center.</span>
              </div>
            </label>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex justify-end pt-4">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-sm transition-all flex items-center gap-2 disabled:opacity-70"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Save Preferences
          </button>
        </div>

      </div>
    </div>
  );
}
