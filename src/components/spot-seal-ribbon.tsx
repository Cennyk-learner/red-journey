"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { sealText } from "@/lib/seal-text";

interface SpotSealRibbonProps {
  nameZh: string;
  className?: string;
}

/** 照片角标朱红签 — 不参与 layout morph,避免关闭时乱跳 */
export function SpotSealRibbon({
  nameZh,
  className = "",
}: SpotSealRibbonProps): ReactNode {
  const text = sealText(nameZh);
  return (
    <div
      className={`absolute left-0 top-2 z-10 bg-cinnabar px-1 py-1.5 shadow-md ${className}`}
      style={{ borderRight: "2px solid rgba(224,184,78,0.45)" }}
    >
      <span className="vertical font-serif text-[12px] tracking-[0.1em] text-rice-text">
        {text}
      </span>
    </div>
  );
}
