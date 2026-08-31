import type { Spot } from "@/data/types";

// ============================================================
// 长卷几何 —— 站点在绢面上的横向排布
//
// 与旧版 route-geometry 的分别:旧版把路径铺满单个视口宽,
// 长卷是一条比视口宽得多的横向卷面,站点按 order 沿卷排开,
// 滚动推进时依次入画。x 是卷面像素坐标(不是视口坐标),
// y 是相对卷面高度 h 的比例(0..1),渲染时乘 h。
//
// 加景点仍只改 spots.ts:这里按传入数组顺序排,不改任何代码。
// ============================================================

export interface ScrollStation {
  spot: Spot;
  /** 卷面 x 坐标(px) */
  x: number;
  /** 相对卷面高度的纵向位置(0..1) */
  yRatio: number;
  /** 题签挂在钤印上方还是下方(交替,免得一行排开像进度条) */
  side: "above" | "below";
  /** 与上一站之间的真实球面距离(km),首站为 0 */
  legKm: number;
}

export interface ScrollGeometry {
  stations: ScrollStation[];
  /** 卷面总宽(px) */
  scrollWidth: number;
}

/** 真实球面距离(haversine),里程标用 */
function kmBetween(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const d = Math.PI / 180;
  const dLat = (b[1] - a[1]) * d;
  const dLng = (b[0] - a[0]) * d;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a[1] * d) * Math.cos(b[1] * d) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/** 纵向节奏:站点沿中线上下错落,像手卷里题跋的呼吸 */
const Y_PATTERN = [0.46, 0.6, 0.42, 0.58, 0.44, 0.56];

/**
 * @param spots     该城可见景点(已按 order 排序)
 * @param viewportW 视口宽,用来定站距与卷首卷尾的留白
 */
export function layoutScroll(spots: Spot[], viewportW: number): ScrollGeometry {
  const n = spots.length;
  if (n === 0 || viewportW <= 0) return { stations: [], scrollWidth: viewportW };

  // 卷首留白:开卷后天头先露出来,第一站不贴边
  const headPad = Math.max(viewportW * 0.38, 400);
  // 卷末留白:必须 ≥ 一屏宽,否则末站会与落款同框重叠
  const tailPad = Math.max(viewportW * 1.2, 980);
  // 站距:不能按视口等分,否则三站挤在一屏里
  const gap = Math.max(viewportW * 0.58, 620);

  const stations: ScrollStation[] = spots.map((spot, i) => {
    const yRatio = Y_PATTERN[i % Y_PATTERN.length];
    const prev = i > 0 ? spots[i - 1] : null;
    return {
      spot,
      x: headPad + i * gap,
      yRatio,
      side: yRatio <= 0.5 ? "below" : "above",
      legKm: prev ? kmBetween(prev.coord, spot.coord) : 0,
    };
  });

  const scrollWidth =
    n > 0 ? headPad + (n - 1) * gap + tailPad : viewportW;

  return { stations, scrollWidth };
}
