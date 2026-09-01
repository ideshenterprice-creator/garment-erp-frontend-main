import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api";

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  metadata: { href?: string; entityId?: string; [key: string]: unknown } | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsList {
  data: AppNotification[];
  total: number;
  page: number;
  limit: number;
  unreadCount: number;
}

export async function getNotifications(params?: {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
  type?: string;
}): Promise<ApiResponse<NotificationsList>> {
  const response = await api.get<ApiResponse<NotificationsList>>("/notifications", {
    params: {
      ...params,
      unreadOnly: params?.unreadOnly ? "true" : undefined,
    },
  });
  return response.data;
}

export async function getUnreadCount(): Promise<ApiResponse<{ unreadCount: number }>> {
  const response = await api.get<ApiResponse<{ unreadCount: number }>>(
    "/notifications/unread-count"
  );
  return response.data;
}

export async function markNotificationRead(
  id: string
): Promise<ApiResponse<AppNotification>> {
  const response = await api.patch<ApiResponse<AppNotification>>(
    `/notifications/${id}/read`
  );
  return response.data;
}

export async function markAllNotificationsRead(): Promise<
  ApiResponse<{ updated: number }>
> {
  const response = await api.patch<ApiResponse<{ updated: number }>>(
    "/notifications/read-all"
  );
  return response.data;
}

export async function deleteNotification(
  id: string
): Promise<ApiResponse<{ message: string }>> {
  const response = await api.delete<ApiResponse<{ message: string }>>(
    `/notifications/${id}`
  );
  return response.data;
}
