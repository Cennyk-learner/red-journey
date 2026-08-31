"use client";

import { motion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import { Logotype, MeanderRule } from "@/components/ornament";
import { useLocale } from "@/i18n/LocaleProvider";
import { ui, t } from "@/i18n/ui";
import { withBasePath } from "@/lib/base-path";
import { EASE_OUT_EXPO } from "@/lib/motion";

// ============================================================
// 顶部导航 — 三段式,学中国国家博物馆的版式
//
//   左菜单 │ 居中徽记 │ 右菜单 + 语言
//
// 三条与旧版的分别:
// 1. 徽记居中,不是左上角挂个圆点加品牌名 —— 居中是机构官网的做法,
//    左上角挂 logo 是 SaaS 落地页的做法。
// 2. 悬停不给圆角药丸背景,改成字底一道朱砂细线从中心展开(.rule-hover)。
// 3. 顶缘一条通栏发丝线(爱马仕那道),滚动后换成回纹带压底。
//
// 底色分两调:开场在玄墨/实景照片上走 rice(反白文字),
// 长卷在绢面上走 ink(墨字)。由 journey-shell 传入。
// ============================================================

const LINKS_LEFT = [
  { key: "navMap", hrefKey: "map" as const },
  { key: "navGallery", href: "/gallery" },
] as const;

const LINKS_RIGHT = [
  { key: "navMedia", href: "/media" },
  { key: "navTeam", href: "/team" },
] as const;

type Tone = "ink" | "rice";

interface ToneSpec {
  text: string;
  dim: string;
  hairline: string;
  ground: string;
  meander: "cinnabar" | "glaze";
}

const TONES: Record<Tone, ToneSpec> = {
  ink: {
    text: "var(--ink)",
    dim: "var(--ink-dim)",
    hairline: "color-mix(in srgb, var(--cinnabar) 65%, transparent)",
    ground: "color-mix(in srgb, var(--rice) 92%, transparent)",
    meander: "cinnabar",
  },
  rice: {
    text: "var(--rice-text)",
    dim: "var(--rice-dim)",
    hairline: "color-mix(in srgb, var(--glaze) 70%, transparent)",
    ground: "color-mix(in srgb, var(--ink-deep) 78%, transparent)",
    meander: "glaze",
  },
};

function NavLink({
  label,
  href,
  color,
  onClick,
}: {
  label: string;
  href?: string;
  color: string;
  onClick?: () => void;
}): ReactNode {
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="rule-hover pointer-events-auto whitespace-nowrap font-serif text-[13px] tracking-[0.18em] transition-opacity duration-300 hover:opacity-100"
        style={{ color, opacity: 0.78 }}
      >
        {label}
      </button>
    );
  }
  return (
    <a
      href={href ? withBasePath(href) : "#"}
      className="rule-hover pointer-events-auto whitespace-nowrap font-serif text-[13px] tracking-[0.18em] transition-opacity duration-300 hover:opacity-100"
      style={{ color, opacity: 0.78 }}
    >
      {label}
    </a>
  );
}

export function Nav({
  delay = 1.4,
  tone = "rice",
  mapHref = "#journey",
  onTeamClick,
  onLogoClick,
}: {
  delay?: number;
  tone?: Tone;
  mapHref?: string;
  onTeamClick?: () => void;
  onLogoClick?: () => void;
}): ReactNode {
  const [scrolled, setScrolled] = useState(false);
  const { locale, toggleLocale } = useLocale();
  const spec = TONES[tone];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      aria-label="Primary"
      className="pointer-events-none fixed inset-x-0 top-0 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.9, ease: EASE_OUT_EXPO, delay }}
    >
      {/* 滚动后压上的底色 */}
      <div
        aria-hidden
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          background: spec.ground,
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          opacity: scrolled ? 1 : 0,
        }}
      />

      {/* 顶缘发丝线:通栏一道,始终在 */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: spec.hairline }}
      />

      <div
        className="relative mx-auto grid max-w-[1500px] grid-cols-[1fr_auto_1fr] items-center gap-6 px-7 transition-[padding] duration-500 sm:px-12"
        style={{ paddingTop: scrolled ? 16 : 26, paddingBottom: scrolled ? 18 : 26 }}
      >
        {/* 左:栏目 */}
        <div className="flex items-center gap-8">
          {LINKS_LEFT.map((link) => (
            <NavLink
              key={link.key}
              href={
                "hrefKey" in link && link.hrefKey === "map"
                  ? mapHref
                  : "href" in link
                    ? link.href
                    : "#"
              }
              label={t(ui[link.key], locale)}
              color={spec.text}
            />
          ))}
        </div>

        {/* 中:徽记。滚动后收小,书写动效只在首次播 */}
        <a
          href={onLogoClick ? "#" : "#top"}
          onClick={(e) => {
            if (onLogoClick) {
              e.preventDefault();
              onLogoClick();
            }
          }}
          className="pointer-events-auto flex flex-col items-center gap-1.5"
          aria-label="红色足迹 Red Journey"
        >
          <Logotype
            size={scrolled ? 22 : 30}
            tone={tone}
            delay={delay + 0.2}
            className="transition-[height] duration-500"
          />
          <span
            className="font-serif text-[9px] tracking-[0.22em] transition-opacity duration-500"
            style={{ color: spec.dim, opacity: scrolled ? 0 : 1 }}
          >
            {t(ui.brandSubtitle, locale)}
          </span>
        </a>

        {/* 右:栏目 + 语言。语言不做成按钮药丸,按国博的做法当文字链 */}
        <div className="flex items-center justify-end gap-8">
          {LINKS_RIGHT.map((link) => (
            <NavLink
              key={link.href}
              href={link.key === "navTeam" && onTeamClick ? undefined : link.href}
              label={t(ui[link.key], locale)}
              color={spec.text}
              onClick={link.key === "navTeam" ? onTeamClick : undefined}
            />
          ))}
          <span
            aria-hidden
            className="h-3.5 w-px"
            style={{ background: spec.hairline }}
          />
          <button
            type="button"
            onClick={toggleLocale}
            aria-label={t(ui.langSwitchLabel, locale)}
            className="pointer-events-auto rounded border px-3.5 py-1.5 font-serif text-[12px] font-medium tracking-[0.16em] transition-all duration-300 hover:scale-[1.02]"
            style={{
              color: spec.text,
              borderColor:
                tone === "rice"
                  ? "color-mix(in srgb, var(--glaze) 55%, transparent)"
                  : "color-mix(in srgb, var(--cinnabar) 50%, transparent)",
              background:
                tone === "rice"
                  ? "color-mix(in srgb, var(--ink-deep) 55%, transparent)"
                  : "color-mix(in srgb, var(--cinnabar) 8%, var(--rice))",
              boxShadow:
                tone === "rice"
                  ? "0 0 0 1px rgba(224,184,78,0.12)"
                  : "0 0 0 1px color-mix(in srgb, var(--cinnabar) 15%, transparent)",
            }}
          >
            {t(ui.langSwitchLabel, locale)}
          </button>
        </div>
      </div>

      {/* 滚动后压底的回纹带:放在导航内容下方,不裁切文字 */}
      <div
        aria-hidden
        className="relative transition-opacity duration-500"
        style={{ opacity: scrolled ? 1 : 0, height: scrolled ? 10 : 0 }}
      >
        <MeanderRule tone={spec.meander} />
      </div>
    </motion.nav>
  );
}
