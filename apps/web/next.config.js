/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/ui"],
  // Auto-memoises every component and hook; the lint already enforces the compiler's rules.
  reactCompiler: true,
};

export default nextConfig;
