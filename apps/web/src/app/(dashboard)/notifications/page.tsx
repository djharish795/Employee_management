"use client";

import React, { useState } from 'react';
import { Bell, Check, Filter, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

interface NotificationRecord {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const role = useAuthStore((state) => state.role);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="flex flex-col h-full font-sans bg-slate-50 overflow-y-auto">
      <div className="p-8 max-w-[1000px] mx-auto w-full space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              Notifications
              {unreadCount > 0 && (
                <span className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Stay updated on system alerts and team activities.
            </p>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex gap-4">
              <button 
                onClick={() => setActiveTab('all')}
                className={`text-sm font-bold pb-1 transition-colors ${activeTab === 'all' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                All notifications
              </button>
              <button 
                onClick={() => setActiveTab('unread')}
                className={`text-sm font-bold pb-1 transition-colors ${activeTab === 'unread' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Unread only
              </button>
            </div>
          </div>
          
          <div className="divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-center px-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                  <Bell className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">You're all caught up!</h3>
                <p className="text-sm font-medium text-slate-500 max-w-sm">
                  We'll notify you here when there are important updates, new requests, or system alerts waiting for you.
                </p>
              </div>
            ) : (
              // Notifications map would go here
              null
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
