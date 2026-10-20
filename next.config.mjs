/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ask search engines not to list the pages or the photos
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive, noimageindex" }],
      },
    ];
  },
};

export default nextConfig;
