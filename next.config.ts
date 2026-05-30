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
        hostname: "images.live-stream-api.workers.dev",
      },
    ],
  },
};

export default nextConfig;
