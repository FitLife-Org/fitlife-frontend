export const ROUTES = {
  HOME: "/",

  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",

  CHECK_EMAIL: "/check-email",
  VERIFY_EMAIL: "/verify-email",

  GOOGLE_CALLBACK: "/auth/google/callback",

  DASHBOARD: "/dashboard",
  ADMIN_DASHBOARD: "/admin/dashboard",

  ADMIN_USERS: "/admin/users",
  ADMIN_MEMBERS: "/admin/members",
  ADMIN_PACKAGES: "/admin/packages",
  ADMIN_PAYMENTS: "/admin/payments",
  ADMIN_EQUIPMENT: "/admin/equipment",
  ADMIN_TRAINERS: "/admin/trainers",
  ADMIN_REPORTS: "/admin/reports",
  ADMIN_INVOICES: "/admin/invoices",

  MEMBER_HOME: "/member/home",
  MEMBER_PROFILE: "/member/profile",
  MEMBER_BODY_METRICS: "/member/body-metrics",
  MEMBER_PACKAGES: "/member/packages",
  MEMBER_SUBSCRIPTION: "/member/subscription",
  MEMBER_PAYMENT: "/member/payment",
  MEMBER_PAYMENT_DETAIL: "/member/payment/:id",
  MEMBER_PAYMENT_RESULT:
      "/member/payment/result",
  MEMBER_CHECKINS: "/member/checkins",
  MEMBER_AI: "/member/ai",
  MEMBER_BOOKING: "/member/booking",
  MEMBER_NUTRITION: "/member/nutrition",
  MEMBER_CHECKIN_HISTORY: "/member/checkins",
  MEMBER_WORKOUTS: "/member/workouts",
  MEMBER_SCHEDULE: "/member/schedule",

  STAFF_CHECKIN: "/staff/checkin",
  STAFF_SUBSCRIPTION_SUPPORT:
      "/staff/subscriptions",

  TRAINER_SCHEDULE: "/trainer/schedule",
  TRAINER_MEMBERS: "/trainer/members",
  TRAINER_WORKOUT_TRACKING:
      "/trainer/workouts",

  COMMON_SETTINGS: "/settings",

  FORBIDDEN: "/403",
} as const;