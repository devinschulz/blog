/** @type {import('postcss-load-config').Config} */
module.exports = {
  plugins: [
    require("postcss-import")({
      path: ["assets/css"],
    }),
    require("postcss-mixins"),
    require("postcss-nested"),
    require("postcss-color-function"),
    require("postcss-simple-vars"),
    require("tailwindcss"),
    require("postcss-preset-env"),
    ...(process.env.NODE_ENV === "production"
      ? [
          require("cssnano")({
            preset: ["default", { discardComments: { removeAll: true } }],
          }),
        ]
      : []),
  ],
};
