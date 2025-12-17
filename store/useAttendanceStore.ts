import { create } from 'zustand'; 
import { IAttendanceDetails, IAttendanceStats } from '@/global/interfaces';
import { axios_auth } from '@/global/config/axios.config';
import { API_ENDPOINTS } from '@/global/endpoints/api-endpoints';
import { createSelectors } from '@/global/utils/auto-selectors';
import { toast } from '@/providers/toast-provider';

interface IAttendanceStore {
  // State
  attendanceHistory: IAttendanceDetails[];
  currentCheckIn: IAttendanceDetails | null;
  isLoading: boolean;
  stats: IAttendanceStats | null;
  isCheckedIn: boolean;

  // Actions
  fetchAll: () => Promise<void>;
  fetchAttendanceHistory: () => Promise<void>;
  checkIn: () => Promise<void>;
  checkOut: () => Promise<void>;
  getAttendanceStats: () => Promise<void>;
  getTodayAttendance: () => Promise<void>;
}

const useAttendanceStoreBase = create<IAttendanceStore>((set, get) => ({
  // State
  attendanceHistory: [],
  currentCheckIn: null,
  isLoading: false,
  stats: null,
  isCheckedIn: false,

  // Actions
  fetchAll: async () => {
    set({ isLoading: true });
    try {
      const response = await axios_auth.get(API_ENDPOINTS. attendance.getAll);
      
      if (response?.data && response?. status === 200) {
        set({ attendanceHistory: response.data });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch attendance';
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

  fetchAttendanceHistory: async () => {
    set({ isLoading:  true });
    try {
      const response = await axios_auth. get(API_ENDPOINTS.attendance.getHistory);
      
      if (response?.data && response?. status === 200) {
        set({ attendanceHistory: response. data });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch attendance history';
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

  checkIn: async () => {
    set({ isLoading: true });
    try {
      const response = await axios_auth.post(API_ENDPOINTS.attendance.checkIn);
      
      if (response?.data && response?.status === 201) {
        const checkInData = response.data;
        set({
          currentCheckIn: checkInData,
          isCheckedIn: true,
        });
        
        toast.show({
          type: 'success',
          text1: 'Checked In',
          text2: 'You have successfully checked in! ',
        });
        
        await get().fetchAll();
      }
    } catch (error: any) {
      const errorMessage = error.response?. data?.message || 'Failed to check in';
      toast.show({
        type: 'error',
        text1: 'Check-in Failed',
        text2: errorMessage,
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  checkOut: async () => {
    set({ isLoading: true });
    try {
      const response = await axios_auth.post(API_ENDPOINTS.attendance. checkOut);
      
      if (response?.data && response?.status === 200) {
        set({
          currentCheckIn: null,
          isCheckedIn:  false,
        });
        
        toast.show({
          type: 'success',
          text1: 'Checked Out',
          text2: 'You have successfully checked out!',
        });
        
        await get().fetchAll();
      }
    } catch (error: any) {
      const errorMessage = error. response?.data?.message || 'Failed to check out';
      toast.show({
        type: 'error',
        text1: 'Check-out Failed',
        text2: errorMessage,
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  getAttendanceStats: async () => {
    set({ isLoading: true });
    try {
      const response = await axios_auth.get(API_ENDPOINTS.attendance.getStats);
      
      if (response?.data && response?.status === 200) {
        set({ stats: response.data });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch stats';
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

  getTodayAttendance: async () => {
    try {
      const response = await axios_auth.get(API_ENDPOINTS.attendance.getTodayAttendance);
      
      if (response?.data && response?.status === 200) {
        const todayAttendance = response. data;
        
        if (todayAttendance && ! todayAttendance.checkOutTime) {
          set({
            currentCheckIn: todayAttendance,
            isCheckedIn: true,
          });
        } else {
          set({
            currentCheckIn: null,
            isCheckedIn: false,
          });
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch today attendance:', error);
    }
  },
}));

export const useAttendanceStore = createSelectors(useAttendanceStoreBase);