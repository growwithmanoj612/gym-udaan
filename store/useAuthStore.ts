import { IAppUserMemberDetails, ILoginRequest } from '@/global/interfaces';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import axios_auth, { tokenManager } from '@/global/config/axios.config';
import { API_ENDPOINTS } from '@/global/endpoints/api-endpoints';
import { createSelectors } from '@/global/utils/auto-selectors';
import { IAuthStore } from '@/interfaces/auth.interface';
import { toast } from '@/providers/toast-provider';

const ONBOARDING_KEY = '@gym_udaan_onboarding';
export const TENANT_KEY = '@gym_udaan_tenant';

const defaultAppUser: IAppUserMemberDetails = {
  id: 0,
  fullName: '',
  phone: '',
  address: '',
  appUserRole: null,
  businessDetailsId: 0,
};

const useAuthStoreBase = create<IAuthStore>((set, get) => ({
  // State
  appUser: null,
  isAuthenticated: false,
  isLoading: false,
  hasCompletedOnboarding: false,
  selectedTenantId: null,
  token: null,

  // Actions

  setAppUser: (user: IAppUserMemberDetails) => {
    set({ appUser: user, isAuthenticated: true });
  },

  clearAppUser: () => {
    set({ appUser: null, isAuthenticated: false, token: null });
  },

  login: async (credentials: ILoginRequest) => {
    set({ isLoading: true });
    try {
      const response = await axios_auth.post(API_ENDPOINTS.auth.login, credentials);

      if (response?.data && response?.status === 200) {
        const { token, refreshToken, appUser } = response.data.data;

        // Save tokens using tokenManager
        await tokenManager.setTokens(token, refreshToken);

        // Set user state
        set({
          appUser: appUser,
          token,
          isAuthenticated: true,
        });

        toast.show({
          type: 'success',
          text1: 'Login Successful',
          text2: `Welcome back, ${appUser?.fullName}!`,
        });

        return appUser?.appUserRole;
      }
      return null;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: errorMessage,
      });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },
  changePassword: async (oldPassword: string, newPassword: string) => {
    try {
      const res = await axios_auth.post(
        `auth/change-password`,
        { oldPassword, newPassword }
      );

      if (res?.data?.status === 200) {

        toast.show({
          type: 'success',
          text1: res?.data?.message,
          text2: 'Your password has been changed successfully.',
        });
        return
      }
      toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to change password.',
      });

    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: errorMessage,
      });
    }

  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await axios_auth.post(API_ENDPOINTS.auth.logout);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state regardless of API call
      await tokenManager.removeTokens(); // Remove both tokens (access & refresh)
      set({
        appUser: null,
        isAuthenticated: false,
        token: null,
      });

      toast.show({
        type: 'info',
        text1: 'Logged Out',
        text2: 'You have been logged out successfully.',
      });

      set({ isLoading: false });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const token = await tokenManager.getAccessToken(); // Use tokenManager to get the access token

      if (!token) {
        set({ isAuthenticated: false, isLoading: false });
        return;
      }

      const response = await axios_auth.get(API_ENDPOINTS.auth.check(token));

      if (response?.data && response?.status === 200) {
        const { token, refreshToken, appUser } = response.data.data;

        await tokenManager.setAccessToken(token); // Update access token
        set({
          appUser: appUser,
          token,
          isAuthenticated: true,
        });
      }
      else {
        await tokenManager.removeTokens(); // Clear tokens if auth check fails
        set({ isAuthenticated: false, appUser: null, token: null });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      await tokenManager.removeTokens(); // Clear tokens if auth check fails
      set({ isAuthenticated: false, appUser: null, token: null });
    } finally {
      set({ isLoading: false });
    }
  },

  completeOnboarding: async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    set({ hasCompletedOnboarding: true });
  },

  selectTenant: async (tenantId: string) => {
    await AsyncStorage.setItem(TENANT_KEY, tenantId);
    set({ selectedTenantId: tenantId });
  },

  setToken: async (token: string) => {
    await tokenManager.setAccessToken(token); // Use setAccessToken to store access token
    set({ token });
  },

  getToken: async () => {
    return await tokenManager.getAccessToken(); // Use getAccessToken to retrieve access token
  },

  removeToken: async () => {
    await tokenManager.removeTokens(); // Use removeTokens to clear both access and refresh tokens
    set({ token: null });
  },
}));

export const useAuthStore = createSelectors(useAuthStoreBase);