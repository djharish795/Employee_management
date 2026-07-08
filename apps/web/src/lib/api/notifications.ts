import { apiClient } from "./client";

export interface NotificationRecord {
  id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  recipientId: string;
}

export const fetchNotifications = async (): Promise<NotificationRecord[]> => {
  const { data } = await apiClient.get("/notifications");
  return data;
};

export const markNotificationAsRead = async (id: string): Promise<any> => {
  const { data } = await apiClient.patch(`/notifications/${id}/read`);
  return data;
};

export const markAllNotificationsAsRead = async (): Promise<any> => {
  const { data } = await apiClient.patch("/notifications/read-all");
  return data;
};
