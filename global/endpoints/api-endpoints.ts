import { PaginationPeriodReq } from "../enums";

const authBase = "auth";
const businessBase = "business";
const memberBase = "members";
const notificationBase = "notification";
const attendanceBase = "attendance";
const membershipBase = "membership";
const dietPlanBase = "diet-plans";
const biometricBase = "biometric-devices";
const appBase = "app";
const plansBase = "plans";
const itemsBase = "items";
const workoutPlansBase = "workout-plans";

//owner
const notificationBaseOwnwer = "owner/notification";


export const API_ENDPOINTS = {
  auth: {
    login: `${authBase}/login`,
    check: (accessToken:string,selectedTenantId:string) => `${authBase}/check-auth?accessToken=${accessToken}&bId=${selectedTenantId}`,
    logout: `${authBase}/logout`,
    refreshToken: `${authBase}/refresh-token`,
    
    resetPassword: {
      requestOtp: `${authBase}/forgot-password/request-otp`,
      resetWithOtp: `${authBase}/forgot-password/reset`,
    },
  },

  business: {
   
    getAll: `${businessBase}/get-all`,
  },

  member: {
    profile: `${memberBase}/profile`,
    getAll: `${memberBase}/get-all`,
    getById: (id: number) => `${memberBase}/${id}`,
    updateProfile: `${memberBase}/profile/update`,
    uploadImage: `${memberBase}/upload-profile-image`,
    changePassword: `${memberBase}/change-password`,
    search: (query: string) => `${memberBase}/search?q=${query}`,
  },

  notifications: {
    getAll: `${notificationBase}/get-all`,
    getUnread: `${notificationBase}/get-unread`,
    getById: (id: number) => `${notificationBase}/${id}`,
    markAsRead: (id: number) => `${notificationBase}/mark-as-read?id=${id}`,
    markAllAsRead: `${notificationBase}/mark-all-as-read`,
    getUnreadCount: `${notificationBase}/get-unread-count`,
    getDietPlansNoti: `${notificationBase}/get-diet-plans-noti`,

      getPageinated:(period:PaginationPeriodReq)=> `${notificationBase}/get-paginated?period=${period}`,

  },

  attendance: {
    search: (yearMonth: string) => `${attendanceBase}/search?yearMonth=${yearMonth}`,
    
    getByDateRange: (startDate: string, endDate: string) => 
      `${attendanceBase}/range?startDate=${startDate}&endDate=${endDate}`,
  },

  membership: {
    getAll: `${membershipBase}/get-all`,
    getCurrent: `${membershipBase}/get-current`,
    getHistory: `${membershipBase}/history`,
    getPlans: `${membershipBase}/plans`,
    renew: `${membershipBase}/renew`,
    cancel: `${membershipBase}/cancel`,
    upgrade: (planId: number) => `${membershipBase}/upgrade/${planId}`,
  },

  dietPlans: {
    getAll:  `${dietPlanBase}/get-all`,
    getMy: `${dietPlanBase}/my-plans`,
    getById: (id: number) => `${dietPlanBase}/${id}`,
  },

  plans: {
    getAll: `${plansBase}/get-all`,
    getById: (id: number) => `${plansBase}/${id}`,
  },

  items: {
    getAll: `${itemsBase}/get-all`,
    getById: (id: number) => `${itemsBase}/${id}`,
  },

  // Workout Plans
  workoutPlans: {
    getToday: `${workoutPlansBase}/today`,
    getAll: `${workoutPlansBase}/get-all`, // Template data only
    getMemberAll: `${workoutPlansBase}/member/get-all`, // With member overrides applied
    getById: (id: number) => `${workoutPlansBase}/get/${id}`,
    getByDay: (dayOfWeek: string) => `${workoutPlansBase}/get-by-day?dayOfWeek=${dayOfWeek}`,
    weekProgress: (startDate?: string) => 
      startDate 
        ? `${workoutPlansBase}/progress/week?start=${startDate}`
        : `${workoutPlansBase}/progress/week`,
    log: `${workoutPlansBase}/log`, // Mark workout as done
    setOverride: `${workoutPlansBase}/override`, // Set custom day override
    resetOverride: (subTitleId: number) => `${workoutPlansBase}/override/${subTitleId}`, // Reset override
    updateSubTitle: (subTitleId: number) => `${workoutPlansBase}/subtitle/${subTitleId}`, // Update exercise details
    createSubTitle: `${workoutPlansBase}/subtitle/create`, // Create new exercise subtitle
    updatePlanDay: (planId: number) => `${workoutPlansBase}/update/${planId}`, // Move plan to different day
  },




  //owner
    notificationsOwner: {
    getAll: `${notificationBaseOwnwer}/get-all`,
    
    
    markAsRead: (id: number) => `${notificationBaseOwnwer}/mark-as-read?id=${id}`,
    markAllAsRead: `${notificationBaseOwnwer}/mark-all-as-read`,
    getUnreadCount: `${notificationBaseOwnwer}/get-unread-count`, 


       getPageinated:(period:PaginationPeriodReq)=> `${notificationBaseOwnwer}/get-paginated?period=${period}`,


  },
  biometric: {
    getAll: `${biometricBase}/get-all`,
    unlockDoor: (deviceSN: string) => `${biometricBase}/unlock-door/${deviceSN}`,
  },
  app: {
    getVersionInfo: `${appBase}/version-info`,
  },
};