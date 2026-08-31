"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { IntroExperience } from "@/components/intro/intro-experience";
import { HandscrollStage } from "@/components/journey/handscroll";
import { FilmShowcase } from "@/components/journey/film-showcase";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { TeamExperience } from "@/components/team/team-experience";
import { useSpotPanel } from "@/components/spot-panel";
import { useLenisScroll } from "@/lib/lenis-context";
import { EASE_OUT_EXPO } from "@/lib/motion";

// ============================================================
// JourneyShell — 首页沉浸体验编排(状态机)
//   'intro'    宣纸门面
//   'journey'  中国画长卷 + 实践影像
//   'team'     实践团队子页
// ============================================================

type Stage =
  | { name: "intro" }
  | { name: "journey"; cityId: string }
  | { name: "team"; from: "intro" | "journey"; cityId?: string };

export function JourneyShell(): ReactNode {
  const { open } = useSpotPanel();
  const { scrollTo } = useLenisScroll();
  const [stage, setStage] = useState<Stage>({ name: "intro" });
  const [introScenic, setIntroScenic] = useState(false);

  const [journeyTailReady, setJourneyTailReady] = useState(false);

  const resetScrollTop = useCallback(() => {
    scrollTo(0, { immediate: true });
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [scrollTo]);

  useEffect(() => {
    if (stage.name === "intro") {
      if (window.location.hash) {
        history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search,
        );
      }
      resetScrollTop();
      requestAnimationFrame(resetScrollTop);
    }
    if (stage.name === "journey") {
      setJourneyTailReady(false);
      if (window.location.hash) {
        history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search,
        );
      }
      resetScrollTop();
      requestAnimationFrame(resetScrollTop);
    }
    if (stage.name !== "intro") setIntroScenic(false);
  }, [stage, resetScrollTop]);

  // 首屏进入:去掉无效锚点(#media 等),避免浏览器滚到页面底部
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash !== "#top" && !document.querySelector(hash)) {
      history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
    }
    resetScrollTop();
    requestAnimationFrame(resetScrollTop);
  }, [resetScrollTop]);

  const onScenicChange = useCallback((scenic: boolean) => {
    setIntroScenic(scenic);
  }, []);

  const goTeam = useCallback(() => {
    if (stage.name === "team") return;
    if (stage.name === "journey") {
      setStage({ name: "team", from: "journey", cityId: stage.cityId });
    } else {
      setStage({ name: "team", from: "intro" });
    }
  }, [stage]);

  const goIntro = useCallback(() => {
    setStage({ name: "intro" });
  }, []);

  const teamBack = useCallback(() => {
    if (stage.name !== "team") return;
    if (stage.from === "journey" && stage.cityId) {
      setStage({ name: "journey", cityId: stage.cityId });
    } else {
      setStage({ name: "intro" });
    }
  }, [stage]);

  const navTone =
    stage.name === "intro"
      ? introScenic
        ? "rice"
        : "ink"
      : stage.name === "team"
        ? "rice"
        : "ink";

  return (
    <div
      className={`relative w-full bg-rice ${
        stage.name === "team"
          ? "h-[100svh] overflow-hidden"
          : stage.name === "intro"
            ? "h-[100svh] overflow-hidden"
            : "min-h-[100svh]"
      }`}
    >
      <Nav
        tone={navTone}
        onTeamClick={stage.name === "team" ? undefined : goTeam}
        onLogoClick={stage.name === "intro" ? undefined : goIntro}
      />

      <AnimatePresence mode="wait">
        {stage.name === "intro" ? (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
            className="h-[100svh] overflow-hidden"
          >
            <IntroExperience
              onStart={(cityId) => setStage({ name: "journey", cityId })}
              onScenicChange={onScenicChange}
            />
          </motion.div>
        ) : stage.name === "journey" ? (
          <motion.div
            key={`journey-${stage.cityId}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
            className="relative"
          >
            <HandscrollStage
              cityId={stage.cityId}
              onOpenSpot={open}
              onBack={() => setStage({ name: "intro" })}
              onScrollReady={() => setJourneyTailReady(true)}
            />
            {journeyTailReady && (
              <>
                <FilmShowcase cityId={stage.cityId} />
                <Footer />
              </>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="team"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
            className="relative"
          >
            <TeamExperience onBack={teamBack} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
