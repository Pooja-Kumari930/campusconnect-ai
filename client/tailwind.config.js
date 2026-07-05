/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Sora", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#2563EB",
          50: "#EFF4FF",
          100: "#DBE6FE",
          400: "#5B8DF6",
          500: "#2563EB",
          600: "#1D4ED8",
          700: "#1E40AF",
        },
        accent: {
          DEFAULT: "#06B6D4",
          400: "#22D3EE",
          500: "#06B6D4",
          600: "#0891B2",
        },
        success: { DEFAULT: "#16A34A", 100: "#DCFCE7" },
        warning: { DEFAULT: "#F59E0B", 100: "#FEF3C7" },
        danger: { DEFAULT: "#DC2626", 100: "#FEE2E2" },
        neutral: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
          950: "#080D17",
        },
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #2563EB 0%, #06B6D4 100%)",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(15, 23, 42, 0.08)",
        "glass-dark": "0 8px 32px 0 rgba(0, 0, 0, 0.35)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
