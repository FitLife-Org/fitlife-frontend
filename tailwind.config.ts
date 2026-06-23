import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        fit: {
          bg: "#f8faf9",
          card: "#ffffff",
          border: "#e5e7eb",
          text: "#0f172a",
          muted: "#64748b",
          primary: "#059669",
          primaryHover: "#047857",
          primarySoft: "#ecfdf5",
          blue: "#2563eb",
          blueSoft: "#eff6ff",
          purple: "#7c3aed",
          purpleSoft: "#f5f3ff",
          orange: "#f97316",
          orangeSoft: "#fff7ed",
          danger: "#ef4444",
          dangerSoft: "#fef2f2",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        card: "0 8px 24px rgba(15, 23, 42, 0.06)",
        soft: "0 4px 14px rgba(15, 23, 42, 0.05)",
      },
    },
  },
  plugins: [],
};

export default config;
