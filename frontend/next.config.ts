import 'dotenv/config';
import type { NextConfig } from "next";

const API_URL = process.env.BACKEND_HOST;
const API_PORT = process.env.BACKEND_PORT;

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_URL}:${API_PORT}/:path*`
      }
    ]
  }
};

export default nextConfig;
