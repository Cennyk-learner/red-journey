"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Bilingual, Locale } from "@/data/types";

const STORAGE_KEY = "red-journey-locale";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  toggleLocale: () => void;
  /** 取双语字段的当前语言值 */
  tr: (b: Bilingual) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function detectInitialLocale(): Locale {
  if (typeof window === "undefined") return "zh";
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === "zh" || saved === "en") return saved;
  return window.navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
}

export function LocaleProvider({ children }: { children: ReactNode }): ReactNode {
  // SSR/首次渲染固定为 zh,挂载后再从 localStorage/浏览器语言矫正,避免 hydration mismatch
  const [locale, setLocaleState] = useState<Locale>("zh");

  useEffect(() => {
    setLocaleState(detectInitialLocale());
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    window.localStorage.setItem(STORAGE_KEY, l);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocaleState((prev) => {
      const next = prev === "zh" ? "en" : "zh";
      window.localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const tr = useCallback((b: Bilingual) => b[locale], [locale]);

  const value = useMemo(
    () => ({ locale, setLocale, toggleLocale, tr }),
    [locale, setLocale, toggleLocale, tr]
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
