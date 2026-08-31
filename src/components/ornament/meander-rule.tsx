import type { ReactNode } from "react";

// ============================================================
// 回纹带 MeanderRule
// 方折雷纹的横向连续带,替代原先那道渐变金线。
// 单元 24×8:主线沿底边走,中段折上去围出一个方回,首尾无缝续接。
// 两端做遮罩衰减,免得硬切边。
// ============================================================

const UNIT_W = 20;
const UNIT_H = 10;
/** 基线 */
const BASE_PATH = "M0 9h20";
/** 方折雷纹:从基线折上去,围出两个嵌套方格再落回基线 */
const FRET_PATH = "M2 9V2h6v5h4V2h6v7";

const HEX: Record<string, string> = {
  cinnabar: "#b5232b",
  glaze: "#c89b3c",
};

function tile(hex: string): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${UNIT_W}" height="${UNIT_H}" viewBox="0 0 ${UNIT_W} ${UNIT_H}">` +
    `<path d="${BASE_PATH}" fill="none" stroke="${hex}" stroke-width="1" stroke-opacity="0.32"/>` +
    `<path d="${FRET_PATH}" fill="none" stroke="${hex}" stroke-width="1.2" stroke-opacity="0.72"/>` +
    `</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

const FADE =
  "linear-gradient(to right, transparent, #000 14%, #000 86%, transparent)";

interface MeanderRuleProps {
  /** 墨底上用 glaze(琉璃黄),宣纸上用 cinnabar(朱砂) */
  tone?: "cinnabar" | "glaze";
  /** 中央嵌一枚菱形,用于分隔标题 */
  diamond?: boolean;
  /** 菱形描边色,需与所在底色一致 */
  diamondRing?: string;
  className?: string;
}

export function MeanderRule({
  tone = "cinnabar",
  diamond = false,
  diamondRing = "var(--rice)",
  className,
}: MeanderRuleProps): ReactNode {
  const hex = HEX[tone];

  return (
    <div
      aria-hidden
      className={className}
      style={{ position: "relative", height: UNIT_H }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: tile(hex),
          backgroundRepeat: "repeat-x",
          backgroundSize: `${UNIT_W}px ${UNIT_H}px`,
          maskImage: FADE,
          WebkitMaskImage: FADE,
        }}
      />
      {diamond && (
        <span
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 7,
            height: 7,
            translate: "-50% -50%",
            rotate: "45deg",
            background: hex,
            boxShadow: `0 0 0 3px ${diamondRing}`,
          }}
        />
      )}
    </div>
  );
}
