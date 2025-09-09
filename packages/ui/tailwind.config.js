const baseConfig = require("@xandhopp/config/tailwind");

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...baseConfig,
  content: ["./src/**/*.{ts,tsx}"],
};