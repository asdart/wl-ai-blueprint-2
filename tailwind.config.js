/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Instrument Sans'", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          400: "#18c280",
          900: "rgba(16,104,68,0.8)",
        },
      },
    },
  },
  plugins: [],
};
