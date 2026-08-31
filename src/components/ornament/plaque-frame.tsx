import type { ReactNode } from "react";

// ============================================================
// 匾额框 PlaqueFrame
// 参考故宫「内右门」在线展示的框式:双道细边 + 四角回纹卡子,
// 可选一枚横跨上边的匾额题名。
//
// 两道连续细线交给 CSS 边框画(任意尺寸都是 1 物理像素,不会被
// SVG 缩放拉粗),SVG 只画四角回纹这类定形纹样。
// 如意云头没放在这里:框边只有二三十像素高,云头缩到那个尺寸
// 会被读成心形,反而廉价 —— 云头交给 RuyiHead 在长卷上大尺寸用。
// ============================================================

/** 四角回纹卡子:内嵌一个方回,与边框的两道线呼应 */
const CORNER_PATH = "M1 25V1h24M1 13h12V1";

type Tone = "ink" | "paper";

interface ToneSpec {
  rule: string;
  ruleFaint: string;
  ornament: string;
  ground: string;
}

const TONES: Record<Tone, ToneSpec> = {
  paper: {
    rule: "var(--rule-strong)",
    ruleFaint: "var(--rule)",
    ornament: "var(--cinnabar)",
    ground: "var(--rice)",
  },
  ink: {
    rule: "var(--rule-invert-strong)",
    ruleFaint: "var(--rule-invert)",
    ornament: "var(--glaze)",
    ground: "var(--ink-ground)",
  },
};

function Corner({
  place,
  color,
}: {
  place: "tl" | "tr" | "bl" | "br";
  color: string;
}): ReactNode {
  const rotate = { tl: 0, tr: 90, br: 180, bl: 270 }[place];
  const pos = {
    tl: { left: 7, top: 7 },
    tr: { right: 7, top: 7 },
    br: { right: 7, bottom: 7 },
    bl: { left: 7, bottom: 7 },
  }[place];

  return (
    <svg
      aria-hidden
      width="26"
      height="26"
      viewBox="0 0 26 26"
      style={{ position: "absolute", rotate: `${rotate}deg`, ...pos }}
    >
      <path
        d={CORNER_PATH}
        fill="none"
        stroke={color}
        strokeWidth="1.1"
        strokeOpacity="0.78"
      />
    </svg>
  );
}

interface PlaqueFrameProps {
  children?: ReactNode;
  tone?: Tone;
  /** 横跨上边的匾额题名 */
  label?: ReactNode;
  className?: string;
}

export function PlaqueFrame({
  children,
  tone = "paper",
  label,
  className,
}: PlaqueFrameProps): ReactNode {
  const spec = TONES[tone];

  return (
    <div className={className} style={{ position: "relative" }}>
      {/* 外道细线 */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: -5,
          border: `1px solid ${spec.ruleFaint}`,
          pointerEvents: "none",
        }}
      />
      {/* 内道细线 + 四角回纹 + 云头 */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          border: `1px solid ${spec.rule}`,
          pointerEvents: "none",
        }}
      >
        <Corner place="tl" color={spec.ornament} />
        <Corner place="tr" color={spec.ornament} />
        <Corner place="bl" color={spec.ornament} />
        <Corner place="br" color={spec.ornament} />
      </div>

      {label != null && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 0,
            translate: "-50% -50%",
            background: spec.ground,
            border: `1px solid ${spec.rule}`,
            padding: "3px 18px",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </div>
      )}

      {children}
    </div>
  );
}
