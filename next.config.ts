import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://connect.facebook.net https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https: https://www.facebook.com https://www.google-analytics.com https://www.googletagmanager.com; connect-src 'self' https: wss: ws: https://connect.facebook.net https://www.facebook.com https://www.google-analytics.com https://www.googletagmanager.com https://region1.google-analytics.com; font-src 'self' data: https:; frame-src https://www.facebook.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://www.facebook.com",
          },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
