import type { ReactNode } from "react";

// ============================================================
// 如意云头 RuyiHead
// 两瓣对卷、中间收尖的云头。宽扁形,别做窄 —— 窄了就读成心形。
// 只在够大的地方用(长卷的隔水牙子、卷首题额),小于 40px 别用。
// ============================================================

const RUYI_PATH =
  "M22 19C20 13 15 12 10 13C3 14 1 8 5 4C9 1 15 3 17 8C19 12 21 15 22 19C23 15 25 12 27 8C29 3 35 1 39 4C43 8 41 14 34 13C29 12 24 13 22 19Z";

const ROTATE = { down: 0, up: 180, left: 90, right: -90 } as const;

interface RuyiHeadProps {
  /** 尖端朝向 */
  point?: keyof typeof ROTATE;
  /** 宽度(px),高度按 44:20 自动 */
  width?: number;
  color?: string;
  opacity?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function RuyiHead({
  point = "down",
  width = 56,
  color = "var(--glaze)",
  opacity = 0.5,
  className,
  style,
}: RuyiHeadProps): ReactNode {
  return (
    <svg
      aria-hidden
      className={className}
      width={width}
      height={(width * 20) / 44}
      viewBox="0 0 44 20"
      style={{ rotate: `${ROTATE[point]}deg`, ...style }}
    >
      <path d={RUYI_PATH} fill={color} fillOpacity={opacity} />
    </svg>
  );
}
