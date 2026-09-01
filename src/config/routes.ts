export const ROUTES = {
  // =====================================================
  // PUBLIC
  // =====================================================

  HOME: "/",

  // =====================================================
  // AUTHENTICATION
  // =====================================================

  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  CHECK_EMAIL: "/check-email",
  VERIFY_EMAIL: "/verify-email",
  GOOGLE_CALLBACK: "/auth/google/callback",

  // =====================================================
  // COMMON PROTECTED
  // =====================================================

  DASHBOARD: "/dashboard",
  COMMON_SETTINGS: "/settings",
  FORBIDDEN: "/403",

  // =====================================================
  // ADMIN
  // =====================================================

  ADMIN_DASHBOARD: "/admin/dashboard",

  // User / Member
  ADMIN_USERS: "/admin/users",
  ADMIN_MEMBERS: "/admin/members",

  // Package / Subscription
  ADMIN_PACKAGES: "/admin/packages",
  ADMIN_SUBSCRIPTIONS: "/admin/subscriptions",

  // Payment / Invoice
  ADMIN_PAYMENTS: "/admin/payments",
  ADMIN_INVOICES: "/admin/invoices",
  ADMIN_INVOICE_DETAIL: "/admin/invoices/:id",

  // Equipment
  ADMIN_EQUIPMENT: "/admin/equipment",
  ADMIN_EQUIPMENT_AREAS: "/admin/equipment/areas",
  ADMIN_EQUIPMENT_ADD: "/admin/equipment/add",
  ADMIN_EQUIPMENT_EDIT: "/admin/equipment/edit/:id",
  ADMIN_EQUIPMENT_DETAIL: "/admin/equipment/:id",
  ADMIN_EQUIPMENT_MAINTENANCE:
      "/admin/equipment/:id/maintenance",
  ADMIN_MAINTENANCE_SCHEDULES:
      "/admin/equipment/maintenance-schedules",

  // Trainer
  ADMIN_TRAINERS: "/admin/trainers",

  // Report / AI
  ADMIN_REPORTS: "/admin/reports",
  ADMIN_AI_SUGGESTIONS: "/admin/ai-suggestions",

  // Profile
  ADMIN_PROFILE: "/admin/profile",

  ADMIN_CHECKIN:
      "/admin/checkin",

  // =====================================================
  // MEMBER
  // =====================================================

  MEMBER_HOME: "/member/home",
  MEMBER_PROFILE: "/member/profile",
  MEMBER_BODY_METRICS: "/member/body-metrics",

  // -----------------------------------------------------
  // PACKAGE / SUBSCRIPTION
  // -----------------------------------------------------

  MEMBER_PACKAGES: "/member/packages",
  MEMBER_SUBSCRIPTION: "/member/subscription",

  // -----------------------------------------------------
  // PAYMENT
  // -----------------------------------------------------

  MEMBER_PAYMENT: "/member/payment",
  MEMBER_PAYMENT_DETAIL: "/member/payment/:id",
  MEMBER_PAYMENT_RESULT: "/member/payment/result",

  // -----------------------------------------------------
  // INVOICE
  // -----------------------------------------------------

  MEMBER_INVOICES: "/member/invoices",
  MEMBER_INVOICE_DETAIL: "/member/invoices/:id",

  // -----------------------------------------------------
  // CHECK-IN
  // -----------------------------------------------------

  MEMBER_CHECKINS: "/member/checkins",
  MEMBER_QR: "/member/qr",

  // -----------------------------------------------------
  // AI
  // -----------------------------------------------------

  MEMBER_AI: "/member/ai",
  MEMBER_AI_HISTORY: "/member/ai/history",
  MEMBER_AI_DETAIL: "/member/ai/:id",

  // -----------------------------------------------------
  // WORKOUT
  // -----------------------------------------------------

  MEMBER_WORKOUTS: "/member/workouts",
  MEMBER_WORKOUT_CREATE: "/member/workouts/create",
  MEMBER_WORKOUT_TODAY: "/member/workouts/today",
  MEMBER_WORKOUT_DETAIL: "/member/workouts/:id",
  MEMBER_WORKOUT_EDIT: "/member/workouts/:id/edit",

  // -----------------------------------------------------
  // NUTRITION
  // -----------------------------------------------------

  MEMBER_NUTRITION: "/member/nutrition",
  MEMBER_NUTRITION_CREATE: "/member/nutrition/create",
  MEMBER_NUTRITION_TODAY: "/member/nutrition/today",
  MEMBER_NUTRITION_DETAIL: "/member/nutrition/:id",
  MEMBER_NUTRITION_EDIT: "/member/nutrition/:id/edit",

  // -----------------------------------------------------
  // BOOKING / SCHEDULE
  // -----------------------------------------------------

  MEMBER_BOOKING: "/member/booking",
  MEMBER_SCHEDULE: "/member/schedule",

  // =====================================================
  // STAFF
  // =====================================================

  STAFF_CHECKIN: "/staff/checkin",
  STAFF_CHECKIN_HISTORY: "/staff/checkin-history",
  STAFF_SUBSCRIPTION_SUPPORT: "/staff/subscriptions",
  STAFF_PROFILE: "/staff/profile",

  // =====================================================
  // TRAINER
  // =====================================================

  TRAINER_SCHEDULE: "/trainer/schedule",
  TRAINER_MEMBERS: "/trainer/members",
  TRAINER_WORKOUT_TRACKING: "/trainer/workouts",
  TRAINER_PROFILE: "/trainer/profile",

  // -----------------------------------------------------
  // TRAINER NUTRITION
  // -----------------------------------------------------

  TRAINER_MEMBER_NUTRITION:
      "/trainer/members/:memberId/nutrition",

  TRAINER_MEMBER_NUTRITION_CREATE:
      "/trainer/members/:memberId/nutrition/create",

  TRAINER_MEMBER_NUTRITION_EDIT:
      "/trainer/members/:memberId/nutrition/:planId/edit",
} as const;

// =====================================================
// ROUTE TYPES
// =====================================================

export type RouteKey = keyof typeof ROUTES;

export type AppRoute =
    (typeof ROUTES)[RouteKey];