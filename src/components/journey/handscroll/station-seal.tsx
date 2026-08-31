"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { Seal } from "@/components/ornament";
import { useLocale } from "@/i18n/LocaleProvider";
import { bgStack } from "@/lib/images";
import { sealText } from "@/lib/seal-text";
import { getCity } from "@/data/cities";
import type { Spot } from "@/data/types";

// ============================================================
// 站点 StationSeal —— 淡影剪影 + 朱砂钤印 + 竖排题签
// ============================================================

interface StationSealProps {
  spot: Spot;
  side: "above" | "below";
  active?: boolean;
  onOpen?: (spotId: string) => void;
}

export function StationSeal({
  spot,
  side,
  active = true,
  onOpen,
}: StationSealProps): ReactNode {
  const { tr } = useLocale();
  const city = getCity(spot.cityId);
  const photo =
    spot.images[0] ?? city?.sceneryImage ?? city?.heroImage ?? "";

  return (
    <button
      type="button"
      data-station-seal
      onClick={(e) => {
        e.stopPropagation();
        onOpen?.(spot.id);
      }}
      className="group relative text-left"
      style={{ width: 220 }}
      aria-label={tr(spot.name)}
    >
      {/* 淡影剪影:小卡弹出后仍保留,与题跋卡主图分层呈现 */}
      {photo && (
        <span
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[42%] -z-0 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: 200,
            height: 240,
            backgroundImage: bgStack(photo),
            backgroundSize: "cover",
            backgroundPosition: spot.imageFocus ?? "center",
            opacity: active ? 0.5 : 0.18,
            filter: "grayscale(0.3) contrast(0.92) brightness(1.02)",
            WebkitMaskImage:
              "radial-gradient(ellipse 70% 65% at 50% 45%, #000 0%, #000 35%, transparent 78%)",
            maskImage:
              "radial-gradient(ellipse 70% 65% at 50% 45%, #000 0%, #000 35%, transparent 78%)",
            transition: "opacity 0.5s ease",
          }}
        />
      )}

      <div
        className="relative z-[1] flex items-center"
        style={{
          flexDirection: side === "above" ? "column-reverse" : "column",
          gap: 14,
        }}
      >
        {/* 钤印 */}
        <motion.span
          initial={false}
          animate={active ? { scale: 1, opacity: 1 } : { scale: 1.25, opacity: 0.28 }}
          transition={{ type: "spring", stiffness: 320, damping: 20 }}
          className="relative block"
          style={{ filter: "drop-shadow(0 3px 6px rgba(139,26,32,0.28))" }}
        >
          <Seal text={sealText(spot.name.zh)} size={64} carve="yin" />
          {active && (
            <motion.span
              initial={{ scale: 0.6, opacity: 0.55 }}
              animate={{ scale: 1.45, opacity: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="pointer-events-none absolute inset-0 border border-cinnabar"
            />
          )}
        </motion.span>

        {/* 题签:竖排中文独占一列,英文另起一行横排,绝不叠字 */}
        <motion.div
          initial={false}
          animate={
            active
              ? { opacity: 1, y: 0 }
              : { opacity: 0, y: side === "above" ? 8 : -8 }
          }
          transition={{ duration: 0.5, delay: 0.18, ease: "easeOut" }}
          className="flex flex-col items-center gap-2"
        >
          <span
            className="vertical font-serif text-[15px] font-medium text-ink"
            style={{ maxHeight: 200 }}
          >
            {spot.name.zh}
          </span>
          <span className="en-caption max-w-[11rem] text-center text-[10px] leading-snug text-ink-faint">
            {spot.name.en}
          </span>
        </motion.div>
      </div>
    </button>
  );
}
