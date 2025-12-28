import { IMemberDetails } from '@/global/interfaces';

export interface IMemberStore {
  // State
  memberProfile: IMemberDetails | null;
  isLoading: boolean;
  isUpdating: boolean;

  // Actions
  fetchMemberProfile: () => Promise<void>;
  updateMemberProfile: (data: Partial<IMemberDetails>) => Promise<void>;
  uploadProfileImage: (uri: string) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
}