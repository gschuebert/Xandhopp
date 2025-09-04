/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  transpilePackages: ['@portalis/ui', '@portalis/shared'],
};

module.exports = nextConfig;
