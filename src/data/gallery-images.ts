import { SPOT_IMAGE_MANIFEST } from "./spot-images";

// Spots that only contain fallback copies of other sites' photos
const FALLBACK_ONLY_SPOTS = new Set([
  "baise-integrity-education-base",
  "lingzhou-guild-hall",
]);

/**
 * Field photographs for the gallery wall — practice site images only.
 * Excludes team avatars and duplicate fallback folders.
 */
export function getGalleryImages(): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  for (const [spotId, urls] of Object.entries(SPOT_IMAGE_MANIFEST)) {
    if (FALLBACK_ONLY_SPOTS.has(spotId)) continue;
    for (const url of urls) {
      if (url.includes("/team/")) continue;
      if (seen.has(url)) continue;
      seen.add(url);
      out.push(url);
    }
  }

  return out;
}
