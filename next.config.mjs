/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Izinkan gambar menu dari Supabase Storage
    remotePatterns: [{ protocol: "https", hostname: "**.supabase.co" }],
  },
};
export default nextConfig;
