import { IMembership } from '@/global/interfaces';

export interface IMembershipStore {
  // State
  currentMembership: IMembership | null;
  membershipHistory: IMembership[];
  credits: number;
  isLoading: boolean;

  // Actions
  fetchCurrentMembership: () => Promise<void>;
  fetchMembershipHistory: () => Promise<void>;
  fetchCredits: () => Promise<void>;
  renewMembership:  (planId: string) => Promise<void>;
}