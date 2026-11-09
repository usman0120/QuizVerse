module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: "#2D6A4F",
        secondary: "#40916C",
        accent: "#FFB703",
        primary: "#2D6A4F",
        "primary-dark": "#1B4332",
        textDark: "#1D1D1D",
        textLight: "#FFFFFF",
        bgLight: "#F9F9F9",
        bgDark: "#121212",
        science: "#0077B6",
        general: "#F77F00",
        poetry: "#D4A5A5",
        history: "#7B5E57",
        islamic: "#2A9D8F",
        tech: "#3A0CA3",
        arts: "#7209B7",
        kids: "#90E0EF",
        boys: "#5D737E",
        girls: "#FFCDB2",
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        nastaliq: ["Noto Nastaliq Urdu", "serif"],
      },
      animation: {
        blob: "blob 7s infinite",
        "pulse-slow": "pulse 3s infinite",
      },
      keyframes: {
        blob: {
          "0%,100%": { transform: "translate(0,0) scale(1)" },
          "33%": { transform: "translate(30px,-50px) scale(1.1)" },
          "66%": { transform: "translate(-20px,20px) scale(.9)" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
