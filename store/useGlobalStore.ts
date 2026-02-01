import { axios_no_auth } from '@/global/config/axios.config';
import { API_ENDPOINTS } from '@/global/endpoints/api-endpoints';
import { createSelectors } from '@/global/utils/auto-selectors';
import { create } from 'zustand';

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
    console.log('🔍 Starting version check...');
    set({ isLoadingVersion: true });
    try {
      console.log('📡 Calling API:', API_ENDPOINTS.app.getVersionInfo);
      // ✅ Simple POST request (no body needed)
      const response = await axios_no_auth.post(API_ENDPOINTS.app.getVersionInfo);
      
      console.log('📦 Version check response:', JSON.stringify(response.data, null, 2));
      
      if (response?.data && response?.data?.status === 200) {
        console.log('✅ Version info received:', response.data.data);
        set({ appVersion: response.data.data });
      } else {
        console.log('⚠️ Unexpected response format:', response?.data);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || error;
      console.error('❌ Version check error:', errorMessage);
      console.error('❌ Full error:', error);
      // Don't show toast for version check failures
      // Don't block the app if version check fails
      set({ appVersion: null });
    } finally {
      set({ isLoadingVersion: false });
      console.log('🏁 Version check completed');
    }
  },
}));

export const useGlobalStore = createSelectors(useGlobalStoreBase);