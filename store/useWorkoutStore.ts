import axios_auth from '@/global/config/axios.config';
import { API_ENDPOINTS } from '@/global/endpoints/api-endpoints';
import {
  IAllWorkoutPlansRes,
  ICreateSubTitleReq,
  IMarkDoneReq,
  IOverrideReq,
  ITodayWorkoutItemRes,
  ITodayWorkoutRes,
  IUpdateSubTitleReq,
  IWeekProgressRes,
  IWorkOutPlanRes,
} from '@/interfaces/workout.interface';
import { create } from 'zustand';

interface WorkoutState {
  // ── Today ──────────────────────────────────────────────────────────────────
  today: ITodayWorkoutRes | null;
  isTodayLoading: boolean;
  todayError: string | null;

  // ── All Workout Plans ──────────────────────────────────────────────────────
  allPlans: IAllWorkoutPlansRes | null;
  rawPlans: IWorkOutPlanRes[] | null; // Raw backend response
  isAllPlansLoading: boolean;
  allPlansError: string | null;

  // ── Week Progress ──────────────────────────────────────────────────────────
  weekProgress: IWeekProgressRes | null;
  isWeekLoading: boolean;
  weekError: string | null;

  // ── Actions ────────────────────────────────────────────────────────────────
  fetchToday: () => Promise<void>;
  fetchAllPlans: () => Promise<void>;
  fetchWeekProgress: (start?: string) => Promise<void>;

  /** Optimistically toggles completion + calls API */
  markDone: (req: IMarkDoneReq) => Promise<void>;

  /** Sets a day override for an exercise */
  // setOverride: (req: IOverrideReq) => Promise<void>;

  // /** Resets (soft-deletes) override for a subtitle */
  // resetOverride: (subTitleId: number) => Promise<void>;
  
  /** Updates workout plan day */
  updatePlanDay: (planId: number, newDay: string) => Promise<void>;

  /** Updates subtitle details */
  updateSubTitle: (subTitleId: number, data: IUpdateSubTitleReq) => Promise<void>;

  /** Creates a new subtitle/exercise for a workout plan */
  createSubTitle: (data: ICreateSubTitleReq) => Promise<void>;

  clearErrors: () => void;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  // ── Initial State ──────────────────────────────────────────────────────────
  today: null,
  isTodayLoading: false,
  todayError: null,

  allPlans: null,
  rawPlans: null,
  isAllPlansLoading: false,
  allPlansError: null,

  weekProgress: null,
  isWeekLoading: false,
  weekError: null,

  // ── fetchToday ─────────────────────────────────────────────────────────────
  fetchToday: async () => {
    set({ isTodayLoading: true, todayError: null });
    try {
      const res = await axios_auth.get(API_ENDPOINTS.workoutPlans.getToday);
      const data = res.data?.data ?? res.data;
      set({ today: data, isTodayLoading: false });
    } catch (err: any) {
      set({
        todayError: err?.response?.data?.message ?? err.message ?? 'Failed to load today\'s workout',
        isTodayLoading: false,
      });
    }
  },

  // ── fetchAllPlans ──────────────────────────────────────────────────────────
  fetchAllPlans: async () => {
    set({ isAllPlansLoading: true, allPlansError: null });
    try {
      // Call member-specific endpoint that applies overrides
      const res = await  axios_auth.get(API_ENDPOINTS.workoutPlans.getMemberAll);
      const rawData = res.data?.data ?? res.data;
      
      // Store raw plans for workout manager
      // These plans already have member's overrides applied by backend:
      // - dayOfWeek is the effective day (custom or template)
      // - subTitle content is effective (custom or template)
      // - sortOrder is effective (custom or template)
      const plans: IWorkOutPlanRes[] = Array.isArray(rawData) ? rawData : [];
      
      // Transform backend response to flat structure for other components
      const flattenedItems = plans.flatMap(plan => 
        plan.subTitles.map(subTitle => ({
          subTitleId: subTitle.id,
          subTitle: subTitle.subTitle,
          imageName: subTitle.imageName,
          tutorialLink: subTitle.tutorialLink,
          sortOrder: subTitle.sortOrder,
          dayOfWeek: plan.dayOfWeek,
          planTitle: plan.title,
        }))
      );
      
      const transformedData: IAllWorkoutPlansRes = {
        items: flattenedItems,
      };
      
      set({ 
        allPlans: transformedData, 
        rawPlans: plans, 
        isAllPlansLoading: false 
      });
    } catch (err: any) {
      set({
        allPlansError: err?.response?.data?.message ?? err.message ?? 'Failed to load workout plans',
        isAllPlansLoading: false,
      });
    }
  },

