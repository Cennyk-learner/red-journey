"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
  type TransformTemplate,
} from "motion/react";
import { cn } from "@/lib/utils";

export interface TiltedTilesProps {
  images?: string[];
  columns?: number;
  tilesPerColumn?: number;
  tileAspect?: number;
  rowGap?: number;
  columnGap?: number;
  borderRadius?: number;
  perspective?: number;
  rotateX?: number;
  rotateY?: number;
  rotateZ?: number;
  offsetX?: number;
  offsetY?: number;
  offsetZ?: number;
  planeWidth?: number;
  planeHeight?: number;
  stagger?: number;
  duration?: number;
  alternate?: boolean;
  fadeTop?: number;
  fadeBottom?: number;
  parallax?: boolean;
  parallaxStrength?: number;
  pauseOnHover?: boolean;
  saturation?: number;
  width?: number | string;
  height?: number | string;
  className?: string;
}

const FALLOFF = [
  [0, 0],
  [0.153, 0.02],
  [0.171, 0.035],
  [0.243, 0.075],
  [0.35, 0.15],
  [0.5, 0.3],
  [1, 1],
];

const scramble = (n: number) => {
  let x = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b);
  x ^= x >>> 13;
  x = Math.imul(x, 0xc2b2ae35);
  return (x ^ (x >>> 16)) >>> 0;
};

const coprimeSteps = (size: number) => {
  const divides = (a: number, b: number): number => (b ? divides(b, a % b) : a);
  const found: number[] = [];
  for (let step = 1; step < size; step += 1) {
    if (divides(step, size) === 1) found.push(step);
  }
  return found.length ? found : [1];
};

const edgeMask = (top: number, bottom: number) => {
  if (top <= 0 && bottom <= 0) return undefined;
  const stops: string[] = [];

  if (top > 0) {
    FALLOFF.forEach(([at, alpha]) => {
      stops.push(`rgb(0 0 0 / ${alpha}) ${(at * top).toFixed(3)}%`);
    });
  } else {
    stops.push("rgb(0 0 0 / 1) 0%");
  }

  if (bottom > 0) {
    [...FALLOFF].reverse().forEach(([at, alpha]) => {
      stops.push(`rgb(0 0 0 / ${alpha}) ${(100 - at * bottom).toFixed(3)}%`);
    });
  } else {
    stops.push("rgb(0 0 0 / 1) 100%");
  }

  return `linear-gradient(to bottom, ${stops.join(", ")})`;
};

interface StripProps {
  sources: string[];
  progress: MotionValue<number>;
  rising: boolean;
  lead: number;
  gap: number;
  aspect: number;
  radius: number;
  repeats: number;
}

const Strip = ({
  sources,
  progress,
  rising,
  lead,
  gap,
  aspect,
  radius,
  repeats,
}: StripProps) => {
  const span = 100 / repeats;
  const y = useTransform(progress, (p) => `${(rising ? -p : p - 1) * span}%`);
  const tiled = useMemo(
    () => Array.from({ length: repeats }, () => sources).flat(),
    [repeats, sources],
  );

  return (
    <div className="overflow-hidden" style={{ paddingTop: `${lead}%` }}>
      <motion.div className="flex flex-col" style={{ y, rowGap: gap }}>
        {tiled.map((src, index) => (
          <div
            key={`${src}-${index}`}
            className="w-full shrink-0 bg-paper bg-cover bg-center bg-no-repeat"
            style={{
              aspectRatio: aspect,
              borderRadius: radius,
              backgroundImage: `url(${src})`,
            }}
          />
        ))}
      </motion.div>
    </div>
  );
};

