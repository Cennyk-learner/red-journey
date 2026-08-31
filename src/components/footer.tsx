"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Logotype, MeanderRule } from "@/components/ornament";
import { NATIONAL_MEDIA } from "@/data/media-coverage";
import { useLocale } from "@/i18n/LocaleProvider";
import { ui, t } from "@/i18n/ui";

export function Footer(): ReactNode {
  const { locale } = useLocale();
  const chinaDaily = NATIONAL_MEDIA.find((m) => m.id === "china-daily-2026");
  return (
    <footer className="bg-rice">
      <MeanderRule tone="cinnabar" />
      <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-5 px-6 py-12 sm:flex-row sm:items-center sm:px-10">
        <div className="flex items-center gap-4">
          <Logotype size={22} tone="ink" still />
          <span className="kai text-[11px] tracking-[0.16em] text-ink-faint">Red Journey</span>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          {chinaDaily && (
            <Link
              href="/media"
              className="rule-hover kai text-[12px] tracking-[0.14em] text-ink-dim transition-colors hover:text-cinnabar"
            >
              {t(ui.footerPress, locale)} →
            </Link>
          )}
          <p className="kai text-[11px] tracking-[0.1em] text-ink-faint">
            &copy; 2026 {t(ui.footerOrg, locale)} ·{" "}
            {t(ui.footerRights, locale)}
          </p>
        </div>
      </div>
    </footer>
  );
}
