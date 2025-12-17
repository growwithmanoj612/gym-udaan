import { IAttendanceDetails, IAttendanceStats } from '@/global/interfaces';

export interface IAttendanceStore {
  // State
  attendanceHistory: IAttendanceDetails[];
  currentCheckIn: IAttendanceDetails | null;
  isLoading: boolean;
  stats: IAttendanceStats | null;
  isCheckedIn: boolean;

  // Actions
  fetchAttendanceHistory: () => Promise<void>;
  checkIn: () => Promise<void>;
  checkOut: () => Promise<void>;
  getAttendanceStats: () => Promise<void>;
  getTodayAttendance: () => Promise<void>;
}