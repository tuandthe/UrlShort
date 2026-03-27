import type { NextConfig } from "next";

const storageUrlOrHost = process.env.NEXT_PUBLIC_STORAGE_URL || "localhost";

const BACKEND_ORIGIN = (process.env.BACKEND_ORIGIN || "http://localhost:8080").replace(/\/$/, "");

const nextConfig: NextConfig = {
  output: "standalone",
  env: {
    NEXT_PUBLIC_NEXTAUTH_URL:
      process.env.NEXTAUTH_URL || process.env.AUTH_URL || "",
  },
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: `${BACKEND_ORIGIN}/:path*`,
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "9000",
      },
      {
        protocol: "https",
        hostname: storageUrlOrHost,
      },
      {
        protocol: "https",
        hostname: "storage.urlshort.id.vn",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      }
    ],
  },
};

export default nextConfig;
