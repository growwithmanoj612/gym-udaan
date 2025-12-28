import { create } from 'zustand'; 
import { IAttendanceDetails, IAttendanceStats } from '@/global/interfaces';
import { axios_auth } from '@/global/config/axios.config';
import { API_ENDPOINTS } from '@/global/endpoints/api-endpoints';
import { createSelectors } from '@/global/utils/auto-selectors';
import { toast } from '@/providers/toast-provider';

interface IAttendanceStore {
  // State
  attendances: IAttendanceDetails[];
  currentCheckIn: IAttendanceDetails | null;
  isLoading: boolean;
  stats: IAttendanceStats | null;
  isCheckedIn: boolean;

  // Actions
  search: (yearMonth:string) => Promise<void>;
 
}

const useAttendanceStoreBase = create<IAttendanceStore>((set, get) => ({
  // State
  attendances: [],
  currentCheckIn: null,
  isLoading: false,
  stats: null,
  isCheckedIn: false,

  // Actions
  search: async (yearMonth:string) => {
    set({ isLoading: true });
    try {
      const response = await axios_auth.get(API_ENDPOINTS.attendance.search(yearMonth));

      if (response?.data && response?.status === 200) {
        const serverData=response?.data?.data
        // update the stats
        set({ attendances: serverData });
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

   
 

   
  
}));

export const useAttendanceStore = createSelectors(useAttendanceStoreBase);