import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, // GSAP ScrollTrigger pins are incompatible with Strict Mode double-mount
  output: "standalone", // Optimizes build size for Docker deployment
};

export default nextConfig;
