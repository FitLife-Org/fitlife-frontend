export const ROUTES = {
  // =====================================================
  // PUBLIC
  // =====================================================

  HOME: "/",

  // =====================================================
  // AUTHENTICATION
  // =====================================================

  LOGIN: "/login",

  REGISTER:
      "/register",

  FORGOT_PASSWORD:
      "/forgot-password",

  RESET_PASSWORD:
      "/reset-password",

  CHECK_EMAIL:
      "/check-email",

  VERIFY_EMAIL:
      "/verify-email",

  GOOGLE_CALLBACK:
      "/auth/google/callback",

  // =====================================================
  // COMMON PROTECTED
  // =====================================================

  DASHBOARD:
      "/dashboard",

  COMMON_SETTINGS:
      "/settings",

  FORBIDDEN:
      "/403",

  // =====================================================
  // ADMIN
  // =====================================================

  ADMIN_DASHBOARD:
      "/admin/dashboard",

  ADMIN_USERS:
      "/admin/users",

  ADMIN_MEMBERS:
      "/admin/members",

  ADMIN_PACKAGES:
      "/admin/packages",

  ADMIN_PAYMENTS:
      "/admin/payments",

  ADMIN_SUBSCRIPTIONS:
      "/admin/subscriptions",

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

  ADMIN_BODY_METRICS:
      "/admin/members/:memberId/body-metrics",

  // =====================================================
  // MEMBER - GENERAL
  // =====================================================

  MEMBER_HOME:
      "/member/home",

  MEMBER_PROFILE:
      "/member/profile",

  MEMBER_BODY_METRICS:
      "/member/body-metrics",

  MEMBER_QR:
      "/member/qr",

  MEMBER_BOOKING:
      "/member/booking",

  MEMBER_CHECKINS:
      "/member/checkins",

  MEMBER_SCHEDULE:
      "/member/schedule",

  // =====================================================
  // MEMBER - PACKAGE / SUBSCRIPTION
  // =====================================================

  MEMBER_PACKAGES:
      "/member/packages",

  MEMBER_SUBSCRIPTION:
      "/member/subscription",

  // =====================================================
  // MEMBER - PAYMENT
  // =====================================================

  MEMBER_PAYMENT:
      "/member/payment",

  MEMBER_PAYMENT_DETAIL:
      "/member/payment/:id",

  MEMBER_PAYMENT_RESULT:
      "/member/payment/result",

  // =====================================================
  // MEMBER - INVOICE
  // =====================================================

  MEMBER_INVOICES:
      "/member/invoices",

  MEMBER_INVOICE_DETAIL:
      "/member/invoices/:id",

  // =====================================================
  // MEMBER - AI
  // =====================================================

  MEMBER_AI:
      "/member/ai",

  MEMBER_AI_HISTORY:
      "/member/ai/history",

  MEMBER_AI_DETAIL:
      "/member/ai/:id",

  // =====================================================
  // MEMBER - WORKOUT
  // =====================================================

  MEMBER_WORKOUTS:
      "/member/workouts",

  MEMBER_WORKOUT_CREATE:
      "/member/workouts/create",

  MEMBER_WORKOUT_TODAY:
      "/member/workouts/today",

  MEMBER_WORKOUT_DETAIL:
      "/member/workouts/:id",

  MEMBER_WORKOUT_EDIT:
      "/member/workouts/:id/edit",

  // =====================================================
  // MEMBER - NUTRITION
  // =====================================================

  MEMBER_NUTRITION:
      "/member/nutrition",

  MEMBER_NUTRITION_TODAY:
      "/member/nutrition/today",

  MEMBER_NUTRITION_DETAIL:
      "/member/nutrition/:id",

  // =====================================================
  // STAFF
  // =====================================================

  STAFF_CHECKIN:
      "/staff/checkin",

  STAFF_CHECKIN_HISTORY:
      "/staff/checkin-history",

  STAFF_EQUIPMENT:
      "/staff/equipment",

  // =====================================================
  // TRAINER
  // =====================================================

  TRAINER_SCHEDULE:
      "/trainer/schedule",

  TRAINER_MEMBERS:
      "/trainer/members",

  TRAINER_WORKOUT_TRACKING:
      "/trainer/workouts",

  TRAINER_MEMBER_WORKOUTS:
      "/trainer/members/:memberId/workouts",

  TRAINER_MEMBER_WORKOUT_CREATE:
      "/trainer/members/:memberId/workouts/create",

  TRAINER_MEMBER_WORKOUT_EDIT:
      "/trainer/members/:memberId/workouts/:planId/edit",

  TRAINER_MEMBER_NUTRITION:
      "/trainer/members/:memberId/nutrition",

  TRAINER_MEMBER_NUTRITION_CREATE:
      "/trainer/members/:memberId/nutrition/create",

  TRAINER_MEMBER_NUTRITION_EDIT:
      "/trainer/members/:memberId/nutrition/:planId/edit",

  TRAINER_PROFILE:
      "/trainer/profile",

  STAFF_PROFILE:
      "/staff/profile",

  ADMIN_PROFILE:
      "/admin/profile",
} as const;