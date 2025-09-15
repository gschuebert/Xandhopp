// Temporarily disable next-intl to use simple homepage
// const createNextIntlPlugin = require('next-intl/plugin');
// const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // experimental: {
  //   appDir: true, // This is now default in Next.js 14
  // },
  transpilePackages: ['@xandhopp/ui', '@xandhopp/shared'],
};

module.exports = nextConfig;
