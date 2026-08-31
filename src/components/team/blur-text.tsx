"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

/** 逐字 blur 显现 — 中文按字符,英文按词 */
export function BlurText({
  text,
  delay = 0,
  className,
}: {
  text: string;
  delay?: number;
  className?: string;
}): ReactNode {
  const isLatin = /^[\x00-\x7F\s]+$/.test(text);
  const units = isLatin ? text.split(/(\s+)/).filter(Boolean) : [...text];

  let index = 0;

  return (
    <span className={className}>
      {units.map((unit, i) => {
        const isSpace = isLatin && /^\s+$/.test(unit);
        const charDelay = delay + index * 0.03;
        if (!isSpace) index += unit.length;
        else index += 1;

        if (isLatin && isSpace) {
          return <span key={i}>{unit}</span>;
        }

        const chars = isLatin ? [...unit] : [unit];
        return (
          <span key={i} className="inline-flex">
            {chars.map((char, j) => {
              const totalIndex = isLatin
                ? units.slice(0, i).join("").length + j
                : i;
              return (
                <motion.span
                  key={j}
                  initial={{ opacity: 0, filter: "blur(12px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  transition={{
                    duration: 0.4,
                    delay: delay + totalIndex * 0.03,
                    ease: "easeOut",
                  }}
                  className="inline-block"
                >
                  {char}
                </motion.span>
              );
            })}
            {isLatin && i < units.length - 1 ? "\u00A0" : null}
          </span>
        );
      })}
    </span>
  );
}
