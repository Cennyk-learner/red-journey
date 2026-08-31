"use client";

import { ExternalLink } from "lucide-react";
import type { ReactNode } from "react";
import type { SpotPressLink } from "@/data/types";
import { useLocale } from "@/i18n/LocaleProvider";
import { ui, t } from "@/i18n/ui";

export function PressLinkCard({
  link,
  variant = "default",
}: {
  link: SpotPressLink;
  variant?: "default" | "featured" | "quote";
}): ReactNode {
  const { locale, tr } = useLocale();

  if (variant === "quote") {
    return (
      <a
        href={link.url}
        target="_blank"
        rel="noreferrer"
        className="group block border-l-2 border-cinnabar/50 pl-4 py-1 transition-colors hover:border-cinnabar"
      >
        {link.source && (
          <p className="font-serif text-[13px] font-semibold text-ink">
            {tr(link.source)}
          </p>
        )}
        <p className="mt-1 font-serif text-[15px] leading-snug text-ink-dim group-hover:text-ink">
          {tr(link.label)}
        </p>
        <span className="mt-2 inline-flex items-center gap-1 text-[12px] text-cinnabar/80 transition-colors group-hover:text-cinnabar">
          {t(ui.spotReadArticle, locale)}
          <ExternalLink className="h-3.5 w-3.5" />
        </span>
      </a>
    );
  }

  if (variant === "featured") {
    return (
      <a
        href={link.url}
        target="_blank"
        rel="noreferrer"
        className="group relative flex flex-col overflow-hidden rounded-xl border border-rule bg-gradient-to-br from-[#faf6ee] to-[#f3ebe0] p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-cinnabar/45 hover:shadow-md sm:p-5"
      >
        <span
          className="absolute right-3 top-3 rounded-sm border border-cinnabar/40 bg-cinnabar px-2 py-0.5 kai text-[10px] tracking-[0.14em] text-rice-text"
        >
          {t(ui.mediaPressBadge, locale)}
        </span>
        {link.source && (
          <p className="text-[10px] uppercase tracking-[0.14em] text-cinnabar">
            {tr(link.source)}
          </p>
        )}
        <p className="mt-2 font-serif text-[16px] font-medium leading-snug text-ink sm:text-[17px]">
          {tr(link.label)}
        </p>
        {link.summary && (
          <p className="kai mt-2 text-[12px] leading-[1.75] text-ink-dim line-clamp-3">
            {tr(link.summary)}
          </p>
        )}
        <span className="mt-4 inline-flex items-center gap-1.5 text-[12px] text-ink-faint transition-colors group-hover:text-cinnabar">
          {t(ui.spotReadArticle, locale)}
          <ExternalLink className="h-3.5 w-3.5" />
        </span>
      </a>
    );
  }

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noreferrer"
      className="group flex items-start gap-3 rounded-xl border border-dashed border-rule/80 bg-white/50 p-3.5 transition-all hover:-translate-y-0.5 hover:border-cinnabar/40 hover:bg-white"
    >
      <div className="min-w-0 flex-1">
        {link.source && (
          <p className="plaque-text text-[10px] text-cinnabar">
            {tr(link.source)}
          </p>
        )}
        <p className="mt-0.5 font-serif text-[13px] leading-snug text-ink">
          {tr(link.label)}
        </p>
      </div>
      <span className="flex shrink-0 items-center gap-1 text-[11px] text-ink-faint transition-colors group-hover:text-cinnabar">
        {t(ui.spotReadArticle, locale)}
        <ExternalLink className="h-3.5 w-3.5" />
      </span>
    </a>
  );
}
