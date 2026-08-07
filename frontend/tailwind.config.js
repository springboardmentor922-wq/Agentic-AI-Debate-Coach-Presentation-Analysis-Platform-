/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",

  content: ["./index.html", "./src/**/*.{js,jsx}"],

  theme: {
    extend: {
      /* ===================================================
         COLORS
      =================================================== */

      colors: {
        ink: {
          950: "#070B14",
          900: "#0D1220",
          850: "#131A2B",
          800: "#171F30",
          750: "#1C2538",
          700: "#232D42",
          650: "#2C3650",
          600: "#33405C",
        },

        /* Purple Primary */

        brand: {
          50: "#F7F5FF",
          100: "#F1ECFF",
          200: "#E4DBFF",
          300: "#CDB9FF",
          400: "#A78BFA",
          500: "#8B5CF6",
          600: "#7C3AED",
          700: "#6D28D9",
          800: "#5B21B6",
          900: "#4C1D95",
        },

        /* Blue Secondary */

        accent: {
          50: "#EFF8FF",
          100: "#DBEEFF",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
        },

        /* AI Theme Tokens */

        ai: {
          bg: "#070B14",
          sidebar: "#101726",
          card: "#171F30",
          cardHover: "#202B40",
          border: "#313E59",

          text: "#F8FAFC",
          muted: "#94A3B8",

          purple: "#8B5CF6",
          blue: "#3B82F6",
        },

        verdict: {
          50: "#ECFDF5",
          100: "#D1FAE5",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
        },

        alert: {
          50: "#FEF2F2",
          100: "#FEE2E2",
          300: "#FCA5A5",
          400: "#F87171",
          500: "#EF4444",
          600: "#DC2626",
        },
      },

      /* ===================================================
         FONT SYSTEM
      =================================================== */

      fontFamily: {
        display: ["Sora", "ui-sans-serif", "system-ui"],

        body: ["Inter", "ui-sans-serif", "system-ui"],

        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },

      /* ===================================================
         RADIUS
      =================================================== */

      borderRadius: {
        xl: "16px",
        "2xl": "20px",
        "3xl": "26px",
      },

      /* ===================================================
         SHADOWS
      =================================================== */

      boxShadow: {
        glass: "0 8px 32px rgba(8,11,18,.35)",

        premium: "0 18px 55px rgba(124,58,237,.35)",

        ember: "0 18px 55px rgba(59,130,246,.25)",

        card: "0 12px 45px rgba(0,0,0,.35)",

        button: "0 12px 30px rgba(124,58,237,.40)",

        "glow-purple":
          "0 0 0 1px rgba(139,92,246,.35),0 0 30px rgba(139,92,246,.30)",

        "glow-blue":
          "0 0 0 1px rgba(59,130,246,.35),0 0 30px rgba(59,130,246,.25)",

        "glow-mix":
          "0 0 0 1px rgba(139,92,246,.30),0 0 35px rgba(59,130,246,.22)",
      },

      /* ===================================================
         BACKDROP
      =================================================== */

      backdropBlur: {
        xs: "2px",
        sm: "4px",
      },

      /* ===================================================
         GRADIENTS
      =================================================== */

      backgroundImage: {
        "grid-glow": `
          radial-gradient(circle at 15% 0%,
          rgba(139,92,246,.18),
          transparent 45%),

          radial-gradient(circle at 85% 20%,
          rgba(59,130,246,.16),
          transparent 40%)
          `,

        "primary-gradient":
          "linear-gradient(135deg,#6D28D9 0%,#8B5CF6 45%,#3B82F6 100%)",

        "button-gradient":
          "linear-gradient(90deg,#6D28D9 0%,#8B5CF6 45%,#3B82F6 100%)",

        "card-gradient": "linear-gradient(180deg,#1A2437 0%,#151E31 100%)",

        "sidebar-gradient": "linear-gradient(180deg,#101726 0%,#080B14 100%)",
      },

      /* ===================================================
         ANIMATIONS
      =================================================== */

      keyframes: {
        pulseBar: {
          "0%,100%": {
            transform: "scaleY(.35)",
          },

          "50%": {
            transform: "scaleY(1)",
          },
        },

        glow: {
          "0%,100%": {
            boxShadow: "0 0 12px rgba(139,92,246,.25)",
          },

          "50%": {
            boxShadow: "0 0 28px rgba(59,130,246,.35)",
          },
        },

        float: {
          "0%,100%": {
            transform: "translateY(0px)",
          },

          "50%": {
            transform: "translateY(-5px)",
          },
        },
      },

      animation: {
        pulseBar: "pulseBar 1.2s ease-in-out infinite",

        glow: "glow 2.5s ease-in-out infinite",

        float: "float 3s ease-in-out infinite",
      },

      /* ===================================================
         EXTRA UTILITIES FOR UI
      =================================================== */

      backgroundSize: {
        grid: "40px 40px",
      },

      transitionTimingFunction: {
        smooth: "cubic-bezier(.2,.6,.2,1)",
      },
    },
  },

  plugins: [],
};
