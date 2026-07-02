import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Allow cross-origin requests from the user's mobile device or secondary PC on the local network
  allowedDevOrigins: ["172.31.99.152", "localhost", "10.42.249.222", "10.231.139.227", "192.168.8.189"],
};

export default nextConfig;
