"use client";

import { motion } from "motion/react";
import { useId, type ReactNode } from "react";
import {
  LOGOTYPE_GLYPHS,
  LOGOTYPE_VIEWBOX,
} from "@/lib/logotype-paths";
import { useReducedMotion } from "@/lib/motion";

// ============================================================
// 站点徽记 Logotype —「红色足迹」双钩填墨
//
// 字形是马善政毛笔楷书的真实轮廓(由 scripts/build-fonts.py 提取),
// 不是 webfont 渲染 —— 因为要拿到 path 才能做书写动效。
//
// 动效取「双钩填墨」这一传统:先用细线把字的轮廓描一遍(双钩),
// 描完再把墨填进去。逐字 stagger,四个字依次写完。
// 描边用 vector-effect="non-scaling-stroke",这样无论徽记缩到
// 导航栏的多小,钩线始终是 1 物理像素的细线。
// ============================================================

const [, , VB_W, VB_H] = LOGOTYPE_VIEWBOX.split(" ").map(Number);
const ASPECT = VB_W / VB_H;

/** 每字的描边时长与间隔 */
const TRACE_DURATION = 0.85;
const TRACE_STAGGER = 0.26;

type Tone = "ink" | "rice";

const TONES: Record<Tone, { fill: string; trace: string }> = {
  ink: { fill: "var(--ink)", trace: "var(--cinnabar)" },
  rice: { fill: "var(--rice-text)", trace: "var(--glaze-bright)" },
};

interface LogotypeProps {
  /** 徽记高度(px),宽度按字形比例自动 */
  size?: number;
  tone?: Tone;
  /** 关掉书写动效,直接呈现填墨完成态 */
  still?: boolean;
  delay?: number;
  className?: string;
}

export function Logotype({
  size = 34,
  tone = "ink",
  still = false,
  delay = 0,
  className,
}: LogotypeProps): ReactNode {
  const uid = useId().replace(/:/g, "");
  const reduced = useReducedMotion();
  const spec = TONES[tone];
  const write = !still && !reduced;

  return (
    <svg
      className={className}
      height={size}
      width={size * ASPECT}
      viewBox={LOGOTYPE_VIEWBOX}
      role="img"
      aria-label="红色足迹"
    >
      {LOGOTYPE_GLYPHS.map((glyph, i) => {
        const start = delay + i * TRACE_STAGGER;
        return (
          <g
            key={`${uid}-${glyph.char}`}
            transform={`translate(${glyph.x}, 0) scale(1, -1)`}
          >
            {/* 双钩:轮廓细线被描出来 */}
            {write && (
              <motion.path
                d={glyph.d}
                fill="none"
                stroke={spec.trace}
                strokeWidth={0.9}
                vectorEffect="non-scaling-stroke"
                pathLength={1}
                strokeDasharray={1}
                initial={{ strokeDashoffset: 1, opacity: 1 }}
                animate={{ strokeDashoffset: 0, opacity: 0 }}
                transition={{
                  strokeDashoffset: {
                    duration: TRACE_DURATION,
                    delay: start,
                    ease: "easeInOut",
                  },
                  opacity: {
                    duration: 0.5,
                    delay: start + TRACE_DURATION * 0.85,
                  },
                }}
              />
            )}

            {/* 填墨:钩完之后墨色渗进轮廓 */}
            <motion.path
              d={glyph.d}
              fill={spec.fill}
              initial={write ? { opacity: 0 } : false}
              animate={write ? { opacity: 1 } : undefined}
              transition={
                write
                  ? {
                      duration: 0.55,
                      delay: start + TRACE_DURATION * 0.6,
                      ease: "easeOut",
                    }
                  : undefined
              }
            />
          </g>
        );
      })}
    </svg>
  );
}
