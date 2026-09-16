/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static HTML export. `next export` as a command no longer exists in Next 15.
  output: 'export',

  // No image optimizer exists in a static export, so next/image must not try.
  images: { unoptimized: true },

  // /about -> /about/index.html, which is what GitHub Pages serves cleanly.
  trailingSlash: true,

  // NO basePath: pptrick.github.io is a *user* site served from the domain root.
  // A project site (user.github.io/repo) would need basePath: '/repo' here.

  reactStrictMode: true,
};

export default nextConfig;
