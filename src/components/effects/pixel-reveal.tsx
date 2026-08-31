"use client";

import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { cn } from "@/lib/utils";

export type PixelRevealEasing = "linear" | "easeIn" | "easeOut" | "easeInOut";
export type PixelRevealDirection = "up" | "down" | "left" | "right";

export interface PixelRevealProps {
  imageSrc: string;
  width?: string | number;
  height?: string | number;
  gridSize?: number;
  transitionColor?: string;
  edgeHeight?: number;
  duration?: number;
  easing?: PixelRevealEasing;
  direction?: PixelRevealDirection;
  autoTrigger?: boolean;
  triggerOnce?: boolean;
  triggerThreshold?: number;
  paused?: boolean;
  borderRadius?: string | number;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  onRevealComplete?: () => void;
}

export interface PixelRevealRef {
  trigger: () => void;
  reset: () => void;
  play: () => void;
}

const VERTEX_SHADER = `
varying vec2 vUv;
uniform vec2 uContainerRes;
uniform vec2 uTexRes;
vec2 coverUv(vec2 uv, vec2 texSize, vec2 viewSize) {
  vec2 ratio = vec2(
    min((viewSize.x / viewSize.y) / (texSize.x / texSize.y), 1.0),
    min((viewSize.y / viewSize.x) / (texSize.y / texSize.x), 1.0)
  );
  return uv * ratio + (1.0 - ratio) * 0.5;
}
void main() {
  vUv = coverUv(uv, uTexRes, uContainerRes);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;
uniform sampler2D uTexture;
uniform vec2 uTexRes;
uniform vec2 uContainerRes;
uniform float uProgress;
uniform float uGridSize;
uniform float uEdgeHeight;
uniform vec3 uColor;
uniform int uAxis;
varying vec2 vUv;
float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}
vec2 squaresGrid(vec2 uv) {
  float texAspectX = uTexRes.x / uTexRes.y;
  float texAspectY = uTexRes.y / uTexRes.x;
  vec2 ratio = vec2(
    min(texAspectX / 1.0, 1.0),
    min(texAspectY / 1.0, 1.0)
  );
  return vec2(
    uv.x * ratio.x + (1.0 - ratio.x) * 0.5,
    uv.y * ratio.y + (1.0 - ratio.y) * 0.5
  );
}
void main() {
  vec2 squareUvs = squaresGrid(vUv);
  float shortSide = min(uContainerRes.x, uContainerRes.y);
  float cells = floor(shortSide / max(uGridSize, 1.0));
  cells = max(cells, 1.0);
  vec2 grid = vec2(
    floor(squareUvs.x * cells) / cells,
    floor(squareUvs.y * cells) / cells
  );
  float a;
  if (uAxis == 1) a = grid.y;
  else if (uAxis == 0) a = 1.0 - grid.y - (1.0 / cells);
  else if (uAxis == 2) a = grid.x;
  else a = 1.0 - grid.x - (1.0 / cells);
  float h = max(uEdgeHeight, 0.0001);
  float edge = (1.0 + h) - (uProgress * (1.0 + h + h));
  float dToEdge = distance(a, edge);
  float invDist = 1.0 - dToEdge;
  float clamped = smoothstep(h, 0.0, dToEdge);
  float rand = random(grid);
  float randDist = step(1.0 - h * rand, invDist);
  float dist = step(1.0 - h, invDist);
  float alpha = dist * (clamped + rand - 0.5 * (1.0 - randDist));
  alpha = clamp(alpha, 0.0, 1.0);
  vec4 gridColor = vec4(uColor, alpha);
  vec4 tex = texture2D(uTexture, vUv);
  tex.rgba *= step(edge, a);
  gl_FragColor = mix(tex, gridColor, gridColor.a);
}
`;

const AXIS_INDEX: Record<PixelRevealDirection, number> = {
  up: 0,
  down: 1,
  left: 2,
  right: 3,
};

