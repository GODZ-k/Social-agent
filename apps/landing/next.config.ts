import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  // The design system is consumed as TypeScript source, so Next has to compile it.
  transpilePackages: ["@repo/ui"],
  // Blog posts are MDX files in src/content/blog.
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
