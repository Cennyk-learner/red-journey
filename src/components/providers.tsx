"use client";

import type { ReactNode } from "react";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { ReducedMotionProvider } from "@/lib/motion";
import { SmoothScroll } from "@/components/smooth-scroll";
import { SpotPanelProvider } from "@/components/spot-panel";

export function Providers({ children }: { children: ReactNode }): ReactNode {
  return (
    <ReducedMotionProvider>
      <LocaleProvider>
        <SpotPanelProvider>
          <SmoothScroll>{children}</SmoothScroll>
        </SpotPanelProvider>
      </LocaleProvider>
    </ReducedMotionProvider>
  );
}
