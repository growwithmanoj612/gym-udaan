import { 
  AppUserRoles, 
  UserStatus, 
  MembershipStatus, 
  NotificationType, 
  AttendanceFrom,
  PaymentMode,
  Gender,
  ShiftType, 
  MessageType
} from '../enums';

// ==================== COMMON ====================

export interface IResponse {
  severity: "success" | "error" | "warning" | "info";
  message:  string;
}

// ==================== AUTH & USER ====================

export interface IAppUserMemberDetails {
  id: number;
  appUserRole: AppUserRoles | null;
  fullName: string;
  phone: string;
  address: string;
  businessDetailsId: number;
}

export interface ILoginRequest {
  userName: string;
  password: string;
  businessDetailsId:number
   
}

export interface ILoginResponse {
  token: string;
  refreshToken: string;
  appUser: IAppUserMemberDetails;
}

// ==================== BUSINESS DETAILS ====================

export interface IBusinessDetails {
  id: number;
  businessName: string;
  businessAddress: string;
  businessPhone:  string;
  businessPartnerPhones: string; // Comma-separated
  imageName: string;
  customerCareNumber: string;
}

// ==================== MEMBER ====================

export interface IMemberDetails {
  id: number;
  
  // Core Identity
  fullName: string;
  email: string | null;
  phone: string;
  address: string | null;
  gender: string;
  birthDate: string | null; // Nepali date
  
  // Gym Operations
  shiftType: ShiftType;
  joiningDate: string | null; // Nepali date
  doorAccess: boolean;
  
  // Physical Attributes
  weight: number;
  height: number;
  profileImageName: string | null;
  
  // Access Control
  cardNumber: string | null;
  hasFingerprint: boolean;
  hasAccessCard: boolean;
  canAccessDoor: boolean;
  
  // Safety & Health
  emergencyContact: string | null;
  guardianName: string | null;
  bloodGroup: string | null;
  healthCondition: string | null;
  
  // Additional Context
  occupation: string | null;
  remarks: string | null;
  
  // Display
  displayName: string;
  
  // Audit
  createdDate: string; // ISO-8601
  updatedDate: string; // ISO-8601
  isActive: boolean;
}

// ==================== MEMBERSHIP ====================

export interface IMemberShipDetails {
  id: number;
  
  // Membership Period
  membershipStartDate: string; // Nepali date string
  membershipEndDate: string; // Nepali date string
  remainingDays: number;
  
  // Status
  memberShipStatus: MembershipStatus;
  isExpired: boolean;
  isOnHold: boolean;
  
  // Plan Details
  planName: string;
  durationInDays: number;
  price: number;
  discount: number;
  defaultDiscount: number;
  description: string | null;
  
  // Payment Details
  paymentMode: PaymentMode;
  partialAmt: number;
  totalPaid: number;
  remainingAmount: number;
  isFullyPaid: boolean;
  
  // Hold Status
  holdDays: number;
  isMembershipHolded: boolean;
  
  // Audit
  createdDate: string; // ISO-8601 format
  updatedDate: string; // ISO-8601 format
  isActive: boolean;
}

// ==================== ATTENDANCE ====================

export interface IAttendanceDetails {
  id: number;
  
  // Attendance Times
  checkInTime: string; // ISO-8601 format
  checkOutTime: string | null; // ISO-8601 format
  
  // Source
  attendanceFrom: AttendanceFrom;
  
  // Audit
  createdDate: string; // ISO-8601 format
}

// ==================== NOTIFICATION ====================

export interface INotificationDetails {
  id: number;
  
  // Content
   
  message: string;
  type: MessageType; // INFO, WARNING, ALERT, PROMOTION, REMINDER
  priority: string; // HIGH, NORMAL, LOW
  isRead:  boolean;
  
  // Additional Data
  actionUrl: string | null;
  imageUrl: string | null;
  hasAction:  boolean;
  hasImage: boolean;
  
  // Type Flags
  isPersonal: boolean;
  isBroadcast: boolean;
  isHighPriority: boolean;
  
  // Audit
  createdDate: string; // ISO-8601 format
  isActive:  boolean;
}

// ==================== DIET PLAN ====================

export interface IDietPlanDetails {
  id: number;
  
  // Plan Details
  planName: string;
  description:  string | null;
  meals:  string | null;
  mealList: string[];
  targetGoal: string | null;
  durationDays: number | null;
  instructions: string | null;
  
  // Flags
  isAssigned: boolean;
  isLongTerm:  boolean;
  
  // Audit
  createdDate: string; // ISO-8601 format
  updatedDate: string; // ISO-8601 format
  isActive: boolean;
}

// ==================== STATS & ANALYTICS ====================

export interface IAttendanceStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  currentStreak: number;
  longestStreak: number;
  attendancePercentage: number;
  lastCheckIn?:  string;
  averageDuration: number; // in minutes
}

export interface IMembershipStats {
  totalMemberships: number;
  activeMemberships:  number;
  expiredMemberships: number;
  onHoldMemberships: number;
  totalRevenue: number;
  pendingPayments: number;
}

export interface IMemberStats {
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  newMembersThisMonth: number;
  membersWithFingerprint: number;
  membersWithAccessCard: number;
}

// ==================== COMBINED/COMPOSITE INTERFACES ====================

export interface IMemberWithMembershipDetails {
  member: IMemberDetails;
  currentMembership: IMemberShipDetails | null;
  attendanceToday: IAttendanceDetails | null;
  unreadNotifications: number;
  dietPlans: IDietPlanDetails[];
}

export interface IDashboardData {
  businessDetails: IBusinessDetails;
  memberStats: IMemberStats;
  membershipStats: IMembershipStats;
  attendanceStats: IAttendanceStats;
  recentAttendances: IAttendanceDetails[];
  unreadNotifications: INotificationDetails[];
}

// ==================== LIST RESPONSES ====================

export interface IPaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface IMemberListResponse {
  members: IMemberDetails[];
  total: number;
}

export interface IMemberShipListResponse {
  memberships: IMemberShipDetails[];
  total: number;
}

export interface IAttendanceListResponse {
  attendances:  IAttendanceDetails[];
  total: number;
  stats?:  IAttendanceStats;
}

export interface INotificationListResponse {
  notifications: INotificationDetails[];
  unreadCount:  number;
  total: number;
}

export interface IDietPlanListResponse {
  dietPlans: IDietPlanDetails[];
  total: number;
}



// Server response details (should match BiometricDeviceRes)
export interface IBiometricsDetails  {
  deviceName: string;
  deviceSN: string;
  deviceModel?: string;
  deviceType?: string;
  brand?: string;
  locationDescription?: string;
  status: string;


  allowAutoDoorLock: boolean;
  blockShiftAccess: boolean;

  lastHeartbeatAt?: string;
  createdAt?: string;
  cloudServerUrl?: string;


  // Hikvision-exclusive fields
  devicePort?: number;
  deviceUsername?: string;
  devicePassword?: string;
  ipAddress?: string;
  doorNo?: number;
}