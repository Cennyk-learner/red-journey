"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "@/lib/motion";

// ============================================================
// DestinationGlobe — 抽象点阵地球(canvas 2D 自绘,替代 cobe)
// 用户定位:它不是真实世界地图,而是「地图锚点」—— 点阵是抽象的
// 群岛纹样(确定性噪声生成),两座城市的锚点被人为拉远(经度差
// 约 130°),两锚点之间画一条虚线航迹弧(呼应「贯通中外」)。
// 交互:点广安 → 球转到广安;再点百色 → 沿同方向**继续**转过去
// (forward-only 缓动,不回头)。
// 红点规则:未选中城市 = 空心红圈;选中城市 = 不在画布上画点,
// 由 HTML 标注的引线端点作为唯一红点(修复三点堆叠 bug)。
// ============================================================

export interface GlobeCity {
  id: string;
  coord: [number, number]; // [lng, lat] 真实坐标(此组件不使用,仅保留接口)
  labelZh: string;
  labelEn: string;
}

interface DestinationGlobeProps {
  cities: GlobeCity[];
  /** 当前选中的城市 id(null = 自由慢转,无标注) */
  focusId: string | null;
  /** 点阵色:ink=深墨(宣纸底) / rice=反白(实景压暗底) */
  tone?: "ink" | "rice";
  className?: string;
  /** 引出地点卡时,父组件在标注位置渲染的内容 */
  renderLabel?: (city: GlobeCity, pos: { x: number; y: number; visible: boolean }) => ReactNode;
}

const DEG = Math.PI / 180;
const THETA = 0.3; // 固定倾角
/** canvas 2D 用不了 CSS 变量。浅底用深墨点,实景压暗后用宣纸色点 */
const INK = "31,21,18";
const RICE = "243,236,224";
const VERMILION = "216,67,58";
const IDLE_SPIN = 0.0026;
const R_NORM = 0.475; // 球半径占画布比例
/** 聚焦时锚点停在正面偏左(弧度):正下方是居中 CTA 的领地,
    偏转让标注落在中部偏左、CTA 之外;另一城的空心圈对称落在右侧,
    两者之间的航迹弧正好横过球面(贯通意象)。 */
const FOCUS_OFFSET = -1.0;

type V3 = [number, number, number];

function latLon3D(lat: number, lon: number): V3 {
  const la = lat * DEG;
  const lo = lon * DEG - Math.PI;
  const cl = Math.cos(la);
  return [-cl * Math.cos(lo), Math.sin(la), cl * Math.sin(lo)];
}

/** 绕 Y 轴转 phi、绕 X 轴倾 theta 后的坐标(rz>0 为正面) */
function rotate(p: V3, phi: number, theta: number): V3 {
  const [x, y, z] = p;
  const cy = Math.cos(phi), sy = Math.sin(phi);
  const cx = Math.cos(theta), sx = Math.sin(theta);
  const rx = cy * x + sy * z;
  const ry = sy * sx * x + cx * y - cy * sx * z;
  const rz = -sy * cx * x + sx * y + cy * cx * z;
  return [rx, ry, rz];
}

/** 让某锚点转到正面的 phi 目标(rz 最大):phi = atan2(-x, z) */
function phiForAnchor(p: V3): number {
  return Math.atan2(-p[0], p[2]);
}

/** 抽象「群岛」掩码:确定性正弦叠加,不对应任何真实地理 */
function islandMask(x: number, y: number, z: number): number {
  return (
    Math.sin(2.7 * x + 1.3) +
    Math.sin(3.1 * y + 2.9) +
    Math.sin(2.3 * z + 4.1) +
    Math.sin(4.3 * x * y + 1.0) +
    Math.sin(3.9 * y * z + 3.3) +
    Math.sin(4.7 * z * x + 0.6)
  );
}

/** 城市虚拟锚点:同纬度、经度均匀拉远(2 城 ≈ 130°)。
    高纬度(50°)让锚点投影在露出半球的上部 —— 标注更靠上。 */
function anchorFor(i: number, n: number): V3 {
  const lng = (i * 360) / Math.max(n, 2) * 0.72;
  return latLon3D(50, lng);
}

interface DotSpec {
  p: V3;
  size: number;
  alpha: number;
}

/** 预生成点阵:斐波那契球面 + 群岛掩码 + 经纬网点(全部确定性) */
function buildDots(): DotSpec[] {
  const dots: DotSpec[] = [];
  const N = 2400;
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y = 1 - (2 * (i + 0.5)) / N;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const th = golden * i;
    const p: V3 = [Math.cos(th) * r, y, Math.sin(th) * r];
    const m = islandMask(p[0], p[1], p[2]);
    if (m > 0.9) {
      dots.push({ p, size: 1.35, alpha: 1 }); // 「岛屿」密点
    } else if (i % 6 === 0) {
      dots.push({ p, size: 0.9, alpha: 0.45 }); // 稀疏「海面」基底点
    }
  }
  // 经纬网:赤道 + ±35° 纬线 + 3 条经线(细密小点,读作 graticule)
  const rings: Array<{ lat?: number; lng?: number }> = [
    { lat: 0 }, { lat: 35 }, { lat: -35 },
    { lng: 0 }, { lng: 60 }, { lng: 120 },
  ];
  for (const ring of rings) {
    for (let i = 0; i < 150; i++) {
      const t = (i / 150) * 360 - 180;
      const p = ring.lat !== undefined ? latLon3D(ring.lat, t) : latLon3D(t / 2, ring.lng ?? 0);
      dots.push({ p, size: 0.6, alpha: 0.3 });
    }
  }
  return dots;
}

