import { create } from 'zustand'; 
import { INotificationDetails } from '@/global/interfaces';
import { axios_auth } from '@/global/config/axios.config';
import { API_ENDPOINTS } from '@/global/endpoints/api-endpoints';
import { createSelectors } from '@/global/utils/auto-selectors';
import { toast } from '@/providers/toast-provider';

export interface INotificationStore {
  // State
  notifications: INotificationDetails[];
  dietPlans: INotificationDetails[];
  unreadNotifications: INotificationDetails[];
  unreadCount: number;
  isLoading: boolean;

  // Actions
  fetchAll: () => Promise<void>;
  fetchPaginated: () => Promise<void>;
  fetchUnread: () => Promise<void>;
  markAsRead: (id:  number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  getUnreadCount: () => Promise<void>; 
  getDietPlansNoti: () => Promise<void>;
}

const useNotificationStoreBase = create<INotificationStore>((set, get) => ({
  // State
  notifications: [],
  dietPlans: [],
  unreadNotifications: [],
  unreadCount: 0,
  isLoading: false,

  // Actions
  fetchAll: async () => {
    set({ isLoading: true });
    try {
      const response = await axios_auth.get(API_ENDPOINTS.notifications.getAll);
      
      if (response?.data && response?. status === 200) {
        const notifications = response?.data?.data;
        // const unreadCount = notifications.filter((n:  INotificationDetails) => !n.isRead).length;
        
        set({
          notifications,
          // unreadCount,
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch notifications';
      toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  fetchPaginated: async () => {
    set({ isLoading: true });
    try {
      const response = await axios_auth.get(API_ENDPOINTS.notifications.getPageinated);
      
      if (response?.data && response?. status === 200) {
        const notifications = response?.data?.data;
        // const unreadCount = notifications.filter((n:  INotificationDetails) => !n.isRead).length;
        
        set({
          notifications,
          // unreadCount,
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch notifications';
      toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUnread:  async () => {
    set({ isLoading: true });
    try {
      const response = await axios_auth.get(API_ENDPOINTS.notifications.getUnread);
      
      if (response?.data && response?.status === 200) {
        set({
          unreadNotifications:  response?.data?.data,
          // unreadCount: response?.data?.data.length,
        });
      }
    } catch (error: any) {
      const errorMessage = error. response?.data?.message || 'Failed to fetch unread notifications';
      toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  markAsRead: async (id: number) => {
    try {
      const response = await axios_auth.put(API_ENDPOINTS.notifications. markAsRead(id));
      
      if (response?.status === 200) {
        const updatedNotifications = get().notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        );
        
        // const unreadCount = updatedNotifications.filter((n) => !n.isRead).length;
        
        //deduct 1 from unread count
        set({
          notifications: updatedNotifications,
          unreadCount: get().unreadCount - 1,
          // unreadCount,
        });
      }
    } catch (error:  any) {
      const errorMessage = error.response?.data?.message || 'Failed to mark as read';
      toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      });
      throw error;
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await axios_auth. put(API_ENDPOINTS.notifications.markAllAsRead);
      
      if (response?.status === 200) {
        const updatedNotifications = get().notifications.map((n) => ({
          ...n,
          isRead: true,
        }));
        
        set({
          notifications: updatedNotifications,
          unreadCount: 0,
        });
        
        toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'All notifications marked as read',
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?. data?.message || 'Failed to mark all as read';
      toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      });
      throw error;
    }
  },

  getUnreadCount: async () => {
    try {
      const response = await axios_auth.get(API_ENDPOINTS.notifications.getUnreadCount);
      
      if (response?.data && response?.status === 200) {
        set({ unreadCount: response?.data?.data });
      }
    } catch (error: any) {
      console.error('Failed to fetch unread count:', error);
    }
  },
  getDietPlansNoti: async () => {
    try {
      const response = await axios_auth.get(API_ENDPOINTS.notifications.getDietPlansNoti);
      
      if (response?.data && response?.status === 200) {
        set({ dietPlans: response?.data?.data });
      }
    } catch (error: any) {
      console.error('Failed to fetch diet plans notifications:', error);
    }
  },
     
 

   
}));

export const useNotificationStore = createSelectors(useNotificationStoreBase);