// ─── Today's Workout ────────────────────────────────────────────────────────
export interface ITodayWorkoutItemRes {
  subTitleId: number;
  subTitle: string;
  imageName: string | null;
  tutorialLink: string | null;
  sortOrder: number;
  completed: boolean;
}

export interface ITodayWorkoutRes {
  planId: number | null;
  planTitle: string | null;
  dayOfWeek: string;   // "MONDAY" | "TUESDAY" | ...
  date: string;        // "2024-02-26"
  items: ITodayWorkoutItemRes[];
}

// ─── All Workout Plans ───────────────────────────────────────────────────────
export interface ISubTitleRes {
  id: number;
  subTitle: string;
  imageName: string | null;
  tutorialLink: string | null;
  sortOrder: number;
}

export interface IWorkOutPlanRes {
  id: number;
  title: string;
  dayOfWeek: string;
  subTitles: ISubTitleRes[];
  appUserId: number;
  branchId: number;
  createdDate: string;
  updatedDate: string;
  isActive: boolean;
}

export interface IAllWorkoutPlansItemRes {
  subTitleId: number;
  subTitle: string;
  imageName: string | null;
  tutorialLink: string | null;
  sortOrder: number;
  dayOfWeek: string;   // "MONDAY" | "TUESDAY" | ...
  planTitle: string | null;
}

export interface IAllWorkoutPlansRes {
  items: IAllWorkoutPlansItemRes[];
}

// ─── Week Progress ───────────────────────────────────────────────────────────
export interface IWeekProgressDayRes {
  date: string;
  assigned: number;
  completed: number;
}

export interface IWeekProgressRes {
  weekStart: string;
  weekEnd: string;
  totalAssigned: number;
  totalCompleted: number;
  days: IWeekProgressDayRes[];
}

// ─── Requests ────────────────────────────────────────────────────────────────
export interface IMarkDoneReq {
  subTitleId: number;
  completed: boolean;
  date?: string;   // optional, defaults to today on backend
  note?: string;
}

export interface IOverrideReq {
  subTitleId: number;
  targetDayOfWeek: string;  // "MONDAY" | "TUESDAY" | ...
  sortOrder: number;
}

export interface IUpdateSubTitleReq {
  subTitle: string;
  tutorialLink: string;
  sortOrder: number;
}

export interface ICreateSubTitleReq {
  planId: number;
  subTitle: string;
  tutorialLink?: string;
  sortOrder: number;
}
