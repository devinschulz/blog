const colors = require("tailwindcss/colors");
const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      fontFamily: {
        heading: ["Inter", ...defaultTheme.fontFamily.sans],
        sans: ["Mulish", "Inter", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        gray: colors.neutral,
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
