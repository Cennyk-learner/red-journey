import type { ReactNode } from "react";

// ============================================================
// 云纹角隅 CloudCorner
// 三道同心的四分之一弧从直角里长出来,每道弧尾收一枚小卷。
// 这是「云肩/角隅」的画法:全部用精确的圆弧命令构成,
// 不靠手捏贝塞尔,所以任意尺寸下弧度都是对的。
// 用在长卷卷首、抽屉标题、图例框的转角。
// ============================================================

const BOX = 96;
/** 三道同心弧的半径 */
const RADII = [80, 60, 40];

/** 一道四分之一弧 + 尾端小卷 */
function arcWithCurl(r: number): string {
  const curl = "a 7 7 0 0 1 0 13 a 4.5 4.5 0 0 0 6.5 -4";
  return `M 6 ${6 + r} A ${r} ${r} 0 0 1 ${6 + r} 6 ${curl}`;
}

type Place = "tl" | "tr" | "bl" | "br";

const ROTATE: Record<Place, number> = { tl: 0, tr: 90, br: 180, bl: 270 };

interface CloudCornerProps {
  place?: Place;
  size?: number;
  color?: string;
  opacity?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function CloudCorner({
  place = "tl",
  size = 96,
  color = "var(--glaze)",
  opacity = 0.4,
  className,
  style,
}: CloudCornerProps): ReactNode {
  return (
    <svg
      aria-hidden
      className={className}
      width={size}
      height={size}
      viewBox={`0 0 ${BOX} ${BOX}`}
      style={{ rotate: `${ROTATE[place]}deg`, ...style }}
    >
      <g
        fill="none"
        stroke={color}
        strokeOpacity={opacity}
        strokeWidth="1.2"
        strokeLinecap="round"
      >
        {RADII.map((r) => (
          <path key={r} d={arcWithCurl(r)} />
        ))}
      </g>
    </svg>
  );
}
