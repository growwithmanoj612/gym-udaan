import { create } from 'zustand'; 
import { IBusinessDetails } from '@/global/interfaces';
import { axios_auth } from '@/global/config/axios.config';
import { API_ENDPOINTS } from '@/global/endpoints/api-endpoints';
import { createSelectors } from '@/global/utils/auto-selectors';
import { toast } from '@/providers/toast-provider';

export  interface IBusinessStore {
  // State
  businessDetails: IBusinessDetails [];
  isLoading: boolean;

  // Actions
  fetchBusinessDetails: () => Promise<void>;
}

const useBusinessStoreBase = create<IBusinessStore>((set) => ({
  // State
  businessDetails: [],
  isLoading: false,

  // Actions
  fetchBusinessDetails: async () => {
    set({ isLoading: true });
    try {
      const response = await axios_auth.get(API_ENDPOINTS.business.getAll);
      
      if (response?.data && response?.status === 200) {
        set({ businessDetails:  response.data.data });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch business details';
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

export const useBusinessStore = createSelectors(useBusinessStoreBase);