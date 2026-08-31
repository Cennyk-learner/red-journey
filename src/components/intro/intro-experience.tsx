"use client";

import { motion, AnimatePresence } from "motion/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { DestinationGlobe, type GlobeCity } from "@/components/intro/destination-globe";
import { InkBackdrop } from "@/components/intro/ink-backdrop";
import { MeanderRule } from "@/components/ornament";
import { CITIES } from "@/data/cities";
import { getSpotsByCity } from "@/data/spots";
import { useLocale } from "@/i18n/LocaleProvider";
import { ui, t } from "@/i18n/ui";
import { EASE_OUT_EXPO } from "@/lib/motion";
import { preloadImage, preloadJourneyChunks } from "@/lib/preload-journey";
import { bgStack } from "@/lib/images";
import type { City } from "@/data/types";

// ============================================================
// IntroExperience — 国博门面式开场
//
// 排版学国家博物馆官网:宣纸浅底 + 品牌居中立住 + 导语 + 选城展签,
// 不再用「中间一张大卡压在死黑底上」。
//
// 动效保留:
//   漂浮照片场(选城后外扩淡出)
//   点阵地球 + 选城联动转球
//   选城后水墨交融推入城市风景
//   CTA 常驻单元素、只换文字(避免重挂偏移)
// ============================================================

const GLOBE_CITIES: GlobeCity[] = CITIES.map((c) => ({
  id: c.id,
  coord: c.coord,
  labelZh: c.nameZh,
  labelEn: c.nameEn,
}));

const PhotoField = dynamic(
  () => import("@/components/intro/photo-field"),
  { ssr: false }
);

const ORDINALS = ["一", "二", "三", "四", "五", "六"];
const CN_COUNT = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];

function chapterName(city: City, locale: "zh" | "en"): string {
  if (locale === "zh") {
    const short = city.nameZh.split("·").pop()?.trim() ?? city.nameZh;
    return `${short}篇`;
  }
  const short = city.nameEn.split(",")[0]?.trim() ?? city.nameEn;
  return `The ${short} Chapter`;
}

function sitesCaption(count: number, locale: "zh" | "en"): string {
  if (locale === "zh") {
    const n = count >= 0 && count <= 10 ? CN_COUNT[count] : String(count);
    return `${n}处参访点`;
  }
  return `${count} sites on the route`;
}

interface IntroExperienceProps {
  onStart: (cityId: string) => void;
  /** 选城后实景压暗,通知外壳把导航切到反白 */
  onScenicChange?: (scenic: boolean) => void;
}

