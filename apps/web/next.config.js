/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@naprocs/types", "@naprocs/schemas", "@naprocs/ui"],
  // Expose server-only env vars to the Edge Runtime (middleware.ts)
  // These do NOT get sent to the browser — they're only available server-side.
  env: {
    JWT_SECRET: process.env.JWT_SECRET,
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: 'https', hostname: 'api.dicebear.com' },
      { protocol: 'https', hostname: 'i.pravatar.cc' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  async redirects() {
    return [
      {
        source: '/cam/:path*',
        destination: '/cem/:path*',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
