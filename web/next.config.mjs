import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const backendOrigin = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  async rewrites() {
    return [
      {
        source: "/upload/images/:path*",
        destination: `${backendOrigin}/upload/images/:path*`
      },
      {
        source: "/data/pet-yard/images/:path*",
        destination: `${backendOrigin}/data/pet-yard/images/:path*`
      }
    ];
  },
  turbopack: {
    root: __dirname
  }
};

export default nextConfig;
