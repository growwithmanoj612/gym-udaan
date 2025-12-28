import { IBusinessDetails } from "@/global/interfaces";

 

export interface IGymStore {
  // State
  gyms: IBusinessDetails[];
  selectedGym: IBusinessDetails | null;
  isLoading: boolean;

  // Actions
  fetchGyms: () => Promise<void>;
  getGymById: (gymId:  string) => Promise<void>;
  setSelectedGym: (gym: IBusinessDetails) => void;
  searchGyms: (keyword: string) => Promise<void>;
}