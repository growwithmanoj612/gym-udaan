import { IAppUserMemberDetails, ILoginRequest } from '@/global/interfaces';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import axios_auth, { tokenManager } from '@/global/config/axios.config';
import { API_ENDPOINTS } from '@/global/endpoints/api-endpoints';
import { createSelectors } from '@/global/utils/auto-selectors';
import { IAuthStore } from '@/interfaces/auth.interface';
import { toast } from '@/providers/toast-provider';

export const ONBOARDING_KEY = '@gym_udaan_onboarding';
export const TENANT_KEY = '@gym_udaan_tenant';
export const TENANT_NAME_KEY = '@gym_udaan_tenant_name';
export const APP_USER_KEY = '@gym_udaan_app_user';  // New key for persisting appUser

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
  selectedTenantName: null,
  token: null,
  isOffline: false,  // Added isOffline to state

  // Actions

  setAppUser: async (user: IAppUserMemberDetails) => {
    set({ appUser: user, isAuthenticated: true });
    await AsyncStorage.setItem(APP_USER_KEY, JSON.stringify(user));  // Persist user
  },

  clearAppUser: async () => {
    set({ appUser: null, isAuthenticated: false, token: null });
    await AsyncStorage.removeItem(APP_USER_KEY);  // Clear persisted user
  },

  login: async (credentials: ILoginRequest) => {
    set({ isLoading: true });
    try {
      const response = await axios_auth.post(API_ENDPOINTS.auth.login, credentials);

      if (response?.data && response?.status === 200) {
        const { token, refreshToken, appUser } = response.data.data;

        // Save tokens using tokenManager
        await tokenManager.setTokens(token, refreshToken);

        // Set and persist user state
        await get().setAppUser(appUser);  // Use setAppUser to persist
        set({ token, isAuthenticated: true });

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
        return;
      }
      toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to change password.',
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to change password.';
      toast.show({
        type: 'error',
        text1: 'Error',
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
      // Clear local state and storage regardless of API call
      await get().clearAppUser();  // Clears persisted user
      await tokenManager.removeTokens();  // Remove tokens

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
    let storedUser: string | null = null;  // Declare storedUser here for scope
    try {
      const token = await tokenManager.getAccessToken();

      if (!token) {
        await get().clearAppUser();
        set({ isAuthenticated: false, isLoading: false, isOffline: false });
        return;
      }

      // Load stored user immediately for fast UI
      storedUser = await AsyncStorage.getItem(APP_USER_KEY);
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          set({ appUser: parsedUser, isAuthenticated: true, isOffline: false });
        } catch (e) {
          console.error('Failed to parse stored user:', e);
          await AsyncStorage.removeItem(APP_USER_KEY);
        }
      }

      // Validate with backend
      const response = await axios_auth.get(API_ENDPOINTS.auth.check(token, (get().selectedTenantId || "0")));

      if (response?.data && response?.status === 200) {
        const { token: newToken, refreshToken: newRefreshToken, appUser } = response.data.data;
        await tokenManager.setAccessToken(newToken);
        await get().setAppUser(appUser);
        set({ token: newToken, isAuthenticated: true, isOffline: false });
      } else {
        // Auth failure (e.g., invalid token) - force logout
        await get().clearAppUser();
        await tokenManager.removeTokens();
        set({ isAuthenticated: false, appUser: null, token: null, isOffline: false });
      }
    } catch (error: any) {
      console.error('Auth check failed:', error);
      
      // Check if it's a network error (no response or timeout)
      const isNetworkError = !error.response || error.code === 'NETWORK_ERROR' || error.message.includes('Network request failed');
      
      if (isNetworkError && storedUser) {
        // Keep user signed in offline
        set({ isAuthenticated: true, isOffline: true });
        toast.show({
          type: 'info',
          text1: 'Offline Mode',
          text2: 'You are offline. Some features may be limited.',
        });
      } else {



const errorMessage = error.response?.data?.message || 'Authentication failed.';
      toast.show({
        type: 'error',
        text1: 'Authentication Failed',
        text2: errorMessage,
      });

        // Auth or other error - force logout
        await get().clearAppUser();
        await tokenManager.removeTokens();
        set({ isAuthenticated: false, appUser: null, token: null, isOffline: false });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  loadPersistedState: async () => {
    const onboarding = await AsyncStorage.getItem(ONBOARDING_KEY);
    const tenant = await AsyncStorage.getItem(TENANT_KEY);
    const tenantName = await AsyncStorage.getItem(TENANT_NAME_KEY);
    set({
      hasCompletedOnboarding: onboarding === 'true',
      selectedTenantId: tenant,
      selectedTenantName: tenantName
    });
  },

  completeOnboarding: async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    set({ hasCompletedOnboarding: true });
  },

  selectTenant: async (tenantId: string) => {
    await AsyncStorage.setItem(TENANT_KEY, tenantId);
    set({ selectedTenantId: tenantId });
  },
  selectTenantName: async (tenantName: string) => {
    await AsyncStorage.setItem(TENANT_NAME_KEY, tenantName);
    set({ selectedTenantName: tenantName });
  },

  setToken: async (token: string) => {
    await tokenManager.setAccessToken(token);
    set({ token });
  },

  getToken: async () => {
    return await tokenManager.getAccessToken();
  },

  removeToken: async () => {
    await tokenManager.removeTokens();
    set({ token: null });
  },
  clearSelectTenant: async () => {
    await AsyncStorage.removeItem(ONBOARDING_KEY)
 
    set({hasCompletedOnboarding:false });
  }
}));

