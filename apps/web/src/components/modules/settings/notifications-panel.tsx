"use client";

import { usePermissions } from "@/hooks/use-permissions";
import React, { useEffect, useState } from "react";
import { Bell, Mail, Smartphone, Edit3, MessageSquare, Save, Loader2, X, Code, Eye } from "lucide-react";
import { SettingsRole } from "@/types/settings";
import { apiClient } from "@/lib/api/client";
import toast from "react-hot-toast";

interface NotificationsPanelProps {}

export default function NotificationsPanel() {
  const { canManageSettings: canManage } = usePermissions();
  const [policy, setPolicy] = useState<any>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [policyRes, templatesRes] = await Promise.all([
          apiClient.get('/settings/policy'),
          apiClient.get('/settings/email-templates')
        ]);
        setPolicy(policyRes.data);
        setTemplates(templatesRes.data);
      } catch (err) {
        toast.error("Failed to load notification settings");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSavePolicy = async () => {
    setSaving(true);
    try {
      await apiClient.put("/settings/policy", policy);
      toast.success("Notification settings updated successfully");
    } catch (err) {
      toast.error("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTemplate = async () => {
    try {
      await apiClient.put(`/settings/email-templates/${editingTemplate.id}`, {
        subject: editingTemplate.subject,
        bodyHtml: editingTemplate.bodyHtml
      });
      setTemplates(templates.map(t => t.id === editingTemplate.id ? editingTemplate : t));
      toast.success("Template saved successfully");
      setEditingTemplate(null);
    } catch (err) {
      toast.error("Failed to save template");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center p-12 text-slate-500">
      <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading settings...
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Notification Center</h2>
          <p className="text-xs font-semibold text-slate-500">Manage communication rules and email templates.</p>
        </div>
        {canManage && (
          <button 
            onClick={handleSavePolicy}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Settings"}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Email Templates */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-[500px]">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2 shrink-0">
            <Mail className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">Email Templates</h3>
          </div>
          <div className="p-0 divide-y divide-slate-100 overflow-y-auto">
            {templates.map(template => (
              <div key={template.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div>
                  <div className="text-xs font-bold text-slate-900">{template.name}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 font-mono bg-slate-100 px-1 py-0.5 rounded inline-block">{template.code}</div>
                </div>
                {canManage && (
                  <button 
                    onClick={() => setEditingTemplate({...template})}
                    className="text-[10px] font-bold text-slate-900 hover:text-slate-950 flex items-center gap-1 border border-slate-300 px-2 py-1 rounded bg-slate-100"
                  >
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Global Delivery Channels */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden h-min">
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
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={policy?.emailNotificationsEnabled ?? true} 
                  onChange={(e) => setPolicy({ ...policy, emailNotificationsEnabled: e.target.checked })}
                  disabled={!canManage} 
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 peer-disabled:opacity-50"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-2"><Bell className="w-3.5 h-3.5" /> In-App Notifications</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Bell icon alerts inside the portal.</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={policy?.inAppNotificationsEnabled ?? true} 
                  onChange={(e) => setPolicy({ ...policy, inAppNotificationsEnabled: e.target.checked })}
                  disabled={!canManage} 
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 peer-disabled:opacity-50"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-2"><Smartphone className="w-3.5 h-3.5" /> Push Notifications</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Mobile app push alerts (Firebase).</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={policy?.pushNotificationsEnabled ?? false} 
                  onChange={(e) => setPolicy({ ...policy, pushNotificationsEnabled: e.target.checked })}
                  disabled={!canManage} 
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 peer-disabled:opacity-50"></div>
              </label>
            </div>
          </div>
        </div>

      </div>

      {editingTemplate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-6 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center p-4 border-b border-slate-100 shrink-0">
              <div>
                <h3 className="font-bold text-slate-900">Edit Template: {editingTemplate.name}</h3>
                <p className="text-xs text-slate-500 mt-1">Available Variables: {editingTemplate.variables.map((v: string) => <code key={v} className="bg-slate-100 px-1 py-0.5 rounded text-[10px] mr-1">{`{{${v}}}`}</code>)}</p>
              </div>
              <button onClick={() => setEditingTemplate(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="p-4 border-b border-slate-100 shrink-0">
              <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
              <input 
                type="text" 
                value={editingTemplate.subject} 
                onChange={e => setEditingTemplate({...editingTemplate, subject: e.target.value})}
                className="w-full text-sm p-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500" 
              />
            </div>
            
            <div className="flex-1 overflow-hidden flex flex-col p-4 bg-slate-50 min-h-[400px]">
              <div className="flex items-center gap-2 mb-2">
                <button 
                  onClick={() => setPreviewMode(false)}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-md ${!previewMode ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                >
                  <Code className="w-3.5 h-3.5" /> HTML Code
                </button>
                <button 
                  onClick={() => setPreviewMode(true)}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-md ${previewMode ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                >
                  <Eye className="w-3.5 h-3.5" /> Live Preview
                </button>
              </div>
              
              <div className="flex-1 border border-slate-200 rounded-lg overflow-hidden bg-white shadow-inner flex">
                {!previewMode ? (
                  <textarea 
                    value={editingTemplate.bodyHtml}
                    onChange={e => setEditingTemplate({...editingTemplate, bodyHtml: e.target.value})}
                    className="w-full h-full p-4 font-mono text-[13px] text-slate-800 outline-none resize-none"
                    spellCheck={false}
                  />
                ) : (
                  <div className="w-full h-full p-8 overflow-y-auto bg-slate-100 flex items-start justify-center">
                    <div 
                      className="bg-white shadow-sm rounded border border-slate-200 w-full max-w-2xl min-h-[300px] p-6 text-sm"
                      dangerouslySetInnerHTML={{__html: editingTemplate.bodyHtml}} 
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-100 flex justify-end gap-2 shrink-0 bg-slate-50 rounded-b-xl">
              <button 
                onClick={() => setEditingTemplate(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveTemplate}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
              >
                <Save className="w-4 h-4" /> Save Template
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
