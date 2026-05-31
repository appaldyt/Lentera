import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Allow cross-origin requests from the user's mobile device or secondary PC on the local network
  allowedDevOrigins: ["192.168.8.197", "localhost"],
};

export default nextConfig;
