"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { MeanderRule, Seal } from "@/components/ornament";
import { useLocale } from "@/i18n/LocaleProvider";
import { ui, t } from "@/i18n/ui";

// ============================================================
// 卷末落款 Colophon
// 长卷走到头:先一道回纹收边,再是落款文字与两方印,
// 最后给「未完待续」的接续提示,引向影像区块。
// ============================================================

interface ColophonProps {
  /** 入画进度 0..1,由父级 ScrollTrigger 驱动 */
  progress?: number;
}

export function Colophon({
  progress = 1,
}: ColophonProps): ReactNode {
  const { locale } = useLocale();
  const on = progress > 0.35;

  return (
    <div className="flex h-full flex-col items-center justify-center px-16 text-center">
      <MeanderRule tone="cinnabar" className="w-40" />

      <motion.p
        initial={false}
        animate={on ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="brush mt-8 text-4xl text-ink"
      >
        {t(ui.mapToBeContinued, locale)}
      </motion.p>

      <motion.p
        initial={false}
        animate={on ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="kai mt-5 max-w-xs text-sm text-ink-dim"
      >
        {t(ui.scrollColophon, locale)}
      </motion.p>

      {/* 落款:年月 + 两方印(一名一闲) */}
      <motion.div
        initial={false}
        animate={on ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.2 }}
        transition={{ duration: 0.5, delay: 0.3, type: "spring", stiffness: 300, damping: 22 }}
        className="mt-10 flex items-end gap-4"
      >
        <div className="text-right">
          <p className="datum text-[10px] text-ink-faint">丙午年夏</p>
          <p className="datum mt-1 text-[10px] text-ink-faint">2026.07</p>
        </div>
        <Seal text="足迹" size={52} carve="yin" />
        <Seal text="贯通" size={40} carve="yang" />
      </motion.div>

      <motion.p
        initial={false}
        animate={on ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.6, delay: 0.45 }}
        className="en-caption mt-8 text-[10px] text-ink-faint"
      >
        {t(ui.filmScrollDown, locale)}
      </motion.p>
    </div>
  );
}
