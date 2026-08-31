"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence } from "motion/react";
import { SilkGround } from "./silk-ground";
import { StationSeal } from "./station-seal";
import { Colophon } from "./colophon";
import { layoutScroll } from "./handscroll-geometry";
import { OverviewBubble } from "@/components/journey/overview-bubble";
import { useSpotPanel } from "@/components/spot-panel";
import { getSpotsByCity } from "@/data/spots";
import { getCity } from "@/data/cities";
import { useLocale } from "@/i18n/LocaleProvider";
import { ui, t } from "@/i18n/ui";
import { useReducedMotion } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

interface HandscrollStageProps {
  cityId: string;
  onOpenSpot: (spotId: string) => void;
  onBack?: () => void;
  onScrollReady?: () => void;
}

export function HandscrollStage({
  cityId,
  onOpenSpot,
  onBack,
  onScrollReady,
}: HandscrollStageProps): ReactNode {
  const { locale, tr } = useLocale();
  const reduced = useReducedMotion();
  const { phase, activeId } = useSpotPanel();
  const city = getCity(cityId);
  const spots = useMemo(() => getSpotsByCity(cityId), [cityId]);

  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const stRef = useRef<ScrollTrigger | null>(null);

  const [viewport, setViewport] = useState(() => ({
    w: typeof window !== "undefined" ? window.innerWidth : 0,
    h: typeof window !== "undefined" ? window.innerHeight : 0,
  }));
  const [offset, setOffset] = useState(0);
  const [openSpot, setOpenSpot] = useState<string | null>(null);
  const [stamped, setStamped] = useState<Set<string>>(new Set());
  const stampedRef = useRef<Set<string>>(new Set());
  const autoShownRef = useRef<Set<string>>(new Set());
  const archiveActiveRef = useRef(false);
  const lastOpenSpotRef = useRef<string | null>(null);
  const suppressAutoBubbleRef = useRef(false);
  const suppressOnUpdateRef = useRef(false);
  const offsetSnapshotRef = useRef(0);
  const prevPhaseRef = useRef(phase);

  const archiveActive = phase !== "closed";
  archiveActiveRef.current = archiveActive;
  const morphingToArchive = phase === "opening" || phase === "closing";

  const displayOffset =
    archiveActive || suppressOnUpdateRef.current
      ? offsetSnapshotRef.current
      : offset;

  useEffect(() => {
    const measure = () =>
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const geo = useMemo(
    () => layoutScroll(spots, viewport.w),
    [spots, viewport.w],
  );
  const scrollDistance = Math.max(0, geo.scrollWidth - viewport.w);
  const pinTravel =
    scrollDistance > 0 ? scrollDistance + viewport.h * 0.35 : viewport.h;

  useGSAP(
    () => {
      if (!sectionRef.current || !trackRef.current) return;
      if (reduced || viewport.w === 0) return;

      const st = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: `+=${pinTravel}`,
        pin: true,
        scrub: 0.55,
        anticipatePin: 1,
        onUpdate: (self) => {
          if (archiveActiveRef.current || suppressOnUpdateRef.current) return;
          const next = self.progress * scrollDistance;
          offsetSnapshotRef.current = next;
          setOffset(next);
        },
      });
      stRef.current = st;
      ScrollTrigger.refresh();
      onScrollReady?.();

      return () => {
        st.kill();
        stRef.current = null;
      };
    },
    {
      dependencies: [scrollDistance, pinTravel, viewport.w, viewport.h, reduced],
    },
  );

  useEffect(() => {
    const prev = prevPhaseRef.current;
    prevPhaseRef.current = phase;

    if (phase === "closed") {
      offsetSnapshotRef.current = offset;
    }

    if (
      prev === "closed" &&
      (phase === "opening" || phase === "open")
    ) {
      offsetSnapshotRef.current = offset;
    }

    if (activeId && phase !== "closed") {
      lastOpenSpotRef.current = activeId;
    }

    const justClosed =
      prev !== "closed" && phase === "closed" && lastOpenSpotRef.current;

    if (justClosed) {
      const saved = offsetSnapshotRef.current;
      suppressOnUpdateRef.current = true;
      setOffset(saved);
      setOpenSpot(lastOpenSpotRef.current);
      suppressAutoBubbleRef.current = true;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const st = stRef.current;
          if (st && scrollDistance > 0) {
            const progress = Math.min(1, Math.max(0, saved / scrollDistance));
            st.scroll(st.start + progress * (st.end - st.start));
            ScrollTrigger.update();
          }
          suppressOnUpdateRef.current = false;
        });
      });

      const timer = window.setTimeout(() => {
        suppressAutoBubbleRef.current = false;
      }, 1200);

      return () => window.clearTimeout(timer);
    }
  }, [phase, activeId, offset, scrollDistance]);

  useEffect(() => {
    if (!reduced && viewport.w > 0) return;
    if (viewport.w === 0) return;
    onScrollReady?.();
  }, [reduced, viewport.w, onScrollReady]);

  useEffect(() => {
    setStamped(new Set());
    stampedRef.current = new Set();
    autoShownRef.current = new Set();
    setOpenSpot(null);
  }, [cityId]);

  useEffect(() => {
    if (phase === "open") setOpenSpot(null);
  }, [phase]);

  // 盖印与小卡同步:每个站点只自动弹出一次,之后需点钤印
  useEffect(() => {
    if (viewport.w === 0) return;

    const threshold = offset + viewport.w * 0.7;
    const nextStamped = new Set<string>();
    for (const st of geo.stations) {
      if (st.x < threshold) nextStamped.add(st.spot.id);
    }
    if (geo.stations[0]) nextStamped.add(geo.stations[0].spot.id);

    const newlyLit = [...nextStamped].filter((id) => !stampedRef.current.has(id));
    stampedRef.current = nextStamped;
    setStamped((prev) => {
      if (
        prev.size === nextStamped.size &&
        [...prev].every((id) => nextStamped.has(id))
      ) {
        return prev;
      }
      return nextStamped;
    });

    if (phase !== "closed" || newlyLit.length === 0) return;
    if (suppressAutoBubbleRef.current) return;

    let pick: (typeof geo.stations)[number] | null = null;
    for (const st of geo.stations) {
      if (!newlyLit.includes(st.spot.id)) continue;
      if (!pick || st.x > pick.x) pick = st;
    }
    if (!pick) return;
    if (autoShownRef.current.has(pick.spot.id)) return;

    autoShownRef.current.add(pick.spot.id);
    setOpenSpot(pick.spot.id);
  }, [offset, viewport.w, geo.stations, phase]);

  const cityName = city ? tr({ zh: city.nameZh, en: city.nameEn }) : "";
  const nearEnd = scrollDistance > 0 && displayOffset > scrollDistance * 0.82;

  return (
    <section
      id="journey"
      ref={sectionRef}
      className="relative w-full"
      style={{ height: reduced ? "auto" : undefined }}
      aria-label={`${cityName} 寻访长卷`}
    >
      <div
        className="relative overflow-hidden"
        style={{ height: "100svh" }}
        onClick={() => {
          if (openSpot && phase === "closed") setOpenSpot(null);
        }}
      >
        <div
          className="absolute inset-0 origin-center"
          style={{ pointerEvents: archiveActive ? "none" : "auto" }}
        >
          <SilkGround
            scrollWidth={geo.scrollWidth}
            offset={displayOffset}
            photoUrl={city?.sceneryImage ?? city?.heroImage ?? null}
          />

          <div
            ref={trackRef}
            className="absolute top-0 h-full"
            style={{
              width: geo.scrollWidth,
              transform: reduced ? "none" : `translateX(${-displayOffset}px)`,
              overflow: "visible",
            }}
          >
            <div
              className="absolute flex flex-col items-center"
              style={{ left: 150, top: "13%" }}
            >
              <p className="vertical brush text-6xl text-ink" style={{ maxHeight: 440 }}>
                {city?.nameZh.replace(/\s*·\s*/g, "") ?? ""}
              </p>
              <p className="en-caption mt-6 text-[11px] text-ink-faint [writing-mode:horizontal-tb]">
                {city?.nameEn ?? ""}
              </p>
            </div>

            {geo.stations.map((st) => {
              const inColophonZone =
                nearEnd && st.x > geo.scrollWidth - viewport.w * 0.95;
              const showBubble =
                openSpot === st.spot.id && phase === "closed" && !inColophonZone;

              return (
                <div
                  key={st.spot.id}
                  className="absolute"
                  style={{
                    left: st.x,
                    top: `${st.yRatio * 100}%`,
                    translate: "-50% -50%",
                    opacity: inColophonZone ? 0 : 1,
                    pointerEvents: inColophonZone ? "none" : "auto",
                  }}
                >
                  <StationSeal
                    spot={st.spot}
                    side={st.side}
                    active={stamped.has(st.spot.id)}
                    onOpen={(id) => setOpenSpot((prev) => (prev === id ? null : id))}
                  />

                  <AnimatePresence>
                    {showBubble && (
                      <OverviewBubble
                        key={`bubble-${st.spot.id}`}
                        spot={st.spot}
                        onDetail={() => onOpenSpot(st.spot.id)}
                        onClose={() => setOpenSpot(null)}
                        morphingToArchive={
                          morphingToArchive && activeId === st.spot.id
                        }
                      />
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            <div
              className="absolute top-0 flex h-full items-center justify-center"
              style={{
                left: geo.scrollWidth - viewport.w,
                width: viewport.w,
              }}
            >
              <Colophon
                progress={Math.min(1, displayOffset / Math.max(1, scrollDistance))}
              />
            </div>
          </div>
        </div>

        {onBack && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onBack();
            }}
            className="rule-hover plaque-text absolute left-7 top-[5.5rem] z-30 text-[12px] text-ink-dim transition-colors hover:text-ink sm:left-12"
            style={{ pointerEvents: archiveActive ? "none" : "auto" }}
          >
            ← {t(ui.introBack, locale)}
          </button>
        )}

        {displayOffset < scrollDistance * 0.08 && !archiveActive && (
          <div className="pointer-events-none absolute bottom-10 left-1/2 -translate-x-1/2">
            <p className="kai text-[11px] tracking-[0.28em] text-ink-faint">
              向右展卷 · SCROLL
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