/** 两锚点间的球面插值(slerp)航迹弧 */
function arcPoints(a: V3, b: V3, steps = 46): V3[] {
  const dot = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  const omega = Math.acos(dot);
  const so = Math.sin(omega) || 1;
  const pts: V3[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const k1 = Math.sin((1 - t) * omega) / so;
    const k2 = Math.sin(t * omega) / so;
    pts.push([a[0] * k1 + b[0] * k2, a[1] * k1 + b[1] * k2, a[2] * k1 + b[2] * k2]);
  }
  return pts;
}

export function DestinationGlobe({
  cities,
  focusId,
  tone = "ink",
  className,
  renderLabel,
}: DestinationGlobeProps): ReactNode {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  const focusCity = cities.find((c) => c.id === focusId) ?? null;
  const focusIndex = cities.findIndex((c) => c.id === focusId);
  const [labelPos, setLabelPos] = useState<{ x: number; y: number; visible: boolean } | null>(null);

  const dots = useMemo(buildDots, []);
  const anchors = useMemo(
    () => cities.map((_, i) => anchorFor(i, cities.length)),
    [cities]
  );
  const arc = useMemo(
    () => (anchors.length >= 2 ? arcPoints(anchors[0], anchors[1]) : []),
    [anchors]
  );

  // rAF 循环读最新 focus / tone,不重建画布
  const focusIdxRef = useRef(focusIndex);
  focusIdxRef.current = focusIndex;
  const toneRef = useRef(tone);
  toneRef.current = tone;

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(1.5, window.devicePixelRatio || 1);
    let size = wrap.offsetWidth;
    let cutoffY = Infinity; // 画布坐标系里视口底缘的位置(下方 52% 被裁,不必画)
    const applySize = () => {
      size = wrap.offsetWidth;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      const top = wrap.getBoundingClientRect().top;
      cutoffY = (window.innerHeight - top) * dpr;
    };
    applySize();
    window.addEventListener("resize", applySize);

    let phi = 0.9; // 初始略偏,让首次转动有行程感
    let frame = 0;

    let frameCount = 0;
    const tick = () => {
      // 入场动画期间 wrap 在位移,每 15 帧刷新一次视口裁剪线足够
      if (frameCount++ % 15 === 0) {
        const top = wrap.getBoundingClientRect().top;
        cutoffY = (window.innerHeight - top) * dpr;
      }
      const fi = focusIdxRef.current;
      if (fi >= 0 && anchors[fi]) {
        // forward-only:永远沿正方向追目标 → 换城市时「继续转」而非回头
        const target = phiForAnchor(anchors[fi]) + FOCUS_OFFSET;
        const d = (((target - phi) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        if (d > 0.0006) phi += Math.min(d, d * 0.038 + 0.0008);
      } else if (!reduced) {
        phi += IDLE_SPIN;
      }

      const c = (size * dpr) / 2;
      const R = size * dpr * R_NORM;
      ctx.clearRect(0, 0, size * dpr, size * dpr);

      // 球缘细圈
      const ink = toneRef.current === "rice" ? RICE : INK;
      ctx.beginPath();
      ctx.arc(c, c, R, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${ink},0.16)`;
      ctx.lineWidth = dpr;
      ctx.stroke();

      // 点阵(仅正面 + 视口内)
      for (const d of dots) {
        const [rx, ry, rz] = rotate(d.p, phi, THETA);
        if (rz <= 0.02) continue;
        const py = c - ry * R;
        if (py > cutoffY) continue;
        const a = d.alpha * (0.18 + 0.55 * rz);
        ctx.beginPath();
        ctx.arc(c + rx * R, py, d.size * dpr, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${ink},${a.toFixed(3)})`;
        ctx.fill();
      }

      // 城市间航迹弧
      for (let i = 0; i < arc.length; i += 2) {
        const [rx, ry, rz] = rotate(arc[i], phi, THETA);
        if (rz <= 0.03) continue;
        ctx.beginPath();
        ctx.arc(c + rx * R, c - ry * R, 1.2 * dpr, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${VERMILION},${(0.32 + 0.48 * rz).toFixed(3)})`;
        ctx.fill();
      }

      // 城市锚点:未选中 = 空心红圈;选中 = 不画(HTML 标注端点是唯一红点)
      anchors.forEach((p, i) => {
        if (i === fi) return;
        const [rx, ry, rz] = rotate(p, phi, THETA);
        if (rz <= 0.03) return;
        const x = c + rx * R;
        const y = c - ry * R;
        ctx.beginPath();
        ctx.arc(x, y, 4.5 * dpr, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${VERMILION},${(0.45 + 0.5 * rz).toFixed(3)})`;
        ctx.lineWidth = 1.4 * dpr;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y, 1.4 * dpr, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${VERMILION},${(0.4 + 0.4 * rz).toFixed(3)})`;
        ctx.fill();
      });

      // HTML 标注位置(归一化到 wrap)
      if (fi >= 0 && anchors[fi]) {
        const [rx, ry, rz] = rotate(anchors[fi], phi, THETA);
        setLabelPos({
          x: 0.5 + rx * R_NORM,
          y: 0.5 - ry * R_NORM,
          visible: rz > 0.05,
        });
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    requestAnimationFrame(() => (canvas.style.opacity = "1"));

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", applySize);
    };
  }, [reduced, dots, anchors, arc]);

  return (
    <div ref={wrapRef} className={`relative ${className ?? ""}`}>
      <canvas
        ref={canvasRef}
        aria-hidden
        className="h-full w-full"
        style={{ aspectRatio: "1 / 1", opacity: 0, transition: "opacity 0.8s ease" }}
      />
      {focusCity && labelPos && renderLabel && renderLabel(focusCity, labelPos)}
    </div>
  );
}
