/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          pink:   "#FF3D6B",
          blue:   "#4A90D9",
          yellow: "#F5C518",
          dark:   "#111827",
        },
        ritmo:   "#FF3D6B",
        melodia: "#4A90D9",
        armonia: "#F5C518",
        xp:      "#F5C518",
      },
      animation: {
        "ticker":   "ticker 22s linear infinite",
        "fade-in":  "fadeIn .3s ease",
      },
      keyframes: {
        ticker: {
          "0%":   { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        fadeIn: {
          from: { opacity: "0", transform: "translateY(6px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};