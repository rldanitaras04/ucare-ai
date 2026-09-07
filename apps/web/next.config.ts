import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/ui", "@repo/supabase", "@repo/auth", "@repo/types", "@repo/utils"],
  devIndicators: false,
};

export default nextConfig;