export default function TiltedTiles({
  images = [],
  columns = 16,
  tilesPerColumn = 5,
  tileAspect = 1,
  rowGap = 8,
  columnGap = 8,
  borderRadius = 0,
  perspective = 1600,
  rotateX = 40,
  rotateY = 16,
  rotateZ = -20,
  offsetX = -40,
  offsetY = 0,
  offsetZ = 0,
  planeWidth = 280,
  planeHeight = 260,
  stagger = 20,
  duration = 25,
  alternate = true,
  fadeTop = 22,
  fadeBottom = 0,
  parallax = true,
  parallaxStrength = 8,
  pauseOnHover = false,
  saturation = 1,
  width = "100%",
  height = "100%",
  className,
}: TiltedTilesProps) {
  const still = useReducedMotion() ?? false;
  const progress = useMotionValue(0);
  const frozen = useRef(false);

  useAnimationFrame((_, delta) => {
    if (frozen.current || still) return;
    const span = Math.max(duration, 0.5);
    const next = progress.get() + delta / 1000 / span;
    progress.set(next - Math.floor(next));
  });

  const leanX = useSpring(0, { stiffness: 70, damping: 18, mass: 0.6 });
  const leanY = useSpring(0, { stiffness: 70, damping: 18, mass: 0.6 });

  const tiltX = useTransform(leanX, (v) => rotateX + v);
  const tiltY = useTransform(leanY, (v) => rotateY + v);

  const composeTransform = useCallback<TransformTemplate>(
    ({ rotateX: rx, rotateY: ry, rotate, x, y, z }) =>
      `translate(-50%, -50%) rotateX(${rx}) rotateY(${ry}) rotate(${rotate}) translate3d(${x}, ${y}, ${z})`,
    [],
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!parallax) return;
      const box = event.currentTarget.getBoundingClientRect();
      const nx = (event.clientX - box.left) / box.width - 0.5;
      const ny = (event.clientY - box.top) / box.height - 0.5;
      leanY.set(nx * parallaxStrength * 2);
      leanX.set(-ny * parallaxStrength * 2);
    },
    [leanX, leanY, parallax, parallaxStrength],
  );

  const onPointerLeave = useCallback(() => {
    frozen.current = false;
    leanX.set(0);
    leanY.set(0);
  }, [leanX, leanY]);

  const strips = useMemo(() => {
    const pool = images.length ? images : [];
    if (!pool.length) return [];
    const depth = Math.max(tilesPerColumn, 2);
    const steps = coprimeSteps(pool.length);
    return Array.from({ length: Math.max(columns, 1) }, (_, column) => {
      const start = scramble(column) % pool.length;
      const step = steps[scramble(column * 2 + 1) % steps.length];
      return Array.from(
        { length: depth },
        (_, tile) => pool[(start + tile * step) % pool.length],
      );
    });
  }, [columns, images, tilesPerColumn]);

  const planeRef = useRef<HTMLDivElement | null>(null);
  const [box, setBox] = useState({ column: 0, height: 0 });

  useEffect(() => {
    const node = planeRef.current;
    if (!node) return;
    const lanes = Math.max(columns, 1);
    const observer = new ResizeObserver(() => {
      setBox({
        column: (node.clientWidth - columnGap * (lanes - 1)) / lanes,
        height: node.clientHeight,
      });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [columnGap, columns]);

  const repeats = useMemo(() => {
    const tileHeight = box.column / Math.max(tileAspect, 0.05) + rowGap;
    const cycle = Math.max(tilesPerColumn, 2) * tileHeight;
    if (!cycle || !box.height) return 2;
    return Math.min(Math.max(Math.ceil(box.height / cycle) + 1, 2), 10);
  }, [box.column, box.height, rowGap, tileAspect, tilesPerColumn]);

  const mask = useMemo(
    () => edgeMask(fadeTop, fadeBottom),
    [fadeBottom, fadeTop],
  );

  if (!images.length) return null;

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{
        width,
        height,
        perspective,
        maskImage: mask,
        WebkitMaskImage: mask,
        filter: saturation === 1 ? undefined : `saturate(${saturation})`,
      }}
      onPointerMove={onPointerMove}
      onPointerEnter={() => {
        if (pauseOnHover) frozen.current = true;
      }}
      onPointerLeave={onPointerLeave}
    >
      <motion.div
        ref={planeRef}
        className="absolute left-1/2 top-1/2 grid"
        transformTemplate={composeTransform}
        style={{
          width: `${planeWidth}%`,
          height: `${planeHeight}%`,
          gridTemplateColumns: `repeat(${Math.max(columns, 1)}, minmax(0, 1fr))`,
          columnGap,
          rotateX: tiltX,
          rotateY: tiltY,
          rotate: rotateZ,
          x: offsetX,
          y: offsetY,
          z: offsetZ,
        }}
      >
        {strips.map((sources, column) => (
          <Strip
            key={column}
            sources={sources}
            progress={progress}
            rising={!alternate || column % 2 === 0}
            lead={stagger * (2 - (column % 3))}
            gap={rowGap}
            aspect={tileAspect}
            radius={borderRadius}
            repeats={repeats}
          />
        ))}
      </motion.div>
    </div>
  );
}
