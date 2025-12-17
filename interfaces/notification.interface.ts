import { INotification } from '@/global/interfaces';

export interface INotificationStore {
  // State
  notifications: INotification[];
  unreadCount: number;
  isLoading: boolean;

  // Actions
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId:  string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  getUnreadCount: () => Promise<void>;
  deleteNotification: (notificationId:  string) => Promise<void>;
}