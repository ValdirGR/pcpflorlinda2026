import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "florlinda.store",
        pathname: "/pcpflorlinda/uploads/**",
      },
    ],
  },
};

export default nextConfig;