export const useAuthStore = createSelectors(useAuthStoreBase);



// import { IAppUserMemberDetails, ILoginRequest } from '@/global/interfaces';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { create } from 'zustand';

// import axios_auth, { tokenManager } from '@/global/config/axios.config';
// import { API_ENDPOINTS } from '@/global/endpoints/api-endpoints';
// import { createSelectors } from '@/global/utils/auto-selectors';
// import { IAuthStore } from '@/interfaces/auth.interface';
// import { toast } from '@/providers/toast-provider';

// const ONBOARDING_KEY = '@gym_udaan_onboarding';
// export const TENANT_KEY = '@gym_udaan_tenant';

// const defaultAppUser: IAppUserMemberDetails = {
//   id: 0,
//   fullName: '',
//   phone: '',
//   address: '',
//   appUserRole: null,
//   businessDetailsId: 0,
// };

// const useAuthStoreBase = create<IAuthStore>((set, get) => ({
//   // State
//   appUser: null,
//   isAuthenticated: false,
//   isLoading: false,
//   hasCompletedOnboarding: false,
//   selectedTenantId: null,
//   token: null,

//   // Actions

//   setAppUser: (user: IAppUserMemberDetails) => {
//     set({ appUser: user, isAuthenticated: true });
//   },

//   clearAppUser: () => {
//     set({ appUser: null, isAuthenticated: false, token: null });
//   },

//   login: async (credentials: ILoginRequest) => {
//     set({ isLoading: true });
//     try {
//       const response = await axios_auth.post(API_ENDPOINTS.auth.login, credentials);

//       if (response?.data && response?.status === 200) {
//         const { token, refreshToken, appUser } = response.data.data;

//         // Save tokens using tokenManager
//         await tokenManager.setTokens(token, refreshToken);

//         // Set user state
//         set({
//           appUser: appUser,
//           token,
//           isAuthenticated: true,
//         });

//         toast.show({
//           type: 'success',
//           text1: 'Login Successful',
//           text2: `Welcome back, ${appUser?.fullName}!`,
//         });

//         return appUser?.appUserRole;
//       }
//       return null;
//     } catch (error: any) {
//       const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
//       toast.show({
//         type: 'error',
//         text1: 'Login Failed',
//         text2: errorMessage,
//       });
//       return null;
//     } finally {
//       set({ isLoading: false });
//     }
//   },
//   changePassword: async (oldPassword: string, newPassword: string) => {
//     try {
//       const res = await axios_auth.post(
//         `auth/change-password`,
//         { oldPassword, newPassword }
//       );

//       if (res?.data?.status === 200) {

//         toast.show({
//           type: 'success',
//           text1: res?.data?.message,
//           text2: 'Your password has been changed successfully.',
//         });
//         return
//       }
//       toast.show({
//         type: 'error',
//         text1: 'Error',
//         text2: 'Failed to change password.',
//       });

//     } catch (error: any) {
//       const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
//       toast.show({
//         type: 'error',
//         text1: 'Login Failed',
//         text2: errorMessage,
//       });
//     }

//   },

//   logout: async () => {
//     set({ isLoading: true });
//     try {
//       await axios_auth.post(API_ENDPOINTS.auth.logout);
//     } catch (error) {
//       console.error('Logout error:', error);
//     } finally {
//       // Clear local state regardless of API call
//       await tokenManager.removeTokens(); // Remove both tokens (access & refresh)
//       set({
//         appUser: null,
//         isAuthenticated: false,
//         token: null,
//       });

//       toast.show({
//         type: 'info',
//         text1: 'Logged Out',
//         text2: 'You have been logged out successfully.',
//       });

//       set({ isLoading: false });
//     }
//   },

//   checkAuth: async () => {
//     set({ isLoading: true });
//     try {
//       const token = await tokenManager.getAccessToken(); // Use tokenManager to get the access token

//       if (!token) {
//         set({ isAuthenticated: false, isLoading: false });
//         return;
//       }

//       const response = await axios_auth.get(API_ENDPOINTS.auth.check(token));

//       if (response?.data && response?.status === 200) {
//         const { token, refreshToken, appUser } = response.data.data;

//         await tokenManager.setAccessToken(token); // Update access token
//         set({
//           appUser: appUser,
//           token,
//           isAuthenticated: true,
//         });
//       }
//       else {
//         await tokenManager.removeTokens(); // Clear tokens if auth check fails
//         set({ isAuthenticated: false, appUser: null, token: null });
//       }
//     } catch (error) {
//       console.error('Auth check failed:', error);
//       await tokenManager.removeTokens(); // Clear tokens if auth check fails
//       set({ isAuthenticated: false, appUser: null, token: null });
//     } finally {
//       set({ isLoading: false });
//     }
//   },

//   completeOnboarding: async () => {
//     await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
//     set({ hasCompletedOnboarding: true });
//   },

//   selectTenant: async (tenantId: string) => {
//     await AsyncStorage.setItem(TENANT_KEY, tenantId);
//     set({ selectedTenantId: tenantId });
//   },

//   setToken: async (token: string) => {
//     await tokenManager.setAccessToken(token); // Use setAccessToken to store access token
//     set({ token });
//   },

//   getToken: async () => {
//     return await tokenManager.getAccessToken(); // Use getAccessToken to retrieve access token
//   },

//   removeToken: async () => {
//     await tokenManager.removeTokens(); // Use removeTokens to clear both access and refresh tokens
//     set({ token: null });
//   },
// }));

// export const useAuthStore = createSelectors(useAuthStoreBase);