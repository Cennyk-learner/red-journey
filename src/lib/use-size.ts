"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/** 元素实测尺寸(ResizeObserver),初始 0×0 */
export function useSize<T extends HTMLElement>(): {
  ref: RefObject<T | null>;
  width: number;
  height: number;
} {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (!rect) return;
      setSize((prev) =>
        Math.round(rect.width) === prev.width && Math.round(rect.height) === prev.height
          ? prev
          : { width: Math.round(rect.width), height: Math.round(rect.height) }
      );
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { ref, width: size.width, height: size.height };
}
