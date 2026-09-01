import { withBasePath } from "@/lib/base-path";
import { PHOTO_FIELD_THUMBS } from "./photo-field-thumbs";
import { SPOT_IMAGE_MANIFEST } from "./spot-images";

const CITY_VISTAS = [
  "/cities/guangan/residence.webp",
  "/cities/guangan/scenery.webp",
  "/cities/guangan/museum.webp",
  "/cities/guangan/siyuan.webp",
  "/cities/baise/memorial.webp",
  "/cities/baise/scenery.webp",
];

function fieldAsset(url: string): string {
  const thumb = PHOTO_FIELD_THUMBS[url];
  return withBasePath(thumb ?? url);
}

/**
 * Diverse image pool for the intro PhotoField rings.
 * Uses pre-baked 640px WebP thumbs when available (see build-photo-field-thumbs.py).
 */
export function getPhotoFieldImages(): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  const add = (url: string | undefined) => {
    if (!url) return;
    const resolved = fieldAsset(url);
    if (seen.has(resolved)) return;
    seen.add(resolved);
    out.push(resolved);
  };

  for (const url of CITY_VISTAS) add(url);

  for (const urls of Object.values(SPOT_IMAGE_MANIFEST)) {
    if (urls.length === 0) continue;
    add(urls[0]);
    if (urls.length > 3) add(urls[3]);
    if (urls.length > 7) add(urls[7]);
    if (urls.length > 11) add(urls[11]);
  }

  return out;
}

/** Indices loaded first — inner ring tiles (9 photos). */
export function getPhotoFieldPriorityCount(): number {
  return 9;
}
