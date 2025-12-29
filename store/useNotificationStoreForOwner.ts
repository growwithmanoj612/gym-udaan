import { create } from 'zustand'; 
import { INotificationDetails } from '@/global/interfaces';
import { axios_auth } from '@/global/config/axios.config';
import { API_ENDPOINTS } from '@/global/endpoints/api-endpoints';
import { createSelectors } from '@/global/utils/auto-selectors';
import { toast } from '@/providers/toast-provider';
import { PaginationPeriodReq } from '@/global/enums';

export interface INotificationStore {
  // State
  notifications: INotificationDetails[];
  dietPlans: INotificationDetails[];
  unreadNotifications: INotificationDetails[];
  unreadCount: number;
  isLoading: boolean;

 
   fetchPaginated: () => Promise<void>;
   
  markAsRead: (id:  number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  getUnreadCount: () => Promise<void>;  


  paginationPeriodReq: PaginationPeriodReq
  setPaginationPeriodReq: (period: PaginationPeriodReq) => void;
}

const useNotificationStoreBaseOwner = create<INotificationStore>((set, get) => ({
  // State
  notifications: [],
  dietPlans: [],
  unreadNotifications: [],
  unreadCount: 0,
  isLoading: false,
  paginationPeriodReq: PaginationPeriodReq.RECENT_10_DATA,
   

    fetchPaginated: async () => {
    set({ isLoading: true });
    try {
      const response = await axios_auth.get(API_ENDPOINTS.notificationsOwner.getPageinated(get().paginationPeriodReq));
      
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

  markAsRead: async (id: number) => {
    try {
      const response = await axios_auth.put(API_ENDPOINTS.notificationsOwner. markAsRead(id));
      
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
      const response = await axios_auth. put(API_ENDPOINTS.notificationsOwner.markAllAsRead);
      
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
      const response = await axios_auth.get(API_ENDPOINTS.notificationsOwner.getUnreadCount);
      
      if (response?.data && response?.status === 200) {
        set({ unreadCount: response?.data?.data });
      }
    } catch (error: any) {
      console.error('Failed to fetch unread count:', error);
    }
  },

 
  setPaginationPeriodReq: (period: PaginationPeriodReq) => {
    set({ paginationPeriodReq: period });
  },
   
}));

export const useNotificationStoreOwner= createSelectors(useNotificationStoreBaseOwner);