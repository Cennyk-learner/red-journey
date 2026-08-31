import path from "node:path";
import type { NextConfig } from "next";

// Project Pages URL is https://<user>.github.io/<repo>/ — prefix only in CI.
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");

const nextConfig: NextConfig = {
  // 纯静态导出:无后端,产物可部署到任意静态托管(Vercel/GitHub Pages/学校服务器)
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
  // 用户主目录下也有 package-lock.json,显式指定项目根避免 Next 误判 workspace root
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
