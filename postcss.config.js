const path = require('path')

module.exports = {
  plugins: {
    "postcss-import": {},
    "postcss-preset-env": {
      browsers: "last 2 versions"
    },
    autoprefixer: {},
    tailwindcss: path.join(__dirname, './tailwind.js')
  }
};
