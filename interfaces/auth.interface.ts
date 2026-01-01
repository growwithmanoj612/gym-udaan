import { AppUserRoles } from '@/global/enums';
import { IAppUserMemberDetails, ILoginRequest, ILoginResponse } from '@/global/interfaces';

export interface IAuthStore {
  // State
  appUser: IAppUserMemberDetails | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
  selectedTenantId: string | null;
  selectedTenantName: string | null;
  token: string | null;
  isOffline : boolean



  // Actions
  setAppUser: (user: IAppUserMemberDetails) => void;
  clearAppUser: () => void;
  login: (credentials: ILoginRequest) => Promise<AppUserRoles|null>;
  logout: () => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>
  checkAuth: () => Promise<void>;
  completeOnboarding: () => void;
  selectTenant: (tenantId:  string) => void;
  selectTenantName: (tenantName:  string) => void;
  clearSelectTenant: () => void;
  
  // Token management
  setToken: (token: string) => Promise<void>;
  getToken:  () => Promise<string | null>;
  removeToken: () => Promise<void>;
   loadPersistedState: () => Promise<void>
}