import type { Metadata } from "next";
import { MediaExperience } from "@/components/media/media-experience";

export const metadata: Metadata = {
  title: "媒体报道 · Red Journey Press",
  description: "人民网、中国日报等权威媒体对红色足迹川桂实践项目的报道收录",
};

export default function MediaPage() {
  return <MediaExperience />;
}
