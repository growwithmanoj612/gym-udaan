import { INotificationDetails } from '@/global/interfaces';

export interface INotificationStore {
  // State
  notifications: INotificationDetails[];
  unreadCount: number;
  isLoading: boolean;

  // Actions
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId:  string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  getUnreadCount: () => Promise<void>;
  deleteNotification: (notificationId:  string) => Promise<void>;
}