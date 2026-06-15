import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Allow cross-origin requests from the user's mobile device or secondary PC on the local network
  allowedDevOrigins: ["192.168.8.197", "localhost", "10.42.249.222", "10.231.139.227"],
};

export default nextConfig;
