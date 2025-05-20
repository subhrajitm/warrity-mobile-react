/** @type {import('next').NextConfig} */

// Generate a unique build ID for this build
const buildId = 'build-' + Date.now();
const deploymentId = process.env.DEPLOYMENT_ID || 'local-deployment';

// Make these values available globally
global.buildId = buildId;
global.deploymentId = deploymentId;

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
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
  // Ensure buildId is properly set
  generateBuildId: async () => {
    return buildId;
  },
  env: {
    NEXT_PUBLIC_BUILD_ID: buildId,
    NEXT_PUBLIC_DEPLOYMENT_ID: deploymentId,
  },
};

module.exports = nextConfig;
