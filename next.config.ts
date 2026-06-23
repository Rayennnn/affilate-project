import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/dashboard",
        destination: "/creator/browse-products",
        permanent: false,
      },
      {
        source: "/dashboard/products",
        destination: "/creator/browse-products",
        permanent: false,
      },
      {
        source: "/dashboard/:path*",
        destination: "/creator/:path*",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
