import { create } from 'zustand'; 
import {  IBiometricsDetails } from '@/global/interfaces';
import { axios_auth } from '@/global/config/axios.config';
import { API_ENDPOINTS } from '@/global/endpoints/api-endpoints';
import { createSelectors } from '@/global/utils/auto-selectors';
import { toast } from '@/providers/toast-provider';

export interface IBiometricStore {
  // State
    biometrics: IBiometricsDetails[];
  getBiometrics: () => Promise<void>;

  doorUnlock: (deviceSN: string) => void;
 
}

const useBiometricStoreBase = create<IBiometricStore>((set, get) => ({
   biometrics: [],
  getBiometrics: async () => {
    try {
      const res = await axios_auth.get(API_ENDPOINTS.biometric.getAll);
      if (res?.data?.status === 200) {
        set({ biometrics: res?.data?.data });
      } else {
        set({ biometrics: [] });
      }
    } catch (error: any) {
      set({ biometrics: [] });
      console.log(error);
    }
  },

  //unlock door
  doorUnlock: async (deviceSN: string) => {
    try {
      const res = await axios_auth.post(
        API_ENDPOINTS.biometric.unlockDoor(deviceSN)
      );
      if (res?.data?.status >= 200 && res?.data?.status < 300) {

    toast.show({
          type: 'success',
          text1: 'Unlock Successful',
          text2: res?.data?.message,
        });
 
      }
      
    } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Failed to unlock door';
      toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      });   }
  },

 

   
}));

export const useBiometricStore= createSelectors(useBiometricStoreBase);