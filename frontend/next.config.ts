import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Demo/seed imagery is served from external hosts. Production imagery will
    // be streamed through the API, so this list is only for dev + demo data.
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'api.dicebear.com' },
    ],
  },
};

export default nextConfig;
