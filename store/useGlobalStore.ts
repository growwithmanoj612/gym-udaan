import { create } from 'zustand';   
import { API_ENDPOINTS } from '@/global/endpoints/api-endpoints';
import { createSelectors } from '@/global/utils/auto-selectors';
import { toast } from '@/providers/toast-provider';
import * as Application from 'expo-application';
import { Platform } from 'react-native'; 
import axios_auth from '@/global/config/axios.config';

// ✅ Updated interface to match new backend response
export interface IVersionCheckResponse {
  latestIosVersion: string;
  latestAndroidVersion:  string;
  storeUrls: {
    ios: {
      webUrl: string;
      deepLink: string;
    };
    android: {
      webUrl: string;
      deepLink: string;
    };
  };
}

export interface IGlobalStore {
  // State
  appVersion: IVersionCheckResponse | null;
  isLoadingVersion: boolean;

  // Actions
  getAppVersion: () => Promise<void>;
}

const useGlobalStoreBase = create<IGlobalStore>((set) => ({
  // State
  appVersion: null,
  isLoadingVersion: false,

  // Actions
  getAppVersion: async () => {
    set({ isLoadingVersion: true });
    try {
      // ✅ Simple POST request (no body needed)
      const response = await axios_auth.post(API_ENDPOINTS.app. getVersionInfo);
      
      if (response?. data && response?. data?.status === 200) {
        set({ appVersion: response.data.data });
      }
    } catch (error:  any) {
      const errorMessage = error.response?.data?.message || error;
      console.error('Version check error:', errorMessage);
      // Don't show toast for version check failures
      // Don't block the app if version check fails
      set({ appVersion: null });
    } finally {
      set({ isLoadingVersion: false });
    }
  },
}));

export const useGlobalStore = createSelectors(useGlobalStoreBase);