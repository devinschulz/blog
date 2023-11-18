const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Karla Variable", ...defaultTheme.fontFamily.sans],
        heading: ["Exo Variable", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        gray: {
          25: "#fcfcfc",
          50: "#fafafa",
          100: "#f5f5f5",
          200: "#e5e5e5",
          300: "#d6d6d6",
          400: "#a3a3a3",
          500: "#737373",
          600: "#525252",
          700: "#424242",
          800: "#292929",
          900: "#141414",
        },
      },
    },
  },
  plugins: [],
};