  // ── fetchWeekProgress ──────────────────────────────────────────────────────
  fetchWeekProgress: async (start?: string) => {
    set({ isWeekLoading: true, weekError: null });
    try {
      const res =  await axios_auth.get(API_ENDPOINTS.workoutPlans.weekProgress(start));
      const data = res.data?.data ?? res.data;
      set({ weekProgress: data, isWeekLoading: false });
    } catch (err: any) {
      set({
        weekError: err?.response?.data?.message ?? err.message ?? 'Failed to load week progress',
        isWeekLoading: false,
      });
    }
  },

  // ── markDone (optimistic) ──────────────────────────────────────────────────
  markDone: async (req: IMarkDoneReq) => {
    const { today } = get();

    // 1. Optimistically update local state
    if (today) {
      const updatedItems: ITodayWorkoutItemRes[] = today.items.map((item) =>
        item.subTitleId === req.subTitleId
          ? { ...item, completed: req.completed }
          : item
      );
      set({ today: { ...today, items: updatedItems } });
    }

    // 2. Call API (rollback on failure)
    try {
      await axios_auth.post(API_ENDPOINTS.workoutPlans.log, req);
    } catch (err: any) {
      // Rollback optimistic update
      if (today) {
        set({ today });
      }
      set({ todayError: err?.response?.data?.message ?? 'Failed to update exercise' });
    }
  },

  // ── setOverride ────────────────────────────────────────────────────────────
  // setOverride: async (req: IOverrideReq) => {
  //   try {
  //     await axios_auth.post(API_ENDPOINTS.workoutPlans.setOverride, req);
  //     // Refresh today after override so effective items are recalculated
  //     await get().fetchToday();
  //   } catch (err: any) {
  //     set({ todayError: err?.response?.data?.message ?? 'Failed to set override' });
  //     throw err; // let UI handle
  //   }
  // },

  // // ── resetOverride ──────────────────────────────────────────────────────────
  // resetOverride: async (subTitleId: number) => {
  //   try {
  //     await axios_auth.delete(API_ENDPOINTS.workoutPlans.resetOverride(subTitleId));
  //     await get().fetchToday();
  //   } catch (err: any) {
  //     set({ todayError: err?.response?.data?.message ?? 'Failed to reset override' });
  //     throw err;
  //   }
  // },

  // ── updatePlanDay ──────────────────────────────────────────────────────────
  updatePlanDay: async (planId: number, newDay: string) => {
    try {
      await axios_auth.put(API_ENDPOINTS.workoutPlans.updatePlanDay(planId), {
        dayOfWeek: newDay,
      });
      // Refresh all plans after update
      await get().fetchAllPlans();
      await get().fetchToday();
    } catch (err: any) {
      set({ allPlansError: err?.response?.data?.message ?? 'Failed to update workout plan' });
      throw err;
    }
  },

  // ── updateSubTitle ─────────────────────────────────────────────────────────
  updateSubTitle: async (subTitleId: number, data: IUpdateSubTitleReq) => {
    try {
      await axios_auth.put(API_ENDPOINTS.workoutPlans.updateSubTitle(subTitleId), data);
      // Refresh all plans after update
      await get().fetchAllPlans();
      await get().fetchToday();
    } catch (err: any) {
      set({ allPlansError: err?.response?.data?.message ?? 'Failed to update exercise' });
      throw err;
    }
  },

  // ── createSubTitle ─────────────────────────────────────────────────────────
  createSubTitle: async (data: ICreateSubTitleReq) => {
    try {
      await axios_auth.post(API_ENDPOINTS.workoutPlans.createSubTitle, data);
      // Refresh all plans after creation
      await get().fetchAllPlans();
      await get().fetchToday();
    } catch (err: any) {
      set({ allPlansError: err?.response?.data?.message ?? 'Failed to create exercise' });
      throw err;
    }
  },

  clearErrors: () => set({ todayError: null, allPlansError: null, weekError: null }),
}));
