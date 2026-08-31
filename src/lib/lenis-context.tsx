"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

export interface LenisScrollApi {
  getScroll: () => number;
  scrollTo: (y: number, options?: { immediate?: boolean }) => void;
  stop: () => void;
  start: () => void;
}

const LenisScrollContext = createContext<LenisScrollApi | null>(null);

export function LenisScrollProvider({
  api,
  children,
}: {
  api: LenisScrollApi | null;
  children: ReactNode;
}): ReactNode {
  const value = useMemo(() => api, [api]);
  return (
    <LenisScrollContext.Provider value={value}>
      {children}
    </LenisScrollContext.Provider>
  );
}

export function useLenisScroll(): LenisScrollApi {
  const ctx = useContext(LenisScrollContext);
  return {
    getScroll: () => ctx?.getScroll() ?? window.scrollY,
    scrollTo: (y, options) => {
      if (ctx) ctx.scrollTo(y, options);
      else window.scrollTo({ top: y, behavior: options?.immediate ? "instant" : "auto" });
    },
    stop: () => ctx?.stop(),
    start: () => ctx?.start(),
  };
}
