/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "v3b.fal.media",
      },
      {
        protocol: "https",
        hostname: "ai-famdish-images.s3.ap-northeast-1.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;
