import { IMemberShipDetails } from '@/global/interfaces';

export interface IMembershipStore {
  // State
  currentMembership: IMemberShipDetails | null;
  membershipHistory: IMemberShipDetails[];
  credits: number;
  isLoading: boolean;

  // Actions
  fetchCurrentMembership: () => Promise<void>;
  fetchMembershipHistory: () => Promise<void>;
  fetchCredits: () => Promise<void>;
  renewMembership:  (planId: string) => Promise<void>;
}