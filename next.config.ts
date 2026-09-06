import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Next.js/Turbopack's dev-mode Fast Refresh needs 'unsafe-eval'; production
// doesn't. 'unsafe-inline' stays in both because the App Router injects
// inline hydration data and Tailwind/next/font emit inline styles — a full
// nonce-based CSP would remove that too, but is a larger change than this
// pass covers. This still blocks the main real-world risk: loading a
// <script src="https://attacker.example/x.js"> from anywhere but this origin.
const scriptSrc = isDev
  ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
  : "script-src 'self' 'unsafe-inline'";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "img-src 'self' https://images.unsplash.com https://picsum.photos data:",
      "style-src 'self' 'unsafe-inline'",
      scriptSrc,
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
