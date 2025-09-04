const baseConfig = require("@portalis/config/tailwind");

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...baseConfig,
  content: ["./src/**/*.{ts,tsx}"],
};