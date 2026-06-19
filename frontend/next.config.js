/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  env: {
    NEXT_PUBLIC_GO_API_URL: process.env.NEXT_PUBLIC_GO_API_URL || "http://localhost:3000",
  },
};

module.exports = nextConfig;