function easeProgress(t: number, easing: PixelRevealEasing): number {
  const x = Math.max(0, Math.min(1, t));
  switch (easing) {
    case "easeIn":
      return x * x;
    case "easeOut":
      return 1 - (1 - x) * (1 - x);
    case "easeInOut":
      return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
    default:
      return x;
  }
}

interface AnimController {
  progress: number;
  raw: number;
  startedAt: number | null;
  startRaw: number;
  completed: boolean;
}

interface SceneProps {
  imageSrc: string;
  gridSize: number;
  transitionColor: string;
  edgeHeight: number;
  axis: number;
  controllerRef: React.RefObject<AnimController>;
}

function createUniforms() {
  return {
    uTexture: { value: null as THREE.Texture | null },
    uTexRes: { value: new THREE.Vector2(1, 1) },
    uContainerRes: { value: new THREE.Vector2(1, 1) },
    uProgress: { value: 0 },
    uGridSize: { value: 20 },
    uEdgeHeight: { value: 0.2 },
    uColor: { value: new THREE.Color("#0d0a08") },
    uAxis: { value: 1 },
  };
}

function Scene({
  imageSrc,
  gridSize,
  transitionColor,
  edgeHeight,
  axis,
  controllerRef,
}: SceneProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size, viewport } = useThree();
  const textureRef = useRef<THREE.Texture | null>(null);
  const [uniforms] = React.useState(createUniforms);
  const propsRef = useRef({ gridSize, transitionColor, edgeHeight, axis });

  useEffect(() => {
    propsRef.current = { gridSize, transitionColor, edgeHeight, axis };
  }, [gridSize, transitionColor, edgeHeight, axis]);

  useEffect(() => {
    if (!imageSrc) return;
    let cancelled = false;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    loader.load(
      imageSrc,
      (tex) => {
        if (cancelled) {
          tex.dispose();
          return;
        }
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        textureRef.current = tex;
      },
      undefined,
      () => {
        if (!cancelled) textureRef.current = null;
      },
    );
    return () => {
      cancelled = true;
      if (textureRef.current) {
        textureRef.current.dispose();
        textureRef.current = null;
      }
    };
  }, [imageSrc]);

  useFrame(() => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.ShaderMaterial;
    const u = mat.uniforms;
    const p = propsRef.current;
    u.uGridSize.value = p.gridSize;
    u.uEdgeHeight.value = p.edgeHeight;
    (u.uColor.value as THREE.Color).set(p.transitionColor);
    u.uAxis.value = p.axis;
    (u.uContainerRes.value as THREE.Vector2).set(
      Math.max(size.width, 1) * viewport.dpr,
      Math.max(size.height, 1) * viewport.dpr,
    );
    if (textureRef.current?.image) {
      u.uTexture.value = textureRef.current;
      const img = textureRef.current.image as HTMLImageElement;
      (u.uTexRes.value as THREE.Vector2).set(
        img.naturalWidth || img.width || 1,
        img.naturalHeight || img.height || 1,
      );
    }
    if (controllerRef.current) {
      u.uProgress.value = controllerRef.current.progress;
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  );
}

