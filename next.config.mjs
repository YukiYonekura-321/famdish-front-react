/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    trustHostHeader: true, // X-Forwarded-Proto を信頼
  },
};

export default nextConfig;
