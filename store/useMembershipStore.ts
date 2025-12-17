import { create } from 'zustand'; 
import { IMemberShipDetails } from '@/global/interfaces';
import { axios_auth } from '@/global/config/axios.config';
import { API_ENDPOINTS } from '@/global/endpoints/api-endpoints';
import { createSelectors } from '@/global/utils/auto-selectors';
import { toast } from '@/providers/toast-provider';

interface IMembershipStore {
  // State
  memberships: IMemberShipDetails[];
  currentMembership: IMemberShipDetails | null;
  membershipHistory: IMemberShipDetails[];
  isLoading: boolean;

  // Actions
  fetchAll:  () => Promise<void>;
  fetchCurrentMembership: () => Promise<void>;
  fetchMembershipHistory: () => Promise<void>;
  renewMembership: (planId: number) => Promise<void>;
}

const useMembershipStoreBase = create<IMembershipStore>((set, get) => ({
  // State
  memberships: [],
  currentMembership: null,
  membershipHistory: [],
  isLoading:  false,

  // Actions
  fetchAll: async () => {
    set({ isLoading: true });
    try {
      const response = await axios_auth.get(API_ENDPOINTS.membership. getAll);
      
      if (response?.data && response?.status === 200) {
        set({ memberships: response.data?.data });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch memberships';
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

  fetchCurrentMembership: async () => {
    set({ isLoading: true });
    try {
      const response = await axios_auth.get(API_ENDPOINTS.membership.getCurrent);
      
      if (response?.data && response?.status === 200) {
        set({ currentMembership: response.data?.data });
      }
    } catch (error:  any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch membership';
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

  fetchMembershipHistory: async () => {
    set({ isLoading: true });
    try {
      const response = await axios_auth.get(API_ENDPOINTS. membership.getHistory);
      
      if (response?.data && response?.status === 200) {
        set({ membershipHistory: response.data });
      }
    } catch (error: any) {
      const errorMessage = error. response?.data?.message || 'Failed to fetch membership history';
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

  renewMembership: async (planId: number) => {
    set({ isLoading: true });
    try {
      const response = await axios_auth.post(API_ENDPOINTS.membership.renew, { planId });
      
      if (response?.status === 200) {
        toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Membership renewed successfully',
        });
        
        await get().fetchCurrentMembership();
        await get().fetchMembershipHistory();
      }
    } catch (error: any) {
      const errorMessage = error.response?. data?.message || 'Failed to renew membership';
      toast. show({
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

export const useMembershipStore = createSelectors(useMembershipStoreBase);