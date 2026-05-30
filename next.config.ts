import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "makhi-unlaminated-jaylah.ngrok-free.dev",
    "*.ngrok-free.dev",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.1xapi.com",
      },
    ],
  },
};

export default nextConfig;
