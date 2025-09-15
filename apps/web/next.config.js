// Using custom i18n system instead of next-intl

/** @type {import('next').NextConfig} */
const nextConfig = {
  // experimental: {
  //   appDir: true, // This is now default in Next.js 14
  // },
  transpilePackages: ['@xandhopp/ui', '@xandhopp/shared'],
};

module.exports = nextConfig;
