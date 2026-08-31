import type { Metadata } from "next";
import { TeamPageExperience } from "@/components/team/team-page-experience";

export const metadata: Metadata = {
  title: "实践团队 · Red Journey Team",
  description: "2026 川桂三下乡社会实践团队介绍",
};

export default function TeamPage() {
  return <TeamPageExperience />;
}
