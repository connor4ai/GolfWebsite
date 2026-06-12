/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // SVG art is served statically; allow next/image to inline it safely.
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Permitted hosts for client photography (config ImageAsset.src URLs).
    remotePatterns: [
      { protocol: "https", hostname: "whisperingpinesgolfclub.com" },
      { protocol: "https", hostname: "*.whisperingpinesgolfclub.com" },
    ],
  },
};

export default nextConfig;
