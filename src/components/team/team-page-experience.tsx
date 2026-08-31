"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Nav } from "@/components/nav";
import { TeamExperience } from "@/components/team/team-experience";

export function TeamPageExperience(): ReactNode {
  const router = useRouter();

  return (
    <div className="relative h-[100svh] overflow-hidden bg-ink-deep">
      <Nav tone="rice" mapHref="/" delay={0.2} />
      <TeamExperience onBack={() => router.push("/")} />
    </div>
  );
}
