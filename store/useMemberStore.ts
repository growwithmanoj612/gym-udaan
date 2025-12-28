import { create } from 'zustand'; 
import { IMemberProfile } from '@/global/interfaces';
import { axios_auth, axios_auth_form } from '@/global/config/axios.config';
import { API_ENDPOINTS } from '@/global/endpoints/api-endpoints';
import { createSelectors } from '@/global/utils/auto-selectors';
import { toast } from '@/providers/toast-provider';
import { IMemberStore } from '@/interfaces/member.interface';

const useMemberStoreBase = create<IMemberStore>((set, get) => ({
  // State
  memberProfile: null,
  isLoading: false,
  isUpdating: false,

  // Actions
  fetchMemberProfile: async () => {
    set({ isLoading: true });
    try {
      const response = await axios_auth.get(API_ENDPOINTS.member.profile);
      
      if (response?. data && response?.status === 200) {
        set({ memberProfile: response.data. data });
      }
    } catch (error:  any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch profile';
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

  updateMemberProfile: async (data: Partial<IMemberProfile>) => {
    set({ isUpdating: true });
    try {
      const response = await axios_auth.put(API_ENDPOINTS.member. updateProfile, data);
      
      if (response?.data && response?. status === 200) {
        set({ memberProfile: response.data.data });
        
        toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Profile updated successfully',
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      toast. show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      });
      throw error;
    } finally {
      set({ isUpdating:  false });
    }
  },

  uploadProfileImage: async (uri: string) => {
    set({ isUpdating: true });
    try {
      const formData = new FormData();
      formData.append('profileImage', {
        uri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      } as any);

      const response = await axios_auth_form.post(
        API_ENDPOINTS.member.uploadImage,
        formData
      );

      if (response?. data && response?.status === 200) {
        const updatedProfile = response.data.data;
        set({ memberProfile: updatedProfile });
        
        toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Profile image updated successfully',
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?. message || 'Failed to upload image';
      toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      });
      throw error;
    } finally {
      set({ isUpdating: false });
    }
  },

  changePassword: async (oldPassword: string, newPassword: string) => {
    set({ isUpdating:  true });
    try {
      const response = await axios_auth. post(API_ENDPOINTS.member. changePassword, {
        oldPassword,
        newPassword,
      });

      if (response?.status === 200) {
        toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Password changed successfully',
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to change password';
      toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      });
      throw error;
    } finally {
      set({ isUpdating: false });
    }
  },
}));

export const useMemberStore = createSelectors(useMemberStoreBase);