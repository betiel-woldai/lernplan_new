/** @type {import('next').NextConfig} */
const basePathValue = process.env.NODE_ENV === 'production' ? '/dias_test/lernplaner' : '';

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Use basePath for all routes including static assets
  // This tells Next.js the app is mounted at /dias_test/lernplaner
  basePath: basePathValue,
  // assetPrefix is automatically set to basePath if not specified

  // Make basePath available to client-side code via publicRuntimeConfig
  publicRuntimeConfig: {
    basePath: basePathValue,
  },
}

module.exports = nextConfig