export enum AppUserRoles {
  ROLE_MEMBER = "ROLE_MEMBER",
  ROLE_ADMIN = "ROLE_ADMIN",
  ROLE_TRAINER = "ROLE_TRAINER",
  ROLE_AFFILIATE = "ROLE_AFFILIATE",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  PENDING = "PENDING",
}

export enum MembershipStatus {
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED",
  SUSPENDED = "SUSPENDED",
  PENDING = "PENDING",
  CANCELLED = "CANCELLED",
}

export enum NotificationType {
  MOTIVATIONAL = "MOTIVATIONAL",
  MEMBERSHIP_EXPIRY = "MEMBERSHIP_EXPIRY",
  ALERT = "ALERT",
  ANNOUNCEMENT = "ANNOUNCEMENT",
  PROMOTION = "PROMOTION",
  REMINDER = "REMINDER",
}

export enum AttendanceStatus {
  CHECKED_IN = "CHECKED_IN",
  CHECKED_OUT = "CHECKED_OUT",
  ABSENT = "ABSENT",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}
export enum AttendanceFrom {

  QR_CODE = "QR_CODE",
  MANUAL_ENTRY = "MANUAL_ENTRY",

  FINGERPRINT = "FINGERPRINT",
  CARD = "CARD",
}
export enum 
PaymentMode {
  CASH = "CASH",
  BANK = "BANK",
  CHEQUE = "CHEQUE",
  CARD = "CARD",
  FULL_CREDIT = "FULL_CREDIT", // Adding credit as a payment mode
  PARTIAL_CREDIT = "PARTIAL_CREDIT", // Adding credit as a payment mode
  // cash and bank split pay
  CASH_BANK_SPLIT_PAY = "CASH_BANK_SPLIT_PAY", // Split payment between cash and bank
}
export enum ShiftType {
  ALL = "ALL",
  MORNING = "MORNING",
  EVENING = "EVENING",
  AFTERNOON = "AFTERNOON",

  NIGHT = "NIGHT",
}