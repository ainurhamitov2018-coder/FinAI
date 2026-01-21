import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ВТБ стиль - точные цвета из официального сайта
        primary: {
          50: "#e6f2ff",
          100: "#b3d9ff",
          200: "#80c0ff",
          300: "#4da7ff",
          400: "#1a8eff",
          500: "#0663EF", // Основной синий ВТБ (из HTML)
          600: "#0550c0",
          700: "#043d91",
          800: "#032a62",
          900: "#021733",
        },
        bank: {
          blue: "#0663EF", // Основной цвет ВТБ (из HTML)
          dark: "#101113", // Темный фон (из HTML body.dark)
          light: "#ffffff", // Светлый фон (из HTML body.light)
          accent: "#22c55e", // Зеленый для доходов
          danger: "#ef4444", // Красный для расходов
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;



