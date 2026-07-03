"use client";

import React, { useState, useEffect } from "react";
import { X, Save, CheckSquare, AlignLeft, Users, Calendar, Plus, Trash2 } from "lucide-react";
import { connectApi } from "@/lib/api/connect";

interface MeetingWorkspaceProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: any;
}

export function MeetingWorkspace({ isOpen, onClose, meeting }: MeetingWorkspaceProps) {
  const [agenda, setAgenda] = useState<string>("");
  const [actionItems, setActionItems] = useState<{ id: string; text: string; completed: boolean }[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (meeting) {
      setAgenda(meeting.agenda?.text || "");
      setActionItems(meeting.actionItems || []);
    }
  }, [meeting]);

  if (!isOpen || !meeting) return null;

  const handleSave = async () => {
    try {
      setSaving(true);
      await connectApi.updateWorkspace(meeting.id, {
        agenda: { text: agenda },
        actionItems,
      });
      window.alert("Workspace saved successfully");
    } catch (err: any) {
      window.alert(err.response?.data?.message || "Failed to save workspace");
    } finally {
      setSaving(false);
    }
  };

  const addActionItem = () => {
    setActionItems([...actionItems, { id: Math.random().toString(36).substring(7), text: "", completed: false }]);
  };

  const updateActionItem = (id: string, text: string) => {
    setActionItems(actionItems.map(item => item.id === id ? { ...item, text } : item));
  };

  const toggleActionItem = (id: string) => {
    setActionItems(actionItems.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const removeActionItem = (id: string) => {
    setActionItems(actionItems.filter(item => item.id !== id));
  };

  const dateStr = new Date(meeting.startTime).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white animate-in slide-in-from-bottom-8 duration-300">

      {/* Header */}
      <div className="flex-none px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{meeting.title} - Workspace</h2>
            <p className="text-sm text-slate-500 font-medium flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> {dateStr}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Workspace"}
          </button>
          <button onClick={onClose} className="p-2 bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Agenda Column */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[600px]">
            <div className="px-5 py-4 border-b border-slate-100 bg-white flex items-center gap-2">
              <AlignLeft className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900">Meeting Agenda & Notes</h3>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <textarea
                value={agenda}
                onChange={(e) => setAgenda(e.target.value)}
                placeholder="Write down discussion points, notes, and shared agenda items here..."
                className="w-full flex-1 resize-none bg-transparent border-0 p-0 text-slate-700 placeholder:text-slate-400 focus:ring-0 text-base leading-relaxed"
              />
            </div>
          </div>

          {/* Action Items Column */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[600px]">
            <div className="px-5 py-4 border-b border-slate-100 bg-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900">Action Items</h3>
              </div>
              <button
                onClick={addActionItem}
                className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Task
              </button>
            </div>
            <div className="p-5 flex-1 overflow-y-auto space-y-3">
              {actionItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-6">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                    <CheckSquare className="w-6 h-6 text-slate-400" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">No action items yet</h4>
                  <p className="text-xs text-slate-500">Track tasks and assign follow-ups directly in this workspace.</p>
                </div>
              ) : (
                actionItems.map((item) => (
                  <div key={item.id} className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${item.completed ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <button
                      onClick={() => toggleActionItem(item.id)}
                      className={`w-5 h-5 rounded flex-none mt-0.5 flex items-center justify-center transition-colors ${item.completed ? 'bg-emerald-500 text-white' : 'bg-slate-100 border border-slate-300'}`}
                    >
                      {item.completed && <CheckSquare className="w-3.5 h-3.5" />}
                    </button>
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) => updateActionItem(item.id, e.target.value)}
                      placeholder="What needs to be done?"
                      className={`flex-1 bg-transparent border-0 p-0 text-sm focus:ring-0 ${item.completed ? 'text-slate-400 line-through' : 'text-slate-700 font-medium'}`}
                    />
                    <button
                      onClick={() => removeActionItem(item.id)}
                      className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
