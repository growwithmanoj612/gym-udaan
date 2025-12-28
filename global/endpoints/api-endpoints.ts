const authBase = "auth";
const businessBase = "business";
const memberBase = "members";
const notificationBase = "notification";
const attendanceBase = "attendance";
const membershipBase = "membership";
const dietPlanBase = "diet-plans";
const biometricBase = "biometric-devices";

//owner
const notificationBaseOwnwer = "owner/notification";


export const API_ENDPOINTS = {
  auth: {
    login: `${authBase}/login`,
    check: (accessToken:string) => `${authBase}/check-auth?accessToken=${accessToken}`,
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

      getPageinated: `${notificationBase}/get-paginated`,

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




  //owner
    notificationsOwner: {
    getAll: `${notificationBaseOwnwer}/get-all`,
    
    
    markAsRead: (id: number) => `${notificationBaseOwnwer}/mark-as-read?id=${id}`,
    markAllAsRead: `${notificationBaseOwnwer}/mark-all-as-read`,
    getUnreadCount: `${notificationBaseOwnwer}/get-unread-count`, 


     getPageinated: `${notificationBaseOwnwer}/get-paginated`,

  },
  biometric: {
    getAll: `${biometricBase}/get-all`,
    unlockDoor: (deviceSN: string) => `${biometricBase}/unlock-door/${deviceSN}`,
  },
};