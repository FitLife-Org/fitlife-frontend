/**
 * Bộ màu dùng trong các trường hợp không thể dùng trực tiếp
 * class Tailwind, ví dụ:
 *
 * - biểu đồ;
 * - canvas;
 * - thư viện bên thứ ba;
 * - style object;
 * - cấu hình component động.
 *
 * Giao diện JSX thông thường vẫn nên ưu tiên class Tailwind.
 */
export const fitColors = {
  // Base
  bg: "#f8faf9",
  card: "#ffffff",
  border: "#e5e7eb",

  text: "#0f172a",
  muted: "#64748b",

  // Primary / Member
  primary: "#059669",
  primaryHover: "#047857",
  primarySoft: "#ecfdf5",

  // Common semantic colors
  success: "#059669",
  successSoft: "#ecfdf5",

  warning: "#d97706",
  warningSoft: "#fffbeb",

  danger: "#ef4444",
  dangerHover: "#dc2626",
  dangerSoft: "#fef2f2",

  info: "#2563eb",
  infoSoft: "#eff6ff",

  neutral: "#64748b",
  neutralSoft: "#f1f5f9",

  // Functional colors
  blue: "#2563eb",
  blueHover: "#1d4ed8",
  blueSoft: "#eff6ff",

  teal: "#0d9488",
  tealHover: "#0f766e",
  tealSoft: "#f0fdfa",

  cyan: "#06b6d4",
  cyanSoft: "#ecfeff",

  purple: "#7c3aed",
  purpleHover: "#6d28d9",
  purpleSoft: "#f5f3ff",

  orange: "#f97316",
  orangeHover: "#ea580c",
  orangeSoft: "#fff7ed",

  // Role colors
  admin: "#2563eb",
  adminHover: "#1d4ed8",
  adminSoft: "#eff6ff",

  staff: "#0d9488",
  staffHover: "#0f766e",
  staffSoft: "#f0fdfa",

  trainer: "#f97316",
  trainerHover: "#ea580c",
  trainerSoft: "#fff7ed",

  ai: "#7c3aed",
  aiHover: "#6d28d9",
  aiSoft: "#f5f3ff",

  // Invoice statuses
  invoiceUnpaid: "#d97706",
  invoiceUnpaidSoft: "#fffbeb",

  invoicePaid: "#059669",
  invoicePaidSoft: "#ecfdf5",

  invoiceCancelled: "#ef4444",
  invoiceCancelledSoft: "#fef2f2",

  invoiceRefunded: "#64748b",
  invoiceRefundedSoft: "#f1f5f9",
} as const;

export const fitRadius = {
  small: "0.5rem",
  input: "0.75rem",
  button: "0.75rem",
  card: "1.5rem",
  modal: "1.5rem",
  pill: "9999px",
} as const;

export const fitShadow = {
  card:
      "0 8px 24px rgba(15, 23, 42, 0.06)",

  soft:
      "0 4px 14px rgba(15, 23, 42, 0.05)",

  auth:
      "0 20px 70px rgba(15, 23, 42, 0.10)",

  modal:
      "0 24px 80px rgba(15, 23, 42, 0.18)",
} as const;

export type FitColor =
    keyof typeof fitColors;