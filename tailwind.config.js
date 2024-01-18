const colors = require("tailwindcss/colors");

module.exports = {
  content: ["./layouts/**/*.html"],
  theme: {
    screens: {
      sm: "640px",
    },
    extend: {
      colors: {
        gray: colors.neutral,
      },
      fontSize: {
        xxs: "0.65rem",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
