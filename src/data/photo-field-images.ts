import { SPOT_IMAGE_MANIFEST } from "./spot-images";

const CITY_VISTAS = [
  "/cities/guangan/residence.webp",
  "/cities/guangan/scenery.webp",
  "/cities/guangan/museum.webp",
  "/cities/guangan/siyuan.webp",
  "/cities/baise/memorial.webp",
  "/cities/baise/scenery.webp",
];

/**
 * Diverse image pool for the intro PhotoField rings.
 * Pulls city vistas + staggered picks from each spot manifest (no duplicates).
 */
export function getPhotoFieldImages(): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  const add = (url: string | undefined) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    out.push(url);
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
