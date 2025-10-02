import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators:false,
    images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "social.pyaesone.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "social-api.pyaesone.com",
        port: "",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
