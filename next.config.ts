import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  webpack(config) {
    // Required for @react-three/rapier WASM when building with webpack
    config.experiments = { ...config.experiments, asyncWebAssembly: true };
    return config;
  },
};

export default withNextIntl(nextConfig);
