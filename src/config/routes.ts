export const ROUTES = {
  HOME: "/",

  // Authentication
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD:
      "/forgot-password",
  RESET_PASSWORD:
      "/reset-password",
  CHECK_EMAIL: "/check-email",
  VERIFY_EMAIL: "/verify-email",
  GOOGLE_CALLBACK:
      "/auth/google/callback",

  // Common protected routes
  DASHBOARD: "/dashboard",
  COMMON_SETTINGS: "/settings",
  FORBIDDEN: "/403",

  // Admin
  ADMIN_DASHBOARD:
      "/admin/dashboard",
  ADMIN_USERS: "/admin/users",
  ADMIN_MEMBERS: "/admin/members",
  ADMIN_PACKAGES:
      "/admin/packages",
  ADMIN_PAYMENTS: "/admin/payments",
  ADMIN_SUBSCRIPTIONS: "/admin/subscriptions",
  ADMIN_EQUIPMENT:
      "/admin/equipment",
  ADMIN_TRAINERS:
      "/admin/trainers",
  ADMIN_REPORTS:
      "/admin/reports",
  ADMIN_AI_SUGGESTIONS:
      "/admin/ai-suggestions",

  ADMIN_INVOICES:
      "/admin/invoices",

  ADMIN_INVOICE_DETAIL:
      "/admin/invoices/:id",

  // Member
  MEMBER_HOME: "/member/home",
  MEMBER_PROFILE:
      "/member/profile",
  MEMBER_BODY_METRICS:
      "/member/body-metrics",

  ADMIN_BODY_METRICS:
  "/admin/members/{memberId}/body-metrics",

  MEMBER_PACKAGES:
      "/member/packages",
  MEMBER_SUBSCRIPTION:
      "/member/subscription",

  MEMBER_PAYMENT:
      "/member/payment",
  MEMBER_PAYMENT_DETAIL:
      "/member/payment/:id",
  MEMBER_PAYMENT_RESULT:
      "/member/payment/result",

  MEMBER_INVOICES:
      "/member/invoices",

  MEMBER_INVOICE_DETAIL:
      "/member/invoices/:id",

  MEMBER_CHECKINS:
      "/member/checkins",

  MEMBER_AI: "/member/ai",
  MEMBER_AI_HISTORY:
      "/member/ai/history",
  MEMBER_AI_DETAIL:
      "/member/ai/:id",

  MEMBER_WORKOUTS:
      "/member/workouts",
  MEMBER_QR: "/member/qr",
  MEMBER_BOOKING: "/member/booking",
  MEMBER_WORKOUT_DETAIL:
      "/member/workouts/:id",
  MEMBER_WORKOUT_TODAY:
      "/member/workouts/today",
  MEMBER_WORKOUT_CREATE:
      "/member/workouts/create",

  MEMBER_WORKOUT_EDIT:
      "/member/workouts/:id/edit",

  MEMBER_NUTRITION:
      "/member/nutrition",
  MEMBER_NUTRITION_DETAIL:
      "/member/nutrition/:id",
  MEMBER_NUTRITION_TODAY:
      "/member/nutrition/today",


  MEMBER_SCHEDULE:
      "/member/schedule",

  // Staff
  STAFF_CHECKIN:
      "/staff/checkin",
  STAFF_CHECKIN_HISTORY:
      "/staff/checkin-history",
  STAFF_EQUIPMENT:
      "/staff/equipment",


  // Trainer
  TRAINER_SCHEDULE:
      "/trainer/schedule",
  TRAINER_MEMBERS:
      "/trainer/members",
  TRAINER_WORKOUT_TRACKING:
      "/trainer/workouts",
} as const;
