/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['warrity-api-800252372993.asia-south1.run.app'],
  },
  // Disable TypeScript and ESLint errors during build
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // Similarly, allow builds to complete even with ESLint errors
    ignoreDuringBuilds: true,
  },
  // Ensure buildId and deploymentId are properly set
  generateBuildId: async () => {
    return 'my-build-id-' + Date.now();
  },
  env: {
    DEPLOYMENT_ID: process.env.DEPLOYMENT_ID || 'local-deployment',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://warrity-api-800252372993.asia-south1.run.app/api/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
