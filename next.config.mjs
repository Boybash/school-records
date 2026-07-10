/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  devIndicators: false,
  serverExternalPackages: ["firebase-admin", "google-auth-library"],
};

export default nextConfig;
