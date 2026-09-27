import type { NextConfig } from "next";

// `next dev` and `next build` must not share an output directory. When they do, a production
// build overwrites the running dev server's chunks and requests fail with MODULE_NOT_FOUND.
const nextConfig: NextConfig = {
  typedRoutes: true,
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
};

export default nextConfig;