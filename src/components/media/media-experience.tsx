"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { CloudCorner, MeanderRule, Seal } from "@/components/ornament";
import { Nav } from "@/components/nav";
import {
  NATIONAL_MEDIA,
  WECHAT_COVERAGE,
  type MediaCoverageItem,
} from "@/data/media-coverage";
import { useLocale } from "@/i18n/LocaleProvider";
import { ui, t } from "@/i18n/ui";
import { EASE_OUT_EXPO } from "@/lib/motion";

// ============================================================
// MediaExperience — 老报纸剪报式媒体关注页
// ============================================================

function MountainWatermark(): ReactNode {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute bottom-0 right-0 w-[min(52vw,420px)] opacity-[0.07]"
      viewBox="0 0 420 180"
      fill="none"
    >
      <path
        d="M0 180 L80 95 L140 130 L220 40 L300 110 L380 60 L420 90 L420 180 Z"
        fill="var(--ink)"
      />
      <path
        d="M0 180 L60 120 L120 145 L200 75 L280 125 L360 85 L420 110 L420 180 Z"
        fill="var(--ink)"
        opacity="0.55"
      />
    </svg>
  );
}

function NewspaperFrame({ children }: { children: ReactNode }): ReactNode {
  return (
    <div className="relative">
      <CloudCorner place="tl" size={56} color="var(--cinnabar)" opacity={0.55} className="absolute -left-1 -top-1" />
      <CloudCorner place="tr" size={56} color="var(--cinnabar)" opacity={0.55} className="absolute -right-1 -top-1" />
      <CloudCorner place="bl" size={56} color="var(--cinnabar)" opacity={0.55} className="absolute -bottom-1 -left-1" />
      <CloudCorner place="br" size={56} color="var(--cinnabar)" opacity={0.55} className="absolute -bottom-1 -right-1" />
      <div
        className="relative overflow-hidden"
        style={{
          border: "2px solid color-mix(in srgb, var(--cinnabar) 72%, transparent)",
          boxShadow:
            "inset 0 0 0 4px var(--rice), inset 0 0 0 5px color-mix(in srgb, var(--cinnabar) 35%, transparent)",
          background: "linear-gradient(165deg, #faf6ee 0%, #f0e6d4 48%, #ebe0cf 100%)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function ClippingMockup({ item }: { item: MediaCoverageItem }): ReactNode {
  const { locale, tr } = useLocale();
  const isChinaDaily = item.id.includes("china-daily");

  return (
    <div
      className="relative flex h-full min-h-[240px] flex-col bg-[#f7f3ea] p-4 sm:min-h-[280px] sm:p-5"
      style={{
        boxShadow: "inset 0 0 0 1px rgba(13,10,8,0.06), 4px 8px 24px -6px rgba(13,10,8,0.18)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(13,10,8,0.5) 27px, rgba(13,10,8,0.5) 28px)",
        }}
        aria-hidden
      />

      {isChinaDaily ? (
        <>
          <p
            className={`relative border-b-2 border-ink pb-2 text-center brush tracking-[0.08em] text-ink ${
              locale === "zh"
                ? "text-[22px] sm:text-[24px]"
                : "text-[22px] sm:text-[26px]"
            }`}
          >
            {locale === "zh" ? "中国日报" : "CHINA DAILY"}
          </p>
          <p
            className={`relative mt-3 kai leading-snug text-ink ${
              locale === "zh"
                ? "text-[17px] sm:text-[18px]"
                : "text-[16px] sm:text-[17px]"
            }`}
          >
            {tr(item.headline)}
          </p>
        </>
      ) : (
        <>
          <p className="relative text-center font-serif text-[13px] font-semibold tracking-[0.2em] text-cinnabar">
            {tr(item.source)}
          </p>
          <p className="relative mt-3 font-serif text-[16px] font-medium leading-snug text-ink">
            {tr(item.headline)}
          </p>
        </>
      )}

      {item.image && (
        <div className="relative mt-4 overflow-hidden border border-ink/10 bg-paper">
          <div className="aspect-[16/10] w-full">
            <img
              src={item.image}
              alt=""
              className="h-full w-full object-cover"
              style={{ filter: "contrast(1.02) saturate(0.92)" }}
            />
          </div>
          <p className="px-2 py-1 text-[9px] text-ink-faint">
            {t(ui.mediaPhotoCaption, locale)}
          </p>
        </div>
      )}

      <div className="relative mt-auto space-y-1.5 pt-4 opacity-70">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-[5px] rounded-full bg-ink/12"
            style={{ width: `${88 - i * 12}%` }}
          />
        ))}
      </div>
    </div>
  );
}

