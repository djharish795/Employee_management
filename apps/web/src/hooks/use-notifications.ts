import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead, NotificationRecord } from "@/lib/api/notifications";
import io, { Socket } from "socket.io-client";

let socket: Socket | null = null;

export function useNotifications() {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.accessToken);

  // Fetch notifications initially
  const { data: notifications = [], isLoading } = useQuery<NotificationRecord[]>({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    enabled: !!token,
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Initialize WebSockets for realtime badge updates
  useEffect(() => {
    if (!token) return;

    if (!socket) {
      socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/notifications", {
        auth: { token },
        transports: ["websocket"],
      });

      socket.on("connect", () => {
        console.log("Connected to Real-time Notifications Gateway");
      });

      socket.on("new_notification", (notification: NotificationRecord) => {
        queryClient.setQueryData<NotificationRecord[]>(["notifications"], (old = []) => {
          return [notification, ...old];
        });
      });
    }

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, [token, queryClient]);

  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: (_, id) => {
      queryClient.setQueryData<NotificationRecord[]>(["notifications"], (old = []) => 
        old.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.setQueryData<NotificationRecord[]>(["notifications"], (old = []) => 
        old.map(n => ({ ...n, isRead: true }))
      );
    }
  });

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead: (id: string) => markAsReadMutation.mutate(id),
    markAllAsRead: () => markAllAsReadMutation.mutate(),
  };
}
