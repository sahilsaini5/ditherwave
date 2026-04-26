/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['dither'],
  experimental: {
    typedRoutes: false,
  },
};

export default nextConfig;
