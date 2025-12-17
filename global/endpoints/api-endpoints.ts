const authBase = "auth";
const businessBase = "business";
const memberBase = "members";
const notificationBase = "notification";
const attendanceBase = "attendance";
const membershipBase = "membership";
const dietPlanBase = "diet-plans";

export const API_ENDPOINTS = {
  auth: {
    login: `${authBase}/login`,
    check: `${authBase}/check`,
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
    markAsRead: (id: number) => `${notificationBase}/${id}/mark-read`,
    markAllAsRead: `${notificationBase}/mark-all-read`,
    getUnreadCount: `${notificationBase}/unread-count`,
    delete: (id: number) => `${notificationBase}/${id}`,
  },

  attendance: {
    getAll: `${attendanceBase}/get-all`,
    checkIn: `${attendanceBase}/check-in`,
    checkOut: `${attendanceBase}/check-out`,
    getHistory: `${attendanceBase}/history`,
    getTodayAttendance: `${attendanceBase}/today`,
    getStats: `${attendanceBase}/stats`,
    getByDateRange: (startDate: string, endDate: string) => 
      `${attendanceBase}/range? startDate=${startDate}&endDate=${endDate}`,
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
};