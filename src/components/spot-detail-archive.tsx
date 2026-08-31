"use client";

import { AnimatePresence, motion, type Variants } from "motion/react";
import { ArrowRight, X } from "lucide-react";
import { PressLinkCard } from "@/components/press/press-link-card";
import { useRef, useEffect, useMemo, type ReactNode } from "react";
import { getAdjacentSpots, getSpot, resolveSpotImages } from "@/data/spots";
import { getCity } from "@/data/cities";
import { getTeamForCity } from "@/data/team";
import { useLocale } from "@/i18n/LocaleProvider";
import { ui, t, tf } from "@/i18n/ui";
import { EASE_OUT_EXPO } from "@/lib/motion";
import { bgStack } from "@/lib/images";
import { SpotSealRibbon } from "@/components/spot-seal-ribbon";
import type { SpotPanelPhase } from "@/components/spot-panel";

const CONTENT_STAGGER: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
};
const CONTENT_ITEM: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.48, ease: EASE_OUT_EXPO },
  },
};

interface SpotDetailArchiveProps {
  activeId: string | null;
  phase: SpotPanelPhase;
  onClose: () => void;
  onNavigate: (id: string) => void;
  onTransitionComplete: (target: "open" | "closed") => void;
}

export function SpotDetailArchive({
  activeId,
  phase,
  onClose,
  onNavigate,
  onTransitionComplete,
}: SpotDetailArchiveProps): ReactNode {
  const { locale, tr } = useLocale();
  const morphHandledRef = useRef(false);
  const closeAnimRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const spot = activeId ? getSpot(activeId) : null;
  const city = spot ? getCity(spot.cityId) : null;
  const { next } = activeId ? getAdjacentSpots(activeId) : { next: null };

  const spotImages = useMemo(() => (spot ? resolveSpotImages(spot) : []), [spot]);

  const heroImage = useMemo(() => {
    if (!spot) return "";
    return spotImages[0] ?? city?.sceneryImage ?? city?.heroImage ?? "";
  }, [spot, spotImages, city]);

  const teamMembers = useMemo(() => {
    if (!spot) return [];
    if (spot.cityId !== "guangan" && spot.cityId !== "baise") return [];
    return getTeamForCity(spot.cityId as "guangan" | "baise");
  }, [spot]);

  useEffect(() => {
    if (phase === "opening") {
      morphHandledRef.current = false;
      closeAnimRef.current = false;
    }
    if (phase === "closing") closeAnimRef.current = false;
  }, [phase, activeId]);

  useEffect(() => {
    const root = overlayRef.current;
    const scrollEl = scrollRef.current;
    if (!root || !scrollEl || phase !== "open") return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      scrollEl.scrollTop += e.deltaY;
    };

    root.addEventListener("wheel", onWheel, { passive: false });
    return () => root.removeEventListener("wheel", onWheel);
  }, [phase, activeId]);

  const visible = phase !== "closed" && spot;
  const showContent = phase === "open";
  const showExtras = phase === "open";

  const handleOverlayAnimComplete = () => {
    if (phase === "opening" && !morphHandledRef.current) {
      morphHandledRef.current = true;
      onTransitionComplete("open");
      return;
    }
    if (phase === "closing" && !closeAnimRef.current) {
      closeAnimRef.current = true;
      onTransitionComplete("closed");
    }
  };

  const overlayTransition =
    phase === "closing"
      ? { duration: 0.38, ease: EASE_OUT_EXPO }
      : { duration: 0.42, ease: EASE_OUT_EXPO };

  const cityShort = city
    ? locale === "zh"
      ? city.nameZh.replace(/\s*·\s*/g, " · ")
      : city.nameEn
    : "";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={overlayRef}
          className="fixed inset-0 z-[100]"
          style={{ pointerEvents: "auto" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === "closing" ? 0 : 1 }}
          transition={overlayTransition}
          onAnimationComplete={handleOverlayAnimComplete}
        >
          <div className="absolute inset-0 bg-[#0a0806]/88" aria-hidden />

          <div className="relative flex h-full items-center justify-center p-3 sm:p-6">
            <div
              className="relative flex w-full max-w-[960px] max-h-[min(92vh,900px)] flex-col overflow-hidden rounded-lg border border-rule-strong shadow-[0_40px_100px_-24px_rgba(0,0,0,0.65)] md:flex-row md:max-h-[min(88vh,820px)]"
              style={{
                background: "linear-gradient(145deg, #f9f3e8 0%, #ebe0cf 100%)",
              }}
            >
            {/* 左栏影像 — 仅主图,避免 3D 轮播溢出遮挡正文 */}
            <div
              className="relative shrink-0 overflow-hidden p-4 sm:p-5 md:w-[40%] md:p-6"
              style={{
                background:
                  "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(13,10,8,0.025) 2px, rgba(13,10,8,0.025) 4px)",
              }}
            >
              <div
                className="relative w-full overflow-hidden bg-paper shadow-[0_14px_36px_-10px_rgba(13,10,8,0.4)]"
                style={{
                  aspectRatio: "5 / 3",
                  border: "5px solid #faf6ee",
                  transform: showExtras ? "rotate(-1deg)" : "none",
                }}
              >
                {heroImage && (
                  <img
                    src={heroImage}
                    alt=""
                    draggable={false}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
                <SpotSealRibbon nameZh={spot.name.zh} />
              </div>
            </div>

            {/* 右栏正文 — 可滚动 */}
            <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-rule bg-paper/90 text-ink-dim transition-colors hover:border-cinnabar hover:text-ink sm:right-4 sm:top-4"
              >
                <X className="h-4 w-4" />
              </button>

              <motion.div
                ref={scrollRef}
                initial={false}
                animate={showContent ? "visible" : "hidden"}
                variants={CONTENT_STAGGER}
                className="flex-1 overflow-y-auto overscroll-contain px-5 pb-6 pt-10 sm:px-7 sm:pt-12"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                <motion.p
                  variants={CONTENT_ITEM}
                  className="datum text-[11px] tracking-[0.14em] text-ink-faint"
                >
                  {cityShort}
                  <span className="mx-2 text-cinnabar">·</span>
                  {tf(ui.spotStopLabel, locale, { n: spot.order })}
                </motion.p>

                <motion.h2
                  variants={CONTENT_ITEM}
                  className="brush mt-2 text-[clamp(28px,3.8vw,44px)] leading-[1.12] text-ink"
                >
                  {tr(spot.name)}
                </motion.h2>

                <motion.p
                  variants={CONTENT_ITEM}
                  className="en-title mt-2 text-[14px] text-ink-faint"
                >
                  {spot.name.en}
                </motion.p>

                <motion.p
                  variants={CONTENT_ITEM}
                  className="kai mt-1.5 text-[13px] text-cinnabar/90"
                >
                  {tr(spot.tagline)}
                </motion.p>

                {spot.tags && spot.tags.length > 0 && (
                  <motion.div variants={CONTENT_ITEM} className="mt-4 flex flex-wrap gap-2">
                    {spot.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="rounded-full border border-cinnabar/35 px-3 py-0.5 text-[10px] tracking-[0.1em] text-cinnabar"
                      >
                        {tr(tag)}
                      </span>
                    ))}
                  </motion.div>
                )}

                <motion.p
                  variants={CONTENT_ITEM}
                  className="kai mt-5 text-[14px] leading-[1.9] text-ink-dim"
                >
                  {tr(spot.summary)}
                </motion.p>

                {spot.body.map((section, i) => (
                  <motion.div key={i} variants={CONTENT_ITEM} className="mt-6">
                    <h3 className="font-serif text-[17px] font-medium tracking-[0.08em] text-ink">
                      {tr(section.heading)}
                    </h3>
                    <p className="kai mt-2 text-[13px] leading-[1.85] text-ink-dim">
                      {tr(section.text)}
                    </p>
                    {section.image && (
                      <div className="mt-3 overflow-hidden border border-rule">
                        <div
                          className="aspect-[16/9] w-full bg-cover bg-center"
                          style={{
                            backgroundImage: bgStack(section.image, city?.heroImage),
                          }}
                        />
                      </div>
                    )}
                  </motion.div>
                ))}

                {spot.pressLinks && spot.pressLinks.length > 0 && (
                  <motion.div variants={CONTENT_ITEM} className="mt-8">
                    <p className="plaque-text mb-3 text-[11px] text-ink-faint">
                      {t(ui.spotPress, locale)}
                    </p>
                    <div className="flex flex-col gap-3">
                      {spot.pressLinks
                        .filter((l) => l.featured)
                        .map((link) => (
                          <PressLinkCard key={link.url} link={link} variant="featured" />
                        ))}
                      {spot.pressLinks
                        .filter((l) => !l.featured)
                        .map((link) => (
                          <PressLinkCard key={link.url} link={link} variant="default" />
                        ))}
                    </div>
                  </motion.div>
                )}

                {teamMembers.length > 0 && (
                  <motion.div variants={CONTENT_ITEM} className="mt-8">
                    <p className="plaque-text mb-3 text-[11px] text-ink-faint">
                      {t(ui.spotFieldTeam, locale)}
                    </p>
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                      {teamMembers.map((m) => (
                        <div key={m.id} className="text-center">
                          <div
                            className="mx-auto aspect-square w-full max-w-[64px] overflow-hidden rounded-full border-2 border-[#faf6ee] bg-paper shadow-sm"
                          >
                            <img
                              src={m.avatar}
                              alt={tr(m.name)}
                              className="h-full w-full object-cover object-top"
                            />
                          </div>
                          <p className="mt-1.5 truncate text-[10px] text-ink-dim">
                            {tr(m.name)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {spotImages.length > 0 && (
                  <motion.div variants={CONTENT_ITEM} className="mt-8">
                    <p className="plaque-text mb-3 text-[11px] text-ink-faint">
                      {t(ui.spotGallery, locale)}
                    </p>
                    <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
                      {spotImages.map((img, i) => (
                        <div
                          key={`${img}-${i}`}
                          className="overflow-hidden border border-rule bg-paper"
                          style={{ aspectRatio: "4/3" }}
                        >
                          <div
                            className="h-full w-full bg-cover bg-center"
                            style={{ backgroundImage: bgStack(img) }}
                          />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                <motion.div
                  variants={CONTENT_ITEM}
                  className="mt-8 rounded-xl border border-rule bg-white/50 p-4"
                >
                  <p className="plaque-text text-[11px] text-ink-faint">
                    {t(ui.spotTourism, locale)}
                  </p>
                  <p className="kai mt-2 text-[12px] leading-[1.8] text-ink-dim">
                    {t(ui.spotTourismBody, locale)}
                  </p>
                </motion.div>

                <motion.div
                  variants={CONTENT_ITEM}
                  className="mt-6 grid grid-cols-3 divide-x divide-rule border border-rule py-3"
                >
                  {[
                    {
                      label: t(ui.drawerVisitInfo, locale),
                      value: tf(ui.spotStopLabel, locale, { n: spot.order }),
                    },
                    {
                      label: "GPS",
                      value: `${spot.coord[1].toFixed(2)}°N ${spot.coord[0].toFixed(2)}°E`,
                    },
                    {
                      label: t(ui.spotLocationLabel, locale),
                      value: city
                        ? locale === "zh"
                          ? city.nameZh.split("·").pop()?.trim() ?? ""
                          : city.nameEn.split(",")[0] ?? ""
                        : "",
                    },
                  ].map((item, i) => (
                    <div key={i} className="px-2 text-center sm:px-3">
                      <p className="en-caption text-[9px] text-ink-faint">{item.label}</p>
                      <p className="datum mt-1 truncate text-[11px] text-ink">{item.value}</p>
                    </div>
                  ))}
                </motion.div>

                {next && (
                  <motion.div variants={CONTENT_ITEM} className="mt-6 flex justify-end pb-2">
                    <button
                      type="button"
                      onClick={() => onNavigate(next.id)}
                      className="group inline-flex items-center gap-2 text-[13px] tracking-[0.1em] text-ink-dim transition-colors hover:text-cinnabar"
                    >
                      <span>
                        {t(ui.spotNext, locale)} · {tr(next.name)}
                      </span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </motion.div>
                )}
              </motion.div>
            </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
