"use client";

import React, { useState } from 'react';
import { Bell, Check, Filter, Trash2, Info, AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useNotifications } from '@/hooks/use-notifications';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationsPage() {
  const role = useAuthStore((state) => state.role);
  const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } = useNotifications();
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  const filteredNotifications = activeTab === 'unread' 
    ? notifications.filter(n => !n.isRead) 
    : notifications;

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
          {unreadCount > 0 && (
            <button 
              onClick={() => markAllAsRead()}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-sm"
            >
              <Check className="w-4 h-4" />
              Mark all as read
            </button>
          )}
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
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center text-center px-4 text-slate-400 font-medium">
                Loading notifications...
              </div>
            ) : filteredNotifications.length === 0 ? (
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
              filteredNotifications.map((n) => {
                let Icon = Info;
                let iconColor = "text-blue-500";
                let bgLight = "bg-blue-50";

                if (n.type.includes('WARNING') || n.type.includes('ALERT')) {
                  Icon = AlertTriangle;
                  iconColor = "text-amber-500";
                  bgLight = "bg-amber-50";
                } else if (n.type.includes('SUCCESS') || n.type.includes('APPROVAL')) {
                  Icon = CheckCircle2;
                  iconColor = "text-emerald-500";
                  bgLight = "bg-emerald-50";
                } else if (n.type.includes('ERROR') || n.type.includes('SECURITY')) {
                  Icon = ShieldAlert;
                  iconColor = "text-rose-500";
                  bgLight = "bg-rose-50";
                }

                return (
                  <div 
                    key={n.id} 
                    className={`p-5 flex gap-4 transition-colors ${n.isRead ? 'bg-white hover:bg-slate-50/50' : 'bg-slate-50 hover:bg-slate-100/50'}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${bgLight}`}>
                      <Icon className={`w-5 h-5 ${iconColor}`} />
                    </div>
                    <div className="flex-1 pt-0.5">
                      <div className="flex justify-between items-start gap-4">
                        <h4 className={`text-sm font-bold ${n.isRead ? 'text-slate-700' : 'text-slate-900'}`}>
                          {n.title}
                        </h4>
                        <span className="text-xs font-bold text-slate-400 whitespace-nowrap flex-shrink-0">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className={`text-sm mt-1 ${n.isRead ? 'text-slate-500' : 'text-slate-600 font-medium'}`}>
                        {n.body}
                      </p>
                      
                      {!n.isRead && (
                        <div className="mt-3">
                          <button 
                            onClick={() => markAsRead(n.id)}
                            className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            Mark as read
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
