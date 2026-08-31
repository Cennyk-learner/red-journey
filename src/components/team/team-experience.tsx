"use client";

import { motion } from "motion/react";
import { useState, type ReactNode } from "react";
import { SkewedCarousel } from "@/components/effects/skewed-carousel";
import { MeanderRule } from "@/components/ornament";
import { TeamMemberDetail } from "@/components/team/team-member-detail";
import { TEAM_ALL } from "@/data/team";
import { useLocale } from "@/i18n/LocaleProvider";
import { ui, t } from "@/i18n/ui";
import { withBasePath } from "@/lib/base-path";
import { EASE_OUT_EXPO } from "@/lib/motion";

interface TeamExperienceProps {
  onBack: () => void;
}

export function TeamExperience({ onBack }: TeamExperienceProps): ReactNode {
  const { locale, tr } = useLocale();
  const [index, setIndex] = useState(0);
  const member = TEAM_ALL[index] ?? TEAM_ALL[0];

  const items = TEAM_ALL.map((m) => ({
    src: m.avatar,
    title: tr(m.name),
    alt: tr(m.name),
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.55, ease: EASE_OUT_EXPO }}
      className="relative h-[100svh] w-full overflow-hidden"
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        poster={withBasePath("/team/hero-poster.jpg")}
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src={withBasePath("/team/hero.mp4")} type="video/mp4" />
      </video>

      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-ink-deep/70 via-ink-ground/45 to-ink-deep/88"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-cinnabar-deep/20 mix-blend-multiply"
      />

      <button
        type="button"
        onClick={onBack}
        className="rule-hover absolute left-6 top-24 z-30 rounded-sm border border-rice-faint/20 bg-ink-deep/40 px-3 py-1.5 font-serif text-[13px] tracking-[0.18em] text-rice-text backdrop-blur-md transition-colors hover:bg-ink-deep/55 sm:left-10"
      >
        ← {t(ui.teamBack, locale)}
      </button>

      <div className="relative z-10 flex h-full max-h-[100svh] flex-col overflow-hidden px-4 pb-6 pt-20 sm:px-8 sm:pb-8 sm:pt-24">
        <div className="mb-4 flex shrink-0 flex-col items-center text-center sm:mb-6">
          <p className="plaque-text text-[12px] text-rice-dim">
            {t(ui.teamSectionTitle, locale)}
          </p>
          <MeanderRule className="mt-3 w-28" tone="glaze" />
        </div>

        <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
          <SkewedCarousel
            items={items}
            initialIndex={0}
            cardWidth={200}
            cardGap={36}
            aspectRatio="3 / 4"
            rotation={52}
            inactiveScale={0.86}
            perspective={900}
            borderRadius={14}
            loop
            showTitles
            showControls
            showDots
            enableDrag
            enableKeyboard
            onIndexChange={setIndex}
            className="text-rice-text [&_button]:text-rice-text"
          />
        </div>

        <div className="shrink-0 w-full">
          <TeamMemberDetail member={member} variant="hero" />
        </div>
      </div>
    </motion.div>
  );
}
