import { JourneyShell } from "@/components/journey-shell";

// ============================================================
// 首页 — 专注做「选目的地 → 地球 → 全屏叙事路线地图 → 景点详情」体验
// 白底红点缀。详情窗由 SpotPanelProvider(providers.tsx)全局提供。
// 旧的真实中国地图/画廊等区块已下线(备份见 .backup-m4c-map/)。
// ============================================================

export default function Home() {
  return <JourneyShell />;
}
