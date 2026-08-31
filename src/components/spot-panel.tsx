"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SpotDetailArchive } from "@/components/spot-detail-archive";
import { useLenisScroll } from "@/lib/lenis-context";
import { useReducedMotion } from "@/lib/motion";

// ============================================================
// SpotPanel — 画卷 → 档案页 状态机
// ============================================================

export type SpotPanelPhase = "closed" | "opening" | "open" | "closing";

interface SpotPanelContextValue {
  activeId: string | null;
  phase: SpotPanelPhase;
  open: (spotId: string) => void;
  close: () => void;
  onTransitionComplete: (target: "open" | "closed") => void;
}

const SpotPanelContext = createContext<SpotPanelContextValue | null>(null);

export function SpotPanelProvider({ children }: { children: ReactNode }): ReactNode {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [phase, setPhase] = useState<SpotPanelPhase>("closed");
  const scrollSnapshotRef = useRef(0);
  const { getScroll, scrollTo, stop, start } = useLenisScroll();
  const reduce = useReducedMotion();

  const open = useCallback(
    (spotId: string) => {
      if (phase === "closed") {
        scrollSnapshotRef.current = getScroll();
        setActiveId(spotId);
        setPhase(reduce ? "open" : "opening");
      } else {
        setActiveId(spotId);
        setPhase("open");
      }
    },
    [getScroll, reduce, phase],
  );

  const close = useCallback(() => {
    if (!activeId || phase === "closing") return;
    if (reduce) {
      setActiveId(null);
      setPhase("closed");
      scrollTo(scrollSnapshotRef.current, { immediate: true });
      requestAnimationFrame(() => ScrollTrigger.update());
      return;
    }
    closeHandledRef.current = false;
    setPhase("closing");
  }, [activeId, phase, reduce, scrollTo]);

  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const closeHandledRef = useRef(false);

  const onTransitionComplete = useCallback(
    (target: "open" | "closed") => {
      if (target === "open") {
        if (phaseRef.current !== "opening") return;
        setPhase("open");
        return;
      }
      if (phaseRef.current !== "closing" || closeHandledRef.current) return;
      closeHandledRef.current = true;
      setActiveId(null);
      setPhase("closed");
      scrollTo(scrollSnapshotRef.current, { immediate: true });
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          ScrollTrigger.update();
        });
      });
    },
    [scrollTo],
  );

  useEffect(() => {
    if (phase === "closed") {
      start();
      return;
    }
    stop();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [phase, stop, start]);

  useEffect(() => {
    if (phase === "closed") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, close]);

  useEffect(() => {
    if (phase !== "opening") return;
    const timer = window.setTimeout(() => onTransitionComplete("open"), 800);
    return () => window.clearTimeout(timer);
  }, [phase, onTransitionComplete]);

  useEffect(() => {
    if (phase !== "closing") return;
    const timer = window.setTimeout(() => onTransitionComplete("closed"), 450);
    return () => window.clearTimeout(timer);
  }, [phase, onTransitionComplete]);

  const value = useMemo(
    () => ({ activeId, phase, open, close, onTransitionComplete }),
    [activeId, phase, open, close, onTransitionComplete],
  );

  return (
    <SpotPanelContext.Provider value={value}>
      {children}
      <SpotDetailArchive
        activeId={activeId}
        phase={phase}
        onClose={close}
        onNavigate={open}
        onTransitionComplete={onTransitionComplete}
      />
    </SpotPanelContext.Provider>
  );
}

export function useSpotPanel(): SpotPanelContextValue {
  const ctx = useContext(SpotPanelContext);
  if (!ctx) throw new Error("useSpotPanel must be used within SpotPanelProvider");
  return ctx;
}
