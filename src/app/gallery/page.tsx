import type { Metadata } from "next";
import { GalleryExperience } from "@/components/gallery/gallery-experience";

export const metadata: Metadata = {
  title: "影像记录 · Red Journey Gallery",
  description: "2026 川桂三下乡实践团现场影像 — 广安、百色实地拍摄",
};

export default function GalleryPage() {
  return <GalleryExperience />;
}
