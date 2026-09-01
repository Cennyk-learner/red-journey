"use client";

import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import TiltedTiles from "@/components/effects/tilted-tiles";
import { FilmShowcase } from "@/components/journey/film-showcase";
import { MeanderRule } from "@/components/ornament";
import { Nav } from "@/components/nav";
import { getGalleryImages } from "@/data/gallery-images";
import { useLocale } from "@/i18n/LocaleProvider";
import { ui, t } from "@/i18n/ui";

export function GalleryExperience(): ReactNode {
  const { locale } = useLocale();
  const images = useMemo(() => getGalleryImages(), []);

  return (
    <div className="bg-ink-deep">
      <div className="relative h-[100svh] overflow-hidden bg-ink-deep">
      <Nav tone="rice" mapHref="/" />

      <div className="pointer-events-none absolute inset-x-0 top-[5.5rem] z-20 px-6 text-center sm:px-10">
        <p className="plaque-text text-[12px] text-rice-dim sm:text-[13px]">
          {t(ui.galleryKicker, locale)}
        </p>
        <h1 className="brush mt-3 text-[clamp(32px,4.8vw,48px)] text-rice-text">
          {t(ui.galleryTitle, locale)}
        </h1>
        <p className="kai mx-auto mt-3 max-w-lg text-[14px] leading-[1.9] text-rice-dim sm:text-[15px]">
          {t(ui.gallerySubtitle, locale)}
        </p>
        <Link
          href="/"
          className="rule-hover kai pointer-events-auto mt-5 inline-block text-[13px] tracking-[0.16em] text-rice-dim transition-colors hover:text-rice-text"
        >
          ← {t(ui.galleryBack, locale)}
        </Link>
      </div>

      <div className="absolute inset-0 pt-28">
        <TiltedTiles
          images={images}
          columns={14}
          tilesPerColumn={5}
          tileAspect={0.85}
          rowGap={10}
          columnGap={10}
          borderRadius={6}
          rotateX={38}
          rotateY={14}
          rotateZ={-18}
          duration={28}
          fadeTop={24}
          fadeBottom={8}
          parallax
          parallaxStrength={6}
          pauseOnHover
          saturation={0.92}
          height="100%"
          className="opacity-95"
        />
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20">
        <MeanderRule tone="glaze" />
        <p className="kai pb-2 text-center text-[11px] tracking-[0.18em] text-rice-faint">
          {images.length} {t(ui.galleryPhotoCountSuffix, locale)}
        </p>
        <p className="kai pb-6 text-center text-[10px] tracking-[0.22em] text-rice-faint/80">
          {t(ui.galleryScrollDown, locale)}
        </p>
      </div>
      </div>

      <FilmShowcase />
    </div>
  );
}
