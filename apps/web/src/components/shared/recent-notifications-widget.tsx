import React from 'react';
import Link from 'next/link';
import { useNotifications } from '@/hooks/use-notifications';
import { CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'APPROVAL_ALERT':
    case 'LEAVE_STATUS':
      return <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />;
    case 'SECURITY_ALERT':
      return <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />;
    case 'SYSTEM_ALERT':
    case 'ASSET_STATUS':
      return <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />;
    default:
      return <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />;
  }
};

const getNotificationLink = (type: string) => {
  switch (type) {
    case 'LEAVE_STATUS':
      return '/leaves';
    case 'ASSET_STATUS':
      return '/assets';
    case 'APPROVAL_ALERT':
      return '/tasks';
    default:
      return '/notifications';
  }
};

export const RecentNotificationsWidget = ({ maxItems }: { maxItems?: number }) => {
  const { notifications, isLoading, markAsRead } = useNotifications();

  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 flex items-center justify-center min-h-[200px]">
        <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  const displayNotifications = maxItems ? notifications.slice(0, maxItems) : notifications;

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-900">Recent notifications</h3>
        {notifications.length > 0 && (
          <Link href="/notifications" className="text-xs font-bold text-blue-600 hover:text-blue-700">View all</Link>
        )}
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto pr-2">
        {displayNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center h-full text-slate-500 py-8">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-3" />
            <p className="text-sm font-semibold">You're all caught up!</p>
            <p className="text-xs mt-1 text-slate-400">No new notifications</p>
          </div>
        ) : (
          displayNotifications.map((notif) => (
            <Link
              key={notif.id}
              href={getNotificationLink(notif.type)}
              onClick={() => {
                if (!notif.isRead) markAsRead(notif.id);
              }}
              className="flex items-start gap-4 group cursor-pointer"
            >
              {getNotificationIcon(notif.type)}
              <div>
                <p className={`text-sm ${notif.isRead ? 'font-medium text-slate-600' : 'font-bold text-slate-900'} group-hover:text-blue-600 transition-colors`}>
                  {notif.body || notif.title}
                </p>
                <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                  {notif.createdAt && !isNaN(new Date(notif.createdAt).getTime())
                    ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })
                    : 'Recently'}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};
