"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  useEffect,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import { MeanderRule } from "@/components/ornament";
import { useLocale } from "@/i18n/LocaleProvider";
import { ui, t } from "@/i18n/ui";
import { withBasePath } from "@/lib/base-path";
import { useReducedMotion } from "@/lib/motion";

// ============================================================
// FilmShowcase — 卷后影像
//
// 不再用「从小窗长满全屏」的 App 腔生长动效(与长卷气质冲突)。
// 改为:玄墨底上的展厅裱框 —— 回纹题眉 + 描金硬边画心 + 自动播放。
// 滚动只负责淡入与轻微抬升,不改变画幅形状。
// ============================================================

const VIDEO_SRC = withBasePath("/film/practice-reel.mp4");
const VIDEO_POSTER = withBasePath("/team/hero-poster.jpg");

function ShowcaseVideo({
  videoRef,
  controls = false,
  label,
}: {
  videoRef: RefObject<HTMLVideoElement | null>;
  controls?: boolean;
  label: string;
}): ReactNode {
  return (
    <video
      ref={videoRef}
      className="h-full w-full object-cover"
      src={VIDEO_SRC}
      poster={VIDEO_POSTER}
      muted
      loop
      playsInline
      controls={controls}
      preload="metadata"
      aria-label={label}
    />
  );
}

export function FilmShowcase({ cityId }: { cityId?: string }): ReactNode {
  const { locale } = useLocale();
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const caption = t(ui.filmCaption, locale);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.85", "start 0.25"],
  });
  const opacity = useTransform(scrollYProgress, [0, 1], [0.35, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [48, 0]);

  useEffect(() => {
    ScrollTrigger.refresh();
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const on = entries[0]?.isIntersecting ?? false;
        if (on) {
          if (video.paused) void video.play().catch(() => undefined);
        } else if (!video.paused) {
          video.pause();
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="film"
      aria-label={caption}
      className="relative bg-ink-ground px-6 py-24 sm:px-10 sm:py-28"
    >
      {/* 天头:回纹 + 题眉 */}
      <div className="mx-auto mb-10 flex max-w-[1100px] flex-col items-center gap-5">
        <MeanderRule tone="glaze" className="w-44" />
        <p className="plaque-text text-[12px] text-rice-faint">{caption}</p>
      </div>

      {/* 裱框画心 */}
      <motion.div
        style={prefersReducedMotion ? undefined : { opacity, y }}
        className="relative mx-auto w-full max-w-[1100px]"
      >
        {/* 外框:双线描金 */}
        <div
          className="relative overflow-hidden"
          style={{
            border: "1px solid rgba(200,155,60,0.45)",
            boxShadow:
              "0 0 0 6px #17120f, 0 0 0 7px rgba(200,155,60,0.28), 0 28px 60px -20px rgba(0,0,0,0.65)",
            background: "#0d0a08",
            aspectRatio: "16 / 9",
          }}
        >
          <ShowcaseVideo
            videoRef={videoRef}
            controls={prefersReducedMotion}
            label={caption}
          />
          {/* 四角极淡的绢纹遮罩感 */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              boxShadow: "inset 0 0 80px rgba(13,10,8,0.45)",
            }}
          />
        </div>
      </motion.div>
    </section>
  );
}
