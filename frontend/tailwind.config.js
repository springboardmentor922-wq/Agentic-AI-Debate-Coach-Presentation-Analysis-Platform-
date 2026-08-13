/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#121826",
          900: "#0B0F19",
          800: "#121826",
          700: "#1A2233",
          600: "#242E44",
          500: "#333F5C",
        },
        fog: "#EDEFF4",
        slate: {
          muted: "#8B93A7",
        },
        motion: {
          // "for" side of a motion / affirmative accent
          teal: "#3FBFAE",
          tealDark: "#2C9689",
        },
        rebuttal: {
          // "against" side of a motion / negative accent
          coral: "#E8543F",
          coralDark: "#C43F2E",
        },
        signal: {
          amber: "#F4B740",
        },
      },
      fontFamily: {
        display: ["Fraunces", "ui-serif", "Georgia", "serif"],
        body: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 10px 30px -12px rgba(0,0,0,0.6)",
      },
      backgroundImage: {
        "docket-lines":
          "repeating-linear-gradient(0deg, rgba(255,255,255,0.035) 0px, rgba(255,255,255,0.035) 1px, transparent 1px, transparent 32px)",
      },
    },
  },
  plugins: [],
};
