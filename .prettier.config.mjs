/** @type {import("prettier").Config} */
const config = {
  plugins: [
    "prettier-plugin-astro",
    "@ianvs/prettier-plugin-sort-imports",
    "prettier-plugin-organize-attributes",
    "prettier-plugin-tailwindcss",
  ],
  overrides: [
    {
      files: "**/*.astro",
      options: {
        parser: "astro",
      },
    },
  ],
};

export default config;
