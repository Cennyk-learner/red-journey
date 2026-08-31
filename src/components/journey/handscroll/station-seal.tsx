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

/** Map card-oriented imageFocus into seal-safe framing (head below stamp). */
function sealBackgroundPosition(imageFocus?: string): string {
  if (!imageFocus) return "50% 28%";
  const match = imageFocus.trim().match(/^([\d.]+%)\s+([\d.]+%)$/);
  if (!match) return imageFocus;
  const y = Number.parseFloat(match[2]);
  // Top-pinned focuses put faces under the seal — nudge downward for this card.
  if (y <= 12) return `${match[1]} 28%`;
  return imageFocus;
}

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
      <div
        className="relative z-[1] flex items-center"
        style={{
          flexDirection: side === "above" ? "column-reverse" : "column",
          gap: 14,
        }}
      >
        {/* 钤印 — keep above the silhouette so the stamp never covers faces */}
        <motion.span
          initial={false}
          animate={active ? { scale: 1, opacity: 1 } : { scale: 1.25, opacity: 0.28 }}
          transition={{ type: "spring", stiffness: 320, damping: 20 }}
          className="relative z-[2] block"
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

        {/* 题签 + 淡影：剪影只叠在题签区，避开朱砂钤印 */}
        <motion.div
          initial={false}
          animate={
            active
              ? { opacity: 1, y: 0 }
              : { opacity: 0, y: side === "above" ? 8 : -8 }
          }
          transition={{ duration: 0.5, delay: 0.18, ease: "easeOut" }}
          className="relative flex flex-col items-center gap-2"
        >
          {photo && (
            <span
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 -z-0 -translate-x-1/2 -translate-y-1/2"
              style={{
                width: 200,
                height: 220,
                backgroundImage: bgStack(photo),
                backgroundSize: "cover",
                backgroundPosition: sealBackgroundPosition(spot.imageFocus),
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
          <span
            className="relative z-[1] vertical font-serif text-[15px] font-medium text-ink"
            style={{ maxHeight: 200 }}
          >
            {spot.name.zh}
          </span>
          <span className="relative z-[1] en-caption max-w-[11rem] text-center text-[10px] leading-snug text-ink-faint">
            {spot.name.en}
          </span>
        </motion.div>
      </div>
    </button>
  );
}
