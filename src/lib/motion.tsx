"use client";

import { motion, type MotionProps, type Variants } from "motion/react";
import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";

// ============================================================
// motion 工具库 — 移植自 CrossMind lib/motion.tsx
// reduced-motion 全站响应 + 常用 variants
// ============================================================

function subscribeToReducedMotion(callback: () => void): () => void {
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getReducedMotionSnapshot(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot(): boolean {
  return false;
}

const ReducedMotionContext = createContext<boolean>(false);

export function useReducedMotion(): boolean {
  return useContext(ReducedMotionContext);
}

export function ReducedMotionProvider({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  return (
    <ReducedMotionContext.Provider value={prefersReducedMotion}>
      {children}
    </ReducedMotionContext.Provider>
  );
}

export const EASE_OUT_EXPO = [0.33, 1, 0.68, 1] as const;
export const EASE_EDITORIAL = [0.23, 1, 0.32, 1] as const;

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export const fadeInBlur: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(8px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

export const reducedMotionVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const defaultTransition = {
  duration: 0.7,
  ease: EASE_EDITORIAL,
};

type MotionDivProps = {
  variants?: Variants;
  children?: ReactNode;
  className?: string;
} & MotionProps;

/** 自动响应 reduced-motion 的 motion.div 封装 */
export function MotionDiv({
  variants = fadeInUp,
  children,
  className,
  ...props
}: MotionDivProps): ReactNode {
  const prefersReducedMotion = useReducedMotion();

  const activeVariants = prefersReducedMotion
    ? reducedMotionVariants
    : variants;
  const activeTransition = prefersReducedMotion
    ? { duration: 0.01 }
    : defaultTransition;

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10% 0px" }}
      variants={activeVariants}
      transition={activeTransition}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
