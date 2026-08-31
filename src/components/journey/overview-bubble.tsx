"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { getCity } from "@/data/cities";
import { useLocale } from "@/i18n/LocaleProvider";
import { ui, t } from "@/i18n/ui";
import { SpotSealRibbon } from "@/components/spot-seal-ribbon";
import type { Spot } from "@/data/types";

const SOFT_EASE = [0.22, 1, 0.36, 1] as const;

export interface OverviewBubbleProps {
  spot: Spot;
  onDetail: () => void;
  onClose: () => void;
  morphingToArchive?: boolean;
}

export function OverviewBubble({
  spot,
  onDetail,
  onClose,
  morphingToArchive = false,
}: OverviewBubbleProps): ReactNode {
  const { locale, tr } = useLocale();
  const city = getCity(spot.cityId);
  const thumb = spot.images[0] ?? city?.sceneryImage ?? city?.heroImage ?? "";
  const orderStr = String(spot.order).padStart(2, "0");

  return (
    <motion.div
      data-overview-bubble
      role="dialog"
      aria-modal="true"
      aria-label={tr(spot.name)}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: morphingToArchive ? 0 : 1, y: morphingToArchive ? 6 : 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: morphingToArchive ? 0.22 : 0.55, ease: SOFT_EASE }}
      className="absolute z-30 w-[min(236px,70vw)]"
      style={{
        left: "calc(100% + 16px)",
        top: "50%",
        transform: "translateY(-50%)",
      }}
    >
      <div
        className="overflow-hidden rounded-[18px] border border-black/[0.06] bg-white/[0.96] shadow-[0_14px_36px_-10px_rgba(13,10,8,0.24)]"
      >
        <div className="relative aspect-[5/3] w-full overflow-hidden bg-paper">
          {thumb && (
            <img
              src={thumb}
              alt=""
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover"
              style={{
                objectPosition: spot.imageFocus ?? "50% 50%",
              }}
            />
          )}
          <SpotSealRibbon nameZh={spot.name.zh} />
        </div>

        <motion.div
          animate={{ opacity: morphingToArchive ? 0 : 1 }}
          transition={{ duration: 0.2 }}
          className="px-3.5 pt-2.5 pb-3.5"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="brush text-[16px] leading-snug tracking-[0.04em] text-ink">
                {tr(spot.name)}
              </h3>
              <p className="kai mt-0.5 text-[10px] leading-snug text-ink-faint">
                {spot.name.en}
              </p>
            </div>
            <span className="kai shrink-0 text-[10px] text-ink-faint">{orderStr}</span>
          </div>

          <p className="kai mt-2 text-[11px] leading-relaxed text-ink-dim line-clamp-2">
            {tr(spot.summary)}
          </p>

          {spot.tags && spot.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {spot.tags.slice(0, 3).map((tag, i) => (
                <span
                  key={i}
                  className="kai rounded-full border border-cinnabar/30 px-2 py-0.5 text-[10px] tracking-[0.08em] text-cinnabar"
                >
                  {tr(tag)}
                </span>
              ))}
            </div>
          )}

          {!morphingToArchive && (
            <button
              type="button"
              data-bubble-detail
              onClick={onDetail}
              className="kai mt-3 w-full rounded-[10px] bg-cinnabar py-2.5 text-[13px] tracking-[0.12em] text-rice-text transition-colors hover:bg-cinnabar-deep active:scale-[0.98]"
            >
              {t(ui.spotOverviewDetail, locale)}
            </button>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
