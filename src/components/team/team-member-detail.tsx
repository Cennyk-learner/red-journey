"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { MeanderRule } from "@/components/ornament";
import type { TeamMember } from "@/data/types";
import { useLocale } from "@/i18n/LocaleProvider";
import { ui, t } from "@/i18n/ui";
import { EASE_OUT_EXPO } from "@/lib/motion";

interface TeamMemberDetailProps {
  member: TeamMember | null;
  variant?: "hero" | "paper";
}

/** 展示用座右铭:去掉句末标点,视觉更干净 */
function displayMotto(text: string): string {
  return text.replace(/[。.．!?！？]\s*$/u, "").trim();
}

const secondaryMotto =
  "en-caption mx-auto w-full max-w-2xl px-1 text-center text-[10px] leading-snug tracking-[0.1em]";

const cityBadge =
  "plaque-text text-[11px] tracking-[0.28em] text-glaze/90";

function memberCityLabel(
  member: TeamMember,
  locale: "zh" | "en",
): string | null {
  const cities = member.cities ?? [];
  const inGuangan = cities.includes("guangan");
  const inBaise = cities.includes("baise");

  if (inGuangan && inBaise) return t(ui.teamDualCity, locale);
  if (member.group === "guangan" || inGuangan) return t(ui.teamGuanganCity, locale);
  if (member.group === "baise" || inBaise) return t(ui.teamBaiseCity, locale);
  return null;
}

export function TeamMemberDetail({
  member,
  variant = "paper",
}: TeamMemberDetailProps): ReactNode {
  const { locale, tr } = useLocale();
  const onHero = variant === "hero";

  if (!member) return null;

  const cityLabel = member.isCaptain ? null : memberCityLabel(member, locale);
  const isCaptain = member.isCaptain === true;

  const roleColor = "text-glaze";
  const nameColor = onHero ? "text-rice-text" : "text-ink";
  const dimColor = onHero ? "text-rice-dim" : "text-ink-dim";
  const faintColor = onHero ? "text-rice-faint" : "text-ink-faint";
  const ruleTone = onHero ? "glaze" : "cinnabar";

  const secondaryMottoText =
    locale === "en"
      ? displayMotto(member.motto.zh)
      : displayMotto(member.motto.en);

  return (
    <motion.div
      key={member.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
      className={
        onHero
          ? "mx-auto h-[11.5rem] w-full max-w-2xl px-2 text-center sm:h-[12rem]"
          : "mx-auto mt-8 w-full max-w-2xl px-2 text-center sm:mt-10"
      }
    >
      <div
        className={
          onHero
            ? "flex h-full flex-col items-center justify-end"
            : "flex flex-col items-center"
        }
      >
        <div
          className={
            onHero
              ? cityLabel
                ? "mb-2 flex min-h-[1.25rem] flex-wrap items-center justify-center gap-3"
                : "hidden"
              : cityLabel
                ? "mb-4 flex flex-wrap items-center justify-center gap-3"
                : "hidden"
          }
        >
          {cityLabel && <span className={cityBadge}>{cityLabel}</span>}
        </div>

        <p
          className={`plaque-text ${roleColor} ${
            isCaptain
              ? "text-[13px] tracking-[0.32em] sm:text-[14px]"
              : "text-[11px] tracking-[0.28em]"
          }`}
        >
          {tr(member.role)}
        </p>

        <p
          className={`mt-2 font-serif text-[clamp(1.25rem,3.2vw,1.75rem)] font-medium tracking-[0.22em] ${nameColor}`}
        >
          {tr(member.name)}
        </p>

        <MeanderRule
          className={onHero ? "mx-auto my-3 w-32 sm:my-4" : "mx-auto my-5 w-32 sm:my-6"}
          tone={ruleTone}
        />

        <p
          className={`plaque-text mb-3 text-[11px] tracking-[0.32em] sm:mb-4 ${faintColor}`}
        >
          {t(ui.teamMottoLabel, locale)}
        </p>

        <div
          className={
            onHero
              ? "flex min-h-[3.25rem] w-full items-end justify-center sm:min-h-[3.5rem]"
              : "w-full"
          }
        >
          <p
            className={`mx-auto w-full max-w-lg text-center font-serif text-[clamp(1.05rem,2.4vw,1.35rem)] leading-[1.85] tracking-[0.1em] text-pretty ${dimColor}`}
          >
            {displayMotto(tr(member.motto))}
          </p>
        </div>

        <div
          className={
            onHero
              ? "mt-3 flex min-h-[2.75rem] w-full items-start justify-center sm:min-h-[3rem]"
              : "mt-4 w-full"
          }
        >
          <p className={`${secondaryMotto} italic ${faintColor}`}>
            {secondaryMottoText}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
