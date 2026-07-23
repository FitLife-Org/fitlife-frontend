export const ROUTES = {
  HOME: "/",

  // Authentication
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  CHECK_EMAIL: "/check-email",
  VERIFY_EMAIL: "/verify-email",
  GOOGLE_CALLBACK: "/auth/google/callback",

  // Common protected routes
  DASHBOARD: "/dashboard",
  COMMON_SETTINGS: "/settings",
  FORBIDDEN: "/403",

  // Admin
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_USERS: "/admin/users",
  ADMIN_MEMBERS: "/admin/members",
  ADMIN_PACKAGES: "/admin/packages",
  ADMIN_PAYMENTS: "/admin/payments",
  ADMIN_EQUIPMENT: "/admin/equipment",
  ADMIN_TRAINERS: "/admin/trainers",
  ADMIN_REPORTS: "/admin/reports",
  ADMIN_INVOICES: "/admin/invoices",

  // Member
  MEMBER_HOME: "/member/home",
  MEMBER_PROFILE: "/member/profile",
  MEMBER_BODY_METRICS: "/member/body-metrics",

  MEMBER_PACKAGES: "/member/packages",
  MEMBER_SUBSCRIPTION: "/member/subscription",

  MEMBER_PAYMENT: "/member/payment",
  MEMBER_PAYMENT_DETAIL: "/member/payment/:id",
  MEMBER_PAYMENT_RESULT: "/member/payment/result",

  MEMBER_CHECKINS: "/member/checkins",

  MEMBER_AI: "/member/ai",
  MEMBER_AI_HISTORY: "/member/ai/history",
  MEMBER_AI_DETAIL: "/member/ai/:id",

  MEMBER_WORKOUTS: "/member/workouts",
  MEMBER_WORKOUT_DETAIL: "/member/workouts/:id",
  MEMBER_WORKOUT_TODAY: "/member/workouts/today",

  MEMBER_NUTRITION: "/member/nutrition",
  MEMBER_NUTRITION_DETAIL: "/member/nutrition/:id",
  MEMBER_NUTRITION_TODAY: "/member/nutrition/today",

  MEMBER_BOOKING: "/member/booking",
  MEMBER_SCHEDULE: "/member/schedule",

  // Staff
  STAFF_CHECKIN: "/staff/checkin",
  STAFF_SUBSCRIPTION_SUPPORT: "/staff/subscriptions",

  // Trainer
  TRAINER_SCHEDULE: "/trainer/schedule",
  TRAINER_MEMBERS: "/trainer/members",
  TRAINER_WORKOUT_TRACKING: "/trainer/workouts",
} as const;