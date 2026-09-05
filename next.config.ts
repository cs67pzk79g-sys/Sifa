import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse (and its pdfjs-dist core) must stay outside the bundler and run
  // as a plain Node dependency on the server.
  serverExternalPackages: ["pdf-parse", "pdfjs-dist", "@prisma/client"],
  experimental: {
    // Uploaded safety data sheets are sent through Server Actions.
    serverActions: { bodySizeLimit: "12mb" },
  },
};

export default nextConfig;
