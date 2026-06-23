/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      // Brand palette from 01_SYSTEM_ANALYSIS.md
      colors: {
        charcoal: {
          DEFAULT: "#1A1F26",
          50: "#F2F3F4",
          100: "#D9DBDD",
          200: "#B3B7BB",
          300: "#8D9399",
          400: "#676F77",
          500: "#414B55",
          600: "#2D3440",
          700: "#232932",
          800: "#1A1F26",
          900: "#11151A",
        },
        cobalt: {
          DEFAULT: "#0055CC",
          50: "#E6F0FF",
          100: "#CCE0FF",
          200: "#99C2FF",
          300: "#66A3FF",
          400: "#3385FF",
          500: "#0055CC",
          600: "#0044A3",
          700: "#00337A",
          800: "#002252",
          900: "#001129",
        },
        gold: {
          DEFAULT: "#B8872A",
          50: "#FBF5E8",
          100: "#F5E9CC",
          200: "#EBD299",
          300: "#E1BB66",
          400: "#D7A433",
          500: "#B8872A",
          600: "#936C22",
          700: "#6E5119",
          800: "#4A3611",
          900: "#251B08",
        },
        silver: {
          DEFAULT: "#C8D0D9",
          50: "#F8F9FA",
          100: "#F0F2F4",
          200: "#E2E6EA",
          300: "#C8D0D9",
          400: "#A8B3BF",
          500: "#8896A5",
          600: "#68798B",
          700: "#4E5B69",
          800: "#343D46",
          900: "#1A1F23",
        },
        warmwhite: {
          DEFAULT: "#F5F4F0",
          50: "#FDFDFC",
          100: "#FAFAF7",
          200: "#F5F4F0",
          300: "#EDEBE4",
          400: "#E0DDD3",
          500: "#C8C4B5",
          600: "#A39E8B",
          700: "#7D7862",
          800: "#524F3E",
          900: "#28271F",
        },
      },
      // Typography from 01_SYSTEM_ANALYSIS.md
      fontFamily: {
        heading: ["Cormorant Garant", "Georgia", "serif"],
        body: ["DM Sans", "system-ui", "sans-serif"],
      },
      // Spacing scale (4px-based per design system)
      spacing: {
        4.5: "1.125rem",
        13: "3.25rem",
        15: "3.75rem",
        18: "4.5rem",
        88: "22rem",
        128: "32rem",
      },
      // Breakpoints per design system
      screens: {
        xs: "320px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
      // Border radius
      borderRadius: {
        sm: "0.25rem",
        md: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
      },
      // Box shadow (subtle, professional)
      boxShadow: {
        card: "0 2px 8px rgba(0, 0, 0, 0.08)",
        elevated: "0 4px 16px rgba(0, 0, 0, 0.12)",
        modal: "0 8px 32px rgba(0, 0, 0, 0.16)",
      },
      // Animation keyframes
      animation: {
        "fade-in": "fadeIn 0.8s ease-out forwards",
        "slide-in-left": "slideInLeft 0.8s ease-out forwards",
        "slide-in-right": "slideInRight 0.8s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};
