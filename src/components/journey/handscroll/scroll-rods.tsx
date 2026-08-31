"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

// ============================================================
// 轴杆 ScrollRods —— 长卷两端的木轴
//
// 进场时两杆从合拢状态向左右分离,把绢面揭开。
// 杆身是深木色圆柱(渐变模拟体积),两端装琉璃黄的轴头。
// 开卷动画只播一次,播完左杆钉在卷首、右杆钉在卷尾,
// 随卷面一起横移 —— 它们本来就是卷的一部分。
// ============================================================

interface ScrollRodsProps {
  /** 卷面总宽(px) */
  scrollWidth: number;
  /** 卷面高度(px) */
  height: number;
  /** 开卷进度 0(合拢)..1(完全展开),由父级驱动 */
  progress: number;
}

function Rod({ height, side }: { height: number; side: "left" | "right" }): ReactNode {
  return (
    <div
      className="relative"
      style={{
        width: 22,
        height,
        background:
          "linear-gradient(to right, #1a1009 0%, #4a3423 18%, #6b4e33 50%, #3a2a1c 82%, #140d07 100%)",
        boxShadow: "0 4px 18px rgba(0,0,0,0.5)",
      }}
    >
      {/* 轴头 */}
      {(["top", "bottom"] as const).map((end) => (
        <div
          key={end}
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            [end]: -14,
            width: 30,
            height: 16,
            background:
              "linear-gradient(to right, #8a6a22 0%, #e0b84e 40%, #c89b3c 60%, #6b4e18 100%)",
            borderRadius: "3px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
          }}
        />
      ))}
      {/* 杆身中线高光 */}
      <div
        aria-hidden
        className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2"
        style={{ background: "rgba(224,184,78,0.18)" }}
      />
    </div>
  );
}

export function ScrollRods({
  scrollWidth,
  height,
  progress,
}: ScrollRodsProps): ReactNode {
  // 合拢时两杆都挤在卷面中央;展开后分别钉在卷首与卷尾
  const center = scrollWidth / 2;
  const leftX = center - progress * center;
  const rightX = center + progress * (scrollWidth - center);

  return (
    <>
      <motion.div
        className="absolute top-0 z-20"
        style={{ left: 0, x: leftX - 11 }}
        initial={false}
      >
        <Rod height={height} side="left" />
      </motion.div>
      <motion.div
        className="absolute top-0 z-20"
        style={{ left: 0, x: rightX - 11 }}
        initial={false}
      >
        <Rod height={height} side="right" />
      </motion.div>
    </>
  );
}
