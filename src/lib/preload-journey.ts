import {
  getPhotoFieldImages,
  getPhotoFieldPriorityCount,
} from "@/data/photo-field-images";

/** Preload inner-ring PhotoField thumbs as soon as the intro mounts. */
export function preloadPhotoFieldImages(): void {
  const images = getPhotoFieldImages();
  const priority = getPhotoFieldPriorityCount();
  for (let i = 0; i < Math.min(priority, images.length); i++) {
    const img = new Image();
    img.src = images[i] ?? "";
  }
}

/** 选城后预加载画卷相关 chunk,减轻「展卷」首帧卡顿 */
export function preloadJourneyChunks(): void {
  void import("@/components/journey/handscroll");
  void import("@/components/gallery/gallery-experience");
  void import("gsap");
  void import("gsap/ScrollTrigger");
}

export function preloadImage(url: string): void {
  const img = new Image();
  img.src = url;
}
