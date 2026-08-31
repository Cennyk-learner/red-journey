"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LenisScrollProvider, type LenisScrollApi } from "@/lib/lenis-context";

// ============================================================
// 丝滑滚动 — 与 GSAP ScrollTrigger 同步
// ============================================================

gsap.registerPlugin(ScrollTrigger);

const LENIS_OPTIONS = {
  duration: 1.4,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: "vertical" as const,
  gestureOrientation: "vertical" as const,
  smoothWheel: true,
  wheelMultiplier: 1,
  touchMultiplier: 2,
};

export function SmoothScroll({ children }: { children: ReactNode }): ReactNode {
  const [lenisApi, setLenisApi] = useState<LenisScrollApi | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis(LENIS_OPTIONS);

    const api: LenisScrollApi = {
      getScroll: () => lenis.scroll,
      scrollTo: (y, options) => {
        lenis.scrollTo(y, { immediate: options?.immediate ?? false });
      },
      stop: () => lenis.stop(),
      start: () => lenis.start(),
    };
    setLenisApi(api);

    lenis.on("scroll", ScrollTrigger.update);

    const ticker = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);

    // 无效锚点(#media 等在首屏不存在)不滚到底,强制回顶
    const hash = window.location.hash;
    if (hash && hash !== "#top") {
      const target = document.querySelector(hash);
      if (target) {
        lenis.scrollTo(target as HTMLElement, { offset: -80, immediate: true });
      } else {
        history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search,
        );
        lenis.scrollTo(0, { immediate: true });
      }
    } else {
      lenis.scrollTo(0, { immediate: true });
    }

    function handleAnchorClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a[href^="#"]');
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;
      const element = document.querySelector(href);
      if (!element) {
        e.preventDefault();
        lenis.scrollTo(0, { immediate: false });
        return;
      }
      e.preventDefault();
      lenis.scrollTo(element as HTMLElement, { offset: -80 });
    }

    document.addEventListener("click", handleAnchorClick);

    return () => {
      document.removeEventListener("click", handleAnchorClick);
      gsap.ticker.remove(ticker);
      lenis.destroy();
      setLenisApi(null);
    };
  }, []);

  return (
    <LenisScrollProvider api={lenisApi}>
      {children}
    </LenisScrollProvider>
  );
}
