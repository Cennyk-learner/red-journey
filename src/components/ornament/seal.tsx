"use client";

import { useId, type ReactNode } from "react";

// ============================================================
// 钤印 Seal
// 朱砂印。两种刻法都支持:
//   白文(阴刻)= 朱底白字,做站点标记用,视觉最重
//   朱文(阳刻)= 白底朱字朱框,做落款与次级标记
//
// 关键是别做成"干净的圆角红方块"—— 真印章的边缘是被印泥吃掉的。
// 所以整组图形过一道 feTurbulence 位移(把边缘啃出毛口),再叠一层
// 噪点做印泥的浓淡不均。filter id 用 useId 隔离,同页多枚印不串味。
// ============================================================

type Carve = "yin" | "yang";

interface SealProps {
  /** 印文,1/2/4 字最好看;3 字走单列 */
  text: string;
  /** 边长(px) */
  size?: number;
  carve?: Carve;
  /** 印泥色,默认朱砂 */
  color?: string;
  /** 白文的字色/朱文的底色 */
  ground?: string;
  className?: string;
}

/** 印文格位:自右向左、自上而下,与传统读序一致 */
function layout(count: number): { cols: number; rows: number } {
  if (count <= 1) return { cols: 1, rows: 1 };
  if (count === 2) return { cols: 1, rows: 2 };
  if (count === 3) return { cols: 1, rows: 3 };
  return { cols: 2, rows: Math.ceil(count / 2) };
}

const BOX = 100;

export function Seal({
  text,
  size = 44,
  carve = "yin",
  color = "var(--cinnabar)",
  ground = "var(--rice)",
  className,
}: SealProps): ReactNode {
  const uid = useId().replace(/:/g, "");
  const chars = [...text].slice(0, 4);
  const { cols, rows } = layout(chars.length);

  // 印面留边要窄:传统印章的字几乎顶到边框,留太多白就成了圆角红方块。
  // 朱文要给边框让位,所以留边更宽一点。
  const pad = carve === "yang" ? 19 : 11;
  const cellW = (BOX - pad * 2) / cols;
  const cellH = (BOX - pad * 2) / rows;
  const glyphSize = Math.min(cellW, cellH) * (chars.length > 1 ? 0.96 : 1.04);

  const inkColor = carve === "yin" ? ground : color;

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox={`0 0 ${BOX} ${BOX}`}
      role="img"
      aria-label={text}
    >
      <defs>
        {/* 边缘毛口:低频湍流做位移,幅度不能大,大了就成了融化的方块 */}
        <filter id={`bite-${uid}`} x="-12%" y="-12%" width="124%" height="124%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.075"
            numOctaves="3"
            seed="11"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="3.2"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
        {/* 印泥浓淡:高频噪点当遮罩,啃掉一点点朱色 */}
        <filter id={`mottle-${uid}`}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.62"
            numOctaves="2"
            seed="5"
          />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  1 0 0 0 -0.35"
          />
        </filter>
        <mask id={`ink-${uid}`}>
          <rect x="0" y="0" width={BOX} height={BOX} fill="#fff" />
          <rect
            x="0"
            y="0"
            width={BOX}
            height={BOX}
            filter={`url(#mottle-${uid})`}
          />
        </mask>
      </defs>

      <g filter={`url(#bite-${uid})`} mask={`url(#ink-${uid})`}>
        {carve === "yin" ? (
          <rect x="2" y="2" width={BOX - 4} height={BOX - 4} fill={color} />
        ) : (
          <rect
            x="4"
            y="4"
            width={BOX - 8}
            height={BOX - 8}
            fill="none"
            stroke={color}
            strokeWidth="7"
          />
        )}

        {chars.map((ch, i) => {
          const col = Math.floor(i / rows);
          const row = i % rows;
          // 自右向左排列:第 0 列在最右
          const cx = BOX - pad - cellW * (col + 0.5);
          const cy = pad + cellH * (row + 0.5);
          return (
            <text
              key={`${ch}-${i}`}
              x={cx}
              y={cy}
              fill={inkColor}
              fontSize={glyphSize}
              textAnchor="middle"
              dominantBaseline="central"
              style={{ fontFamily: "var(--font-brush)" }}
            >
              {ch}
            </text>
          );
        })}
      </g>
    </svg>
  );
}
