import type { Metadata } from "next";
import "@fontsource/noto-sans-sc/400.css";
import "@fontsource/noto-sans-sc/500.css";
import "@fontsource/noto-serif-sc/500.css";
import "@fontsource/noto-serif-sc/700.css";
import "@fontsource/cormorant-garamond/latin-400.css";
import "@fontsource/cormorant-garamond/latin-500.css";
import "@fontsource/cormorant-garamond/latin-600.css";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "红色足迹 · Red Journey",
  description:
    "2026 年 7 月至 8 月，大学生实践团在四川广安、广西百色开展社会实践。中英双语现场记录。",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        {/* 霞鹜文楷屏显版:97 片 unicode-range 分包,由 scripts/build-fonts.py
            搬到 public/。走 link 而不是打包器,避免 97 个 woff2 过 CSS pipeline。 */}
        <link rel="stylesheet" href="/fonts/lxgw/lxgw-wenkai-screen.css" />
        <link
          rel="preload"
          href="/fonts/ma-shan-zheng-display.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
