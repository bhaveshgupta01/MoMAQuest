import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow MoMA API image domains
    remotePatterns: [
      { protocol: "https", hostname: "**.moma.org" },
      { protocol: "https", hostname: "moma.org" },
    ],
  },
  // Allow the app to be used as a PWA from any origin
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
      ],
    },
  ],
};

export default nextConfig;
