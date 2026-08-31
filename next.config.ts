import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 纯静态导出:无后端,产物可部署到任意静态托管(Vercel/GitHub Pages/学校服务器)
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // 用户主目录下也有 package-lock.json,显式指定项目根避免 Next 误判 workspace root
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