export function IntroExperience({
  onStart,
  onScenicChange,
}: IntroExperienceProps): ReactNode {
  const { locale, tr } = useLocale();
  const [focusId, setFocusId] = useState<string | null>(null);
  const [fieldReady, setFieldReady] = useState(false);

  useEffect(() => {
    const idle = (cb: () => void) => {
      if (typeof requestIdleCallback === "function") {
        requestIdleCallback(cb, { timeout: 2500 });
      } else {
        setTimeout(cb, 1600);
      }
    };
    const timer = window.setTimeout(() => {
      idle(() => {
        setFieldReady(true);
        preloadJourneyChunks();
      });
    }, 1500);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    onScenicChange?.(focusId !== null);
    if (!focusId) return;
    const city = CITIES.find((c) => c.id === focusId);
    preloadJourneyChunks();
    if (city) {
      preloadImage(city.sceneryImage ?? city.heroImage);
    }
  }, [focusId, onScenicChange]);

  const focusCity = CITIES.find((c) => c.id === focusId) ?? null;
  const scenic = focusCity !== null;
  const spotCount = focusCity ? getSpotsByCity(focusCity.id).length : 0;
  const backdropUrl = focusCity
    ? (focusCity.sceneryImage ?? focusCity.heroImage)
    : null;

  // 选城后:文字反白 + 局部暗晕托字(不用宣纸纱),风景全开保冲击感
  const dim = scenic ? "text-rice-dim" : "text-ink-dim";
  const faint = scenic ? "text-rice-faint" : "text-ink-faint";
  const solid = scenic ? "text-rice-text" : "text-ink";
  const typeGlow = scenic
    ? { textShadow: "0 1px 24px rgba(0,0,0,0.55), 0 0 2px rgba(0,0,0,0.45)" }
    : undefined;

  return (
    <div
      id="top"
      className={`relative h-[100svh] w-full overflow-hidden transition-colors duration-700 ${
        scenic ? "bg-ink" : "bg-rice"
      }`}
    >
      <InkBackdrop imageUrl={backdropUrl} className="z-0" />

      {fieldReady && (
        <PhotoField
          hidden={focusId !== null}
          className="z-[5] opacity-[0.42]"
        />
      )}

      {/* ===== 门面主体:品牌 → 导语 → 选城 ===== */}
      <div
        className={`relative z-20 mx-auto flex w-full max-w-[1100px] flex-col items-center px-6 pt-28 sm:px-10 sm:pt-32 ${
          scenic ? "pb-[34vh]" : "pb-[42vh]"
        }`}
      >
        {/* 实景时在文字簇背后压一枚暗晕:托字、不挡风景边缘 */}
        <AnimatePresence>
          {scenic && (
            <motion.div
              key="type-glow"
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
              className="pointer-events-none absolute inset-x-[-18%] top-[4%] bottom-[28%] -z-10"
              style={{
                background:
                  "radial-gradient(ellipse 68% 58% at 50% 40%, rgba(8,6,5,0.58) 0%, rgba(8,6,5,0.28) 42%, transparent 74%)",
              }}
            />
          )}
        </AnimatePresence>

        {/* 品牌立面 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE_OUT_EXPO, delay: 0.1 }}
          className="flex flex-col items-center text-center"
        >
          <p
            className={`plaque-text text-[11px] transition-colors duration-500 ${dim}`}
            style={typeGlow}
          >
            {t(ui.heroKicker, locale)}
          </p>
          <MeanderRule className="mt-3 w-36" tone="cinnabar" />
        </motion.div>

        {/* 导语 */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: EASE_OUT_EXPO, delay: 0.45 }}
          className="mt-10 max-w-xl text-center"
        >
          <h1
            className={`font-serif text-[clamp(1.65rem,3.6vw,2.35rem)] font-medium leading-[1.35] tracking-[0.12em] transition-colors duration-500 ${solid}`}
            style={typeGlow}
          >
            <span className="block">{t(ui.heroTitleLine1, locale)}</span>
            <span className="mt-1 block">{t(ui.heroTitleLine2, locale)}</span>
          </h1>
          <p
            className={`kai mx-auto mt-5 max-w-md text-[15px] transition-colors duration-500 ${dim}`}
            style={typeGlow}
          >
            {t(ui.heroSubtitle, locale)}
          </p>
        </motion.div>

        {/* 选城 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: EASE_OUT_EXPO, delay: 0.65 }}
          className="mt-12 w-full max-w-2xl"
        >
          <div className="mb-5 flex items-center justify-center gap-4">
            <span aria-hidden className="h-px w-10 bg-cinnabar/50" />
            <p className={`plaque-text text-[12px] transition-colors duration-500 ${solid}`} style={typeGlow}>
              {t(ui.introQuestion, locale)}
            </p>
            <span aria-hidden className="h-px w-10 bg-cinnabar/50" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {CITIES.map((city, i) => {
              const active = focusId === city.id;
              const count = getSpotsByCity(city.id).length;
              return (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => setFocusId(city.id)}
                  aria-pressed={active}
                  className="group relative overflow-hidden text-left transition-[box-shadow,transform] duration-500 ease-out"
                  style={{
                    background: "var(--rice)",
                    transform: active ? "translateY(-1px)" : "translateY(0)",
                    boxShadow: active
                      ? "inset 0 0 0 1px var(--cinnabar), 0 0 0 4px color-mix(in srgb, var(--cinnabar) 12%, transparent)"
                      : "inset 0 0 0 1px var(--rule-strong)",
                  }}
                >
                  <span
                    className="block h-32 w-full bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    style={{
                      backgroundImage: bgStack(city.heroImage),
                      backgroundColor: "var(--paper)",
                    }}
                  />
                  <span
                    aria-hidden
                    className="block h-px w-full transition-colors duration-500"
                    style={{
                      background: active ? "var(--cinnabar)" : "var(--rule-strong)",
                    }}
                  />
                  <span className="flex items-center justify-between gap-3 px-4 py-3.5">
                    <span className="min-w-0">
                      <span className="block truncate font-serif text-[15px] font-medium tracking-[0.12em] text-ink">
                        {tr({ zh: city.nameZh, en: city.nameEn })}
                      </span>
                      <span className="mt-1 block font-serif text-[13px] tracking-[0.1em] text-ink-dim">
                        {sitesCaption(count, locale)}
                      </span>
                    </span>
                    <span
                      className="brush shrink-0 text-[1.65rem] leading-none transition-colors duration-500"
                      style={{
                        color: active ? "var(--cinnabar)" : "var(--ink-faint)",
                      }}
                      aria-hidden
                    >
                      {ORDINALS[i] ?? ""}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* 启程 CTA */}
        <div className="relative z-20 flex justify-center">
          <AnimatePresence>
            {focusCity && (
              <motion.div
                key="cta"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.55, ease: EASE_OUT_EXPO, delay: 0.25 }}
                className="mt-9 flex flex-col items-center text-center"
              >
                <p className="plaque-text mb-3 flex items-center gap-2.5 text-[10px] text-rice-dim">
                  <span className="breathe inline-block h-1 w-1 bg-vermilion" />
                  {t(ui.ctaReady, locale)}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setFieldReady(false);
                    requestAnimationFrame(() => onStart(focusCity.id));
                  }}
                  className="group relative bg-cinnabar px-9 py-4 transition-colors duration-300 hover:bg-cinnabar-deep"
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-[5px] border"
                    style={{ borderColor: "rgba(224,184,78,0.42)" }}
                  />
                  <span className="relative flex items-baseline justify-center font-serif text-[15px] font-medium tracking-[0.26em] text-rice-text">
                    {t(ui.ctaStart, locale)}
                    <span className="relative ml-2.5 inline-grid overflow-hidden">
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.span
                          key={focusCity.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
                          className="brush col-start-1 row-start-1 text-xl tracking-normal"
                        >
                          {chapterName(focusCity, locale)}
                        </motion.span>
                      </AnimatePresence>
                    </span>
                  </span>
                </button>

                <Link
                  href="/media"
                  className="rule-hover mt-4 text-[11px] tracking-[0.12em] text-rice-dim transition-colors hover:text-rice-text"
                >
                  {t(ui.mediaNationalCta, locale)} →
                </Link>

                <p className="datum mt-3 text-[10px] text-rice-faint">
                  {`${sitesCaption(spotCount, locale)} · ${t(ui.ctaDepart, locale)}`}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 底部:点阵地球 — 选城后下移,避免被 CTA 挡住 */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[8] flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 160 }}
          animate={{
            opacity: 1,
            y: 0,
            translateY: scenic ? "66%" : "58%",
          }}
          transition={{
            opacity: { duration: 1.4, ease: EASE_OUT_EXPO, delay: 0.5 },
            y: { duration: 1.4, ease: EASE_OUT_EXPO, delay: 0.5 },
            translateY: { duration: 0.65, ease: EASE_OUT_EXPO },
          }}
          className="pointer-events-auto relative aspect-square w-[min(100vw,720px)]"
        >
          <div
            aria-hidden
            className="absolute inset-[-8%] rounded-full transition-[background] duration-700"
            style={{
              background: scenic
                ? "radial-gradient(circle at 50% 44%, rgba(13,10,8,0.88) 0%, rgba(13,10,8,0.55) 44%, rgba(13,10,8,0) 70%)"
                : "radial-gradient(circle at 50% 42%, rgba(255,252,246,0.72) 0%, rgba(243,236,224,0.35) 42%, rgba(243,236,224,0) 70%)",
            }}
          />
          <DestinationGlobe
            cities={GLOBE_CITIES}
            focusId={focusId}
            tone={scenic ? "rice" : "ink"}
            className="h-full w-full"
            renderLabel={(city, pos) =>
              pos.visible ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={city.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
                    className="absolute z-10"
                    style={{ left: `${pos.x * 100}%`, top: `${pos.y * 100}%` }}
                  >
                    <div className="flex -translate-x-full -translate-y-1/2 items-center pr-1">
                      <div className="flex items-center">
                        <span
                          className="relative z-[2] h-11 w-11 shrink-0 bg-cover bg-center"
                          style={{
                            backgroundImage: bgStack(
                              CITIES.find((c) => c.id === city.id)?.heroImage ??
                                CITIES[0].heroImage
                            ),
                            boxShadow: "0 0 0 1px rgba(224,184,78,0.5)",
                          }}
                        />
                        <span
                          className="relative -left-px py-1.5 pl-3.5 pr-3.5"
                          style={{
                            background:
                              "color-mix(in srgb, var(--ink-ground) 88%, transparent)",
                            border: "1px solid var(--rule-invert)",
                            backdropFilter: "blur(10px)",
                            WebkitBackdropFilter: "blur(10px)",
                          }}
                        >
                          <span className="block whitespace-nowrap font-serif text-[13px] font-medium tracking-[0.14em] text-rice-text">
                            {tr({ zh: city.labelZh, en: city.labelEn })}
                          </span>
                        </span>
                      </div>
                      <span
                        aria-hidden
                        className="ml-1.5 h-px w-8"
                        style={{
                          background:
                            "linear-gradient(to right, rgba(216,67,58,0.2), rgba(216,67,58,0.9))",
                        }}
                      />
                      <span
                        aria-hidden
                        className="h-1.5 w-1.5 shrink-0 bg-vermilion"
                        style={{ boxShadow: "0 0 0 4px rgba(216,67,58,0.18)" }}
                      />
                    </div>
                  </motion.div>
                </AnimatePresence>
              ) : null
            }
          />
        </motion.div>
      </div>
    </div>
  );
}
