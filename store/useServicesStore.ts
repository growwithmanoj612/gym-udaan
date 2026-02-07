import { axios_auth } from '@/global/config/axios.config';
import { API_ENDPOINTS } from '@/global/endpoints/api-endpoints';
import { IItemDetails, IPlansDetails } from '@/global/interfaces';
import { createSelectors } from '@/global/utils/auto-selectors';
import { toast } from '@/providers/toast-provider';
import { create } from 'zustand';

 


// ==================== STORE INTERFACE ====================
export interface IServicesStore {
  // State
  gymPlans: IPlansDetails[];
  gymItems: IItemDetails[];
  isLoadingPlans: boolean;
  isLoadingItems: boolean;

  // Actions
  fetchGymPlans: () => Promise<void>;
  fetchGymItems: () => Promise<void>;
  fetchAll: () => Promise<void>;
}

// ==================== STORE ====================
const useServicesStoreBase = create<IServicesStore>((set, get) => ({
  // Initial State
  gymPlans: [],
  gymItems: [],
  isLoadingPlans: false,
  isLoadingItems: false,

  // Fetch Gym Plans
  fetchGymPlans: async () => {
    set({ isLoadingPlans: true });
    try {
      const response = await axios_auth.get(API_ENDPOINTS.plans.getAll);
      
      if (response?.data && response?.status === 200) {
        const plans = response?.data?.data || [];
        set({ gymPlans: plans });
        return;
      }
      
      set({ gymPlans: [] });
    } catch (error: any) {
      console.error('Failed to fetch gym plans:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch gym plans';
      toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      });
      set({ gymPlans: [] });
    } finally {
      set({ isLoadingPlans: false });
    }
  },

  // Fetch Gym Items
  fetchGymItems: async () => {
    set({ isLoadingItems: true });
    try {
      const response = await axios_auth.get(API_ENDPOINTS.items.getAll);
      
      if (response?.data && response?.status === 200) {
        const items = response?.data?.data || [];
        set({ gymItems: items });
        return;
      }
      
      set({ gymItems: [] });
    } catch (error: any) {
      console.error('Failed to fetch gym items:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch gym items';
      toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      });
      set({ gymItems: [] });
    } finally {
      set({ isLoadingItems: false });
    }
  },

  // Fetch All (Plans + Items)
  fetchAll: async () => {
    await Promise.all([
      get().fetchGymPlans(),
      get().fetchGymItems(),
    ]);
  },
}));

export const useServicesStore = createSelectors(useServicesStoreBase);
