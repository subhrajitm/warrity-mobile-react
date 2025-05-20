/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['warrityweb-api-x1ev.onrender.com'],
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
        destination: 'https://warrityweb-api-x1ev.onrender.com/api/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-Requested-With, Content-Type, Authorization',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
