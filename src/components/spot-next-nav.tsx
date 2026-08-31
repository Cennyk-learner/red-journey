"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { useLocale } from "@/i18n/LocaleProvider";
import { ui, t } from "@/i18n/ui";
import type { Spot } from "@/data/types";

// ============================================================
// SpotNextNav — 档案页底栏上一站 / 下一站
// 多层排版 + hover 朱红底线从左展开
// ============================================================

interface SpotNavItemProps {
  direction: "prev" | "next";
  spot: Spot | null;
  onClick: () => void;
}

function SpotNavItem({ direction, spot, onClick }: SpotNavItemProps): ReactNode {
  const { locale, tr } = useLocale();
  const isNext = direction === "next";
  const label = isNext ? t(ui.spotNext, locale) : t(ui.spotPrev, locale);
  const orderStr = spot
    ? String(spot.order).padStart(2, "0")
    : "—";

  return (
    <button
      type="button"
      disabled={!spot}
      onClick={onClick}
      className={`group relative flex flex-1 flex-col gap-1 px-6 py-5 text-left transition-colors enabled:hover:bg-white/[0.04] disabled:opacity-25 ${
        isNext ? "items-start" : "items-start"
      }`}
    >
      <span className="en-caption text-[10px] tracking-[0.22em] text-rice-faint">
        {label}
      </span>
      {spot ? (
        <>
          <span className="datum text-[13px] text-rice-faint">{orderStr}</span>
          <span className="font-serif text-[clamp(22px,3vw,32px)] font-medium tracking-[0.06em] text-rice-text">
            {tr(spot.name)}
          </span>
          <span className="en-caption flex items-center gap-2 text-[12px] text-rice-dim">
            {spot.name.en}
            {isNext ? (
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            ) : (
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            )}
          </span>
        </>
      ) : (
        <span className="font-serif text-lg text-rice-faint">—</span>
      )}
      <span
        aria-hidden
        className="absolute bottom-0 left-6 right-6 h-px origin-left scale-x-0 bg-cinnabar transition-transform duration-500 ease-out group-enabled:group-hover:scale-x-100"
      />
    </button>
  );
}

interface SpotNextNavBarProps {
  prev: Spot | null;
  next: Spot | null;
  onPrev: () => void;
  onNext: () => void;
}

export function SpotNextNavBar({
  prev,
  next,
  onPrev,
  onNext,
}: SpotNextNavBarProps): ReactNode {
  return (
    <div
      className="flex items-stretch border-t border-rule-invert"
      style={{ backgroundColor: "#0f0b09" }}
    >
      <SpotNavItem direction="prev" spot={prev} onClick={onPrev} />
      <div className="w-px bg-rule-invert" />
      <SpotNavItem direction="next" spot={next} onClick={onNext} />
    </div>
  );
}
