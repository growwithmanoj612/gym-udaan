import { create } from "zustand";
// Note: Zustand persist is optional - start simple first
// import { persist, createJSONStorage } from "zustand/middleware";
// import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  hasSelectedTenant: boolean;
  selectedTenant: string | null;
  user: any | null;

  // Actions
  completeOnboarding: () => void;
  selectTenant: (tenantId: string) => void;
  login: (user: any) => void;
  logout: () => void;
  initialize: () => Promise<void>;
}

export const useAuth = create<AuthState>()((set) => ({
  isLoading: false,
  isAuthenticated: false,
  hasCompletedOnboarding: false,
  hasSelectedTenant: false,
  selectedTenant: null,
  user: null,

  completeOnboarding: () => {
    set({ hasCompletedOnboarding: true });
  },

  selectTenant: (tenantId: string) => {
    set({
      hasSelectedTenant: true,
      selectedTenant: tenantId,
    });
  },

  login: (user: any) => {
    set({
      isAuthenticated: true,
      user,
    });
  },

  logout: () => {
    set({
      isAuthenticated: false,
      user: null,
      hasSelectedTenant: false,
      selectedTenant: null,
    });
  },

  initialize: async () => {
    set({ isLoading: false });
  },
}));
