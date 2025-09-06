/** @type {import('next').NextConfig} */
const nextConfig = {
  // experimental: {
  //   appDir: true, // This is now default in Next.js 14
  // },
  transpilePackages: ['@portalis/ui', '@portalis/shared'],
};

module.exports = nextConfig;
