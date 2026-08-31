/** Shared layout ids for spot detail morph transitions */
export function spotHeroLayoutId(spotId: string): string {
  return `spot-hero-${spotId}`;
}

export function spotSealLayoutId(spotId: string): string {
  return `spot-seal-${spotId}`;
}

export const SPOT_LAYOUT_TRANSITION = {
  layout: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
};