export const PixelReveal = React.forwardRef<PixelRevealRef, PixelRevealProps>(
  (
    {
      imageSrc,
      width = "100%",
      height = "100%",
      gridSize = 20,
      transitionColor = "#0d0a08",
      edgeHeight = 0.2,
      duration = 1.6,
      easing = "linear",
      direction = "down",
      autoTrigger = true,
      triggerOnce = false,
      triggerThreshold = 0,
      paused = false,
      borderRadius = "0px",
      className,
      style,
      children,
      onRevealComplete,
    },
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number | null>(null);
    const hasFiredOnceRef = useRef(false);
    const controllerRef = useRef<AnimController>({
      progress: 0,
      raw: 0,
      startedAt: null,
      startRaw: 0,
      completed: false,
    });

    const durationRef = useRef(duration);
    const easingRef = useRef(easing);
    const pausedRef = useRef(paused);
    const onCompleteRef = useRef(onRevealComplete);

    useEffect(() => {
      durationRef.current = duration;
    }, [duration]);
    useEffect(() => {
      easingRef.current = easing;
    }, [easing]);
    useEffect(() => {
      pausedRef.current = paused;
    }, [paused]);
    useEffect(() => {
      onCompleteRef.current = onRevealComplete;
    }, [onRevealComplete]);

    const stopRaf = useCallback(() => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    }, []);

    const tickRef = useRef<((now: number) => void) | null>(null);

    useEffect(() => {
      const tick = (now: number) => {
        const c = controllerRef.current;
        if (c.startedAt === null) {
          rafRef.current = null;
          return;
        }
        if (pausedRef.current) {
          c.startedAt = now - (c.raw - c.startRaw) * durationRef.current * 1000;
          rafRef.current = requestAnimationFrame(tick);
          return;
        }
        const elapsed = (now - c.startedAt) / 1000;
        const span = Math.max(durationRef.current, 0.0001);
        const t = c.startRaw + elapsed / span;
        const clamped = Math.min(1, Math.max(0, t));
        c.raw = clamped;
        c.progress = easeProgress(clamped, easingRef.current);
        if (clamped >= 1) {
          c.startedAt = null;
          if (!c.completed) {
            c.completed = true;
            onCompleteRef.current?.();
          }
          rafRef.current = null;
          return;
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      tickRef.current = tick;
      return () => {
        tickRef.current = null;
      };
    }, []);

    const play = useCallback(() => {
      const c = controllerRef.current;
      if (c.raw >= 1) return;
      const fn = tickRef.current;
      if (!fn) return;
      c.startedAt = performance.now();
      c.startRaw = c.raw;
      c.completed = false;
      stopRaf();
      rafRef.current = requestAnimationFrame(fn);
    }, [stopRaf]);

    const reset = useCallback(() => {
      stopRaf();
      const c = controllerRef.current;
      c.raw = 0;
      c.progress = 0;
      c.startedAt = null;
      c.startRaw = 0;
      c.completed = false;
    }, [stopRaf]);

    useImperativeHandle(
      ref,
      () => ({
        trigger: play,
        play,
        reset,
      }),
      [play, reset],
    );

    useEffect(() => {
      const node = containerRef.current;
      if (!node || !autoTrigger) return;
      const threshold = Math.max(0, Math.min(1, triggerThreshold));
      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const visible =
              entry.isIntersecting && entry.intersectionRatio >= threshold;
            if (visible) {
              if (triggerOnce) {
                if (hasFiredOnceRef.current) continue;
                hasFiredOnceRef.current = true;
                reset();
                play();
              } else {
                reset();
                play();
              }
            } else if (!triggerOnce) {
              reset();
            }
          }
        },
        {
          threshold:
            threshold > 0
              ? [0, threshold, Math.min(1, threshold + 0.01)]
              : [0, 0.01],
        },
      );
      io.observe(node);
      return () => io.disconnect();
    }, [autoTrigger, triggerOnce, triggerThreshold, play, reset]);

    useEffect(() => () => stopRaf(), [stopRaf]);

    const axis = AXIS_INDEX[direction] ?? 1;
    const brVal =
      typeof borderRadius === "number" ? `${borderRadius}px` : borderRadius;

    return (
      <div
        ref={containerRef}
        className={cn("relative overflow-hidden", className)}
        style={{ width, height, borderRadius: brVal, ...style }}
      >
        <Canvas
          orthographic
          camera={{
            position: [0, 0, 1],
            zoom: 1,
            left: -1,
            right: 1,
            top: 1,
            bottom: -1,
          }}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
          className="absolute inset-0 h-full w-full"
        >
          <Scene
            imageSrc={imageSrc}
            gridSize={gridSize}
            transitionColor={transitionColor}
            edgeHeight={edgeHeight}
            axis={axis}
            controllerRef={controllerRef}
          />
        </Canvas>
        {children && (
          <div className="pointer-events-none relative z-10 h-full w-full">
            {children}
          </div>
        )}
      </div>
    );
  },
);

PixelReveal.displayName = "PixelReveal";