function FeaturedReport({ item, index }: { item: MediaCoverageItem; index: number }): ReactNode {
  const { locale, tr } = useLocale();

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-6%" }}
      transition={{ duration: 0.7, ease: EASE_OUT_EXPO, delay: index * 0.08 }}
      className="relative"
    >
      <NewspaperFrame>
        <MountainWatermark />
        <span
          className="absolute right-0 top-6 z-10 bg-cinnabar px-2 py-3 text-[11px] tracking-[0.22em] text-rice-text shadow-md"
          style={{ writingMode: "vertical-rl" }}
        >
          {t(ui.mediaFeaturedRibbon, locale)}
        </span>

        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="group relative grid md:grid-cols-[1.05fr_1fr]"
        >
          <div className="border-b border-ink/8 p-4 sm:p-6 md:border-b-0 md:border-r">
            <ClippingMockup item={item} />
          </div>

          <div className="flex flex-col justify-center px-6 py-8 pr-10 sm:px-8 sm:py-10">
            <p className="font-serif text-[13px] tracking-[0.12em] text-ink-dim">
              {tr(item.source)}
            </p>
            <h2 className="mt-3 font-serif text-[clamp(20px,2.8vw,26px)] font-semibold leading-snug text-ink">
              {tr(item.headline)}
            </h2>
            <p className="datum mt-3 text-[11px] text-ink-faint">{item.date}</p>
            <p className="kai mt-5 text-[14px] leading-[1.9] text-ink-dim">
              {tr(item.summary)}
            </p>
            <span className="mt-7 inline-flex items-center gap-2 text-[13px] tracking-[0.1em] text-cinnabar transition-colors group-hover:text-cinnabar-deep">
              {t(ui.spotReadArticle, locale)} →
            </span>
          </div>
        </a>
      </NewspaperFrame>
    </motion.article>
  );
}

function WechatClipping({ item }: { item: MediaCoverageItem }): ReactNode {
  const { locale, tr } = useLocale();

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      className="group relative block overflow-hidden bg-[#faf6ee] transition-transform duration-300 hover:-translate-y-0.5"
      style={{
        border: "1px solid color-mix(in srgb, var(--cinnabar) 28%, transparent)",
        boxShadow: "0 12px 32px -18px rgba(13,10,8,0.35)",
      }}
    >
      {item.image && (
        <div className="aspect-[16/9] overflow-hidden border-b border-ink/8">
          <img
            src={item.image}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        </div>
      )}
      <div className="p-4">
        <p className="en-caption text-[9px] uppercase tracking-[0.16em] text-cinnabar">
          {tr(item.source)}
        </p>
        <p className="mt-2 font-serif text-[14px] leading-snug text-ink">
          {tr(item.headline)}
        </p>
        <p className="kai mt-2 line-clamp-2 text-[11px] leading-relaxed text-ink-faint">
          {tr(item.summary)}
        </p>
        <span className="mt-3 inline-block text-[11px] text-ink-dim group-hover:text-cinnabar">
          {t(ui.spotReadArticle, locale)} →
        </span>
      </div>
    </a>
  );
}

export function MediaExperience(): ReactNode {
  const { locale } = useLocale();

  return (
    <div
      className="relative min-h-[100svh] bg-rice"
      style={{
        backgroundImage:
          "linear-gradient(0deg, rgba(13,10,8,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(13,10,8,0.02) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 60% at 50% -10%, rgba(210,31,46,0.04), transparent 55%)",
        }}
      />

      <Nav tone="ink" mapHref="/" />

      <main className="relative mx-auto max-w-[1100px] px-6 pb-20 pt-28 sm:px-10 sm:pt-32">
        <div className="flex flex-col items-center text-center">
          <Seal text={t(ui.mediaSeal, locale)} size={32} color="var(--cinnabar)" />
          <h1 className="brush mt-4 text-[clamp(32px,5vw,48px)] text-ink">
            {t(ui.mediaTitle, locale)}
          </h1>
          <p className="plaque-text mt-2 text-[13px] text-ink-faint">
            {t(ui.mediaTitleEn, locale)}
          </p>
          <p className="kai mx-auto mt-5 max-w-[640px] text-[15px] leading-[1.9] text-ink-dim">
            {t(ui.mediaIntro, locale)}
          </p>
          <Link
            href="/"
            className="rule-hover kai mt-6 inline-block text-[13px] tracking-[0.14em] text-ink-dim transition-colors hover:text-cinnabar"
          >
            ← {t(ui.mediaBack, locale)}
          </Link>
        </div>

        <div className="mt-14 space-y-10 sm:mt-16">
          {NATIONAL_MEDIA.map((item, i) => (
            <FeaturedReport key={item.id} item={item} index={i} />
          ))}
        </div>

        <div className="mt-16 flex items-center gap-4">
          <div className="h-px flex-1 bg-rule" />
          <p className="plaque-text text-[11px] text-ink-faint">
            {t(ui.mediaMore, locale)}
          </p>
          <div className="h-px flex-1 bg-rule" />
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {WECHAT_COVERAGE.map((item) => (
            <WechatClipping key={item.id} item={item} />
          ))}
        </div>
      </main>

      <MeanderRule tone="cinnabar" />
      <p className="datum pb-8 text-center text-[10px] tracking-[0.18em] text-ink-faint">
        {t(ui.mediaArchiveFooter, locale)}
      </p>
    </div>
  );
}
