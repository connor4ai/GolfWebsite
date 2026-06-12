/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // All artwork is local SVG; no remote image hosts are required.
  images: {
    // SVG art is served statically; allow next/image to inline it safely.
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
