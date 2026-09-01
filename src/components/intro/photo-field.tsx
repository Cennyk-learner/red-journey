"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { motion, useScroll, useVelocity, type MotionValue } from "motion/react";
import {
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import * as THREE from "three";
import {
  getPhotoFieldImages,
  getPhotoFieldPriorityCount,
} from "@/data/photo-field-images";
import { useReducedMotion, EASE_OUT_EXPO } from "@/lib/motion";

// ============================================================
// PhotoField — 开场漂浮照片场(照抄 ai-app 模板 hero 的照片环)
// three.js 着色器瓦片:四圈同心环缓慢旋转、瓦片随切线转但照片
// 在世界空间采样保持正立、SDF 圆角+1px 描边、中心径向淡出
// (给询问卡留白)+ 底部渐隐(给地球让位)、滚动速度助推。
// 与模板的差异仅两点:
//   1. 图片换成本项目实拍素材(本地 /public,后续直接替换数组)
//   2. hidden prop:选定目的地后整场外扩淡出,衔接水墨过渡
// ============================================================

const FIELD_IMAGES = getPhotoFieldImages();
const IMAGE_COUNT = Math.max(FIELD_IMAGES.length, 1);
const PRIORITY_COUNT = Math.min(getPhotoFieldPriorityCount(), IMAGE_COUNT);
const LOAD_CONCURRENCY = 4;

type Ring = {
  radiusVmax: number;
  radiusMax: number;
  duration: number;
  count: number;
  phase: number;
};

const RINGS: Ring[] = [
  { radiusVmax: 20, radiusMax: 280, duration: 50, count: 9, phase: 0 },
  { radiusVmax: 38.5, radiusMax: 580, duration: 85, count: 13, phase: 24 },
  { radiusVmax: 57, radiusMax: 880, duration: 120, count: 17, phase: 42 },
  { radiusVmax: 75.5, radiusMax: 1180, duration: 155, count: 21, phase: 60 },
];

const TILE_MAX_PX = 144;
const TILE_VW = 0.14;
const IMAGE_MAX_PX = 236;
const IMAGE_VW = 0.225;
const PAN_RADIUS = 22;
const TILE_PAD = 2;
const FIELD_CAP_PX = 1800;
const BOTTOM_FADE_FRACTION = 0.28;
const BOTTOM_FADE_MAX_PX = 340;

const SPEED_DIVISOR = 300;
const MAX_BOOST = 14;
const BOOST_STAGGER = 0.6;
const LAG_BASE = 0.1;
const LAG_STEP = 0.14;
const STRETCH_BASE = 0.08;
const STRETCH_STEP = 0.06;

const DEG = Math.PI / 180;

const TILE_VERTEX = /* glsl */ `
  uniform vec2 uQuadSize;
  varying vec2 vLocal;
  varying vec2 vWorld;
  void main() {
    vLocal = position.xy * uQuadSize;
    vec4 world = modelMatrix * vec4(vLocal, 0.0, 1.0);
    vWorld = world.xy;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const TILE_FRAGMENT = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uHasMap;
  uniform vec2 uTileHalf;
  uniform float uRadius;
  uniform vec2 uImgCenter;
  uniform float uImgSize;
  uniform vec4 uBorder;
  uniform vec4 uFade;       // rx, ry, fade center y, global alpha
  uniform vec2 uBottomFade; // bottom edge y, fade height
  varying vec2 vLocal;
  varying vec2 vWorld;

  float sdRoundRect(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  void main() {
    float d = sdRoundRect(vLocal, uTileHalf, uRadius);
    float shape = 1.0 - smoothstep(-0.75, 0.75, d);
    if (shape <= 0.001) discard;

    vec2 uv = (vWorld - uImgCenter) / uImgSize + 0.5;
    vec4 tex = texture2D(uMap, uv);
    vec3 rgb = mix(vec3(0.0), tex.rgb, uHasMap);
    float alpha = uHasMap;

    float border = (1.0 - smoothstep(0.5, 1.5, abs(d + 1.0))) * uBorder.a;
    rgb = mix(rgb, uBorder.rgb, border);
    alpha = max(alpha, border);

    vec2 q = vec2(vWorld.x / uFade.x, (vWorld.y - uFade.z) / uFade.y);
    float t = length(q);
    float fade = t < 0.42
      ? mix(0.0, 0.5, clamp((t - 0.24) / 0.18, 0.0, 1.0))
      : t < 0.62
        ? mix(0.5, 0.9, clamp((t - 0.42) / 0.20, 0.0, 1.0))
        : mix(0.9, 1.0, clamp((t - 0.62) / 0.16, 0.0, 1.0));

    float bottom = clamp((vWorld.y - uBottomFade.x) / uBottomFade.y, 0.0, 1.0);

    gl_FragColor = vec4(rgb, shape * alpha * fade * bottom * uFade.w);
  }
`;

type TileUniforms = {
  uMap: { value: THREE.Texture | null };
  uHasMap: { value: number };
  uQuadSize: { value: THREE.Vector2 };
  uTileHalf: { value: THREE.Vector2 };
  uRadius: { value: number };
  uImgCenter: { value: THREE.Vector2 };
  uImgSize: { value: number };
  uBorder: { value: THREE.Vector4 };
  uFade: { value: THREE.Vector4 };
  uBottomFade: { value: THREE.Vector2 };
};

type Tile = {
  ring: number;
  staticAngle: number;
  rounding: number;
  panX: number;
  panY: number;
  img: number;
  uniforms: TileUniforms;
  material: THREE.ShaderMaterial;
};

function FieldScene({
  sources,
  reduced,
  velocity,
  hiddenRef,
}: {
  sources: RefObject<(HTMLCanvasElement | null)[]>;
  reduced: boolean;
  velocity: MotionValue<number>;
  hiddenRef: RefObject<boolean>;
}): ReactNode {
  const { size, gl } = useThree();
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const textures = useRef<(THREE.Texture | null)[]>([]);
  const sim = useRef({
    angles: RINGS.map(() => 0),
    boosts: RINGS.map(() => 0),
    globalAlpha: 1,
  });

  const geometry = useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => {
    const cache = textures.current;
    return () => {
      cache.forEach((texture) => texture?.dispose());
    };
  }, []);

  const tiles = useMemo<Tile[]>(
    () =>
      RINGS.flatMap((ring, r) =>
        Array.from({ length: ring.count }, (_, i) => {
          const seed = r * 53 + i * 17;
          const panAngle = ((seed * 37) % 360) * DEG;
          const uniforms: TileUniforms = {
            uMap: { value: null },
            uHasMap: { value: 0 },
            uQuadSize: { value: new THREE.Vector2(1, 1) },
            uTileHalf: { value: new THREE.Vector2(1, 1) },
            uRadius: { value: 20 },
            uImgCenter: { value: new THREE.Vector2(0, 0) },
            uImgSize: { value: IMAGE_MAX_PX },
            uBorder: { value: new THREE.Vector4(0.12, 0.08, 0.07, 0.15) },
            uFade: { value: new THREE.Vector4(1, 1, 0, 1) },
            uBottomFade: { value: new THREE.Vector2(0, 1) },
          };
          // 命令式创建:r3f 的 uniforms prop 会克隆对象,破坏后续
          // `.value =` 重新赋值(如纹理挂载),模板同款做法
          const material = new THREE.ShaderMaterial({
            uniforms,
            vertexShader: TILE_VERTEX,
            fragmentShader: TILE_FRAGMENT,
            transparent: true,
            depthWrite: false,
            depthTest: false,
          });
          return {
            ring: r,
            staticAngle: (ring.phase + (360 / ring.count) * i) * DEG,
            rounding: 20 + (seed % 14),
            panX: Math.cos(panAngle) * PAN_RADIUS,
            panY: Math.sin(panAngle) * PAN_RADIUS,
            img: (RINGS.slice(0, r).reduce((n, ring) => n + ring.count, 0) + i) % IMAGE_COUNT,
            uniforms,
            material,
          };
        })
      ),
    []
  );

  useEffect(
    () => () => {
      tiles.forEach((tile) => tile.material.dispose());
    },
    [tiles]
  );

  const metrics = useMemo(() => {
    const vh = typeof window === "undefined" ? size.height : window.innerHeight;
    const vw = size.width;
    const vmax = Math.max(vw, vh) / 100;
    return {
      radii: RINGS.map((ring) =>
        Math.min(ring.radiusVmax * vmax, ring.radiusMax)
      ),
      tileW: Math.min(TILE_MAX_PX, vw * TILE_VW),
      imgSize: Math.min(IMAGE_MAX_PX, vw * IMAGE_VW),
    };
  }, [size.width, size.height]);

  useEffect(() => {
    const tileH = metrics.tileW * 0.75;
    const rx = Math.min(size.width, FIELD_CAP_PX) * 1.2;
    const ry = size.height * 1.05;
    const fadeH = Math.min(
      BOTTOM_FADE_MAX_PX,
      size.height * BOTTOM_FADE_FRACTION
    );
    const yBottom = -size.height / 2;
    tiles.forEach((tile) => {
      tile.uniforms.uQuadSize.value.set(
        metrics.tileW + TILE_PAD,
        tileH + TILE_PAD
      );
      tile.uniforms.uTileHalf.value.set(metrics.tileW / 2, tileH / 2);
      tile.uniforms.uRadius.value = Math.min(tile.rounding, tileH / 2);
      tile.uniforms.uImgSize.value = metrics.imgSize;
      tile.uniforms.uFade.value.setX(rx);
      tile.uniforms.uFade.value.setY(ry);
      tile.uniforms.uBottomFade.value.set(yBottom, fadeH);
    });
  }, [tiles, metrics, size.width, size.height]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.064);
    const target = reduced
      ? 0
      : Math.min(Math.abs(velocity.get()) / SPEED_DIVISOR, MAX_BOOST);
    const s = sim.current;

    // 选定目的地 → 整场淡出(着色器全局 alpha,与外层 motion 缩放配合)
    const alphaTarget = hiddenRef.current ? 0 : 1;
    s.globalAlpha +=
      (alphaTarget - s.globalAlpha) * (1 - Math.exp(-dt / 0.28));

    RINGS.forEach((ring, i) => {
      const lag = LAG_BASE + LAG_STEP * i;
      const previous = s.boosts[i] ?? 0;
      const boost = previous + (target - previous) * (1 - Math.exp(-dt / lag));
      s.boosts[i] = boost;
      if (!reduced) {
        const speed = (360 / ring.duration) * DEG;
        s.angles[i] =
          (s.angles[i] ?? 0) + dt * speed * (1 + boost * (1 + BOOST_STAGGER * i));
      }
    });

    const imgs = sources.current;
    // 纹理上传限流:每帧最多 1 张,避免 11 张同帧解码上传掉帧
    let uploaded = false;
    tiles.forEach((tile, index) => {
      const mesh = meshes.current[index];
      if (!mesh) return;
      const boost = s.boosts[tile.ring] ?? 0;
      const stretch =
        1 + (boost / MAX_BOOST) * (STRETCH_BASE + STRETCH_STEP * tile.ring);
      const radius = (metrics.radii[tile.ring] ?? 0) * stretch;
      const theta = (s.angles[tile.ring] ?? 0) + tile.staticAngle;
      const x = radius * Math.sin(theta);
      const y = radius * Math.cos(theta);
      mesh.position.set(x, y, 0);
      mesh.rotation.z = -(theta + Math.PI / 2);
      tile.uniforms.uImgCenter.value.set(x + tile.panX, y - tile.panY);
      tile.uniforms.uFade.value.setW(s.globalAlpha);

      if (!tile.uniforms.uMap.value) {
        let texture = textures.current[tile.img];
        if (!texture && !uploaded) {
          const source = imgs[tile.img];
          if (source) {
            texture = new THREE.Texture(source);
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.anisotropy = Math.min(
              4,
              gl.capabilities.getMaxAnisotropy()
            );
            texture.needsUpdate = true;
            textures.current[tile.img] = texture;
            uploaded = true;
          }
        }
        if (texture) {
          tile.uniforms.uMap.value = texture;
          tile.uniforms.uHasMap.value = 1;
        }
      }
    });
  });

  return (
    <>
      {tiles.map((tile, index) => (
        <mesh
          key={index}
          geometry={geometry}
          frustumCulled={false}
          ref={(el) => {
            meshes.current[index] = el;
          }}
        >
          <primitive object={tile.material} attach="material" />
        </mesh>
      ))}
    </>
  );
}

interface PhotoFieldProps {
  /** true = 已选目的地:整场外扩淡出,衔接水墨过渡 */
  hidden: boolean;
  className?: string;
}

export function PhotoField({ hidden, className }: PhotoFieldProps): ReactNode {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const sourcesRef = useRef<(HTMLCanvasElement | null)[]>([]);
  const hiddenRef = useRef(hidden);
  hiddenRef.current = hidden;

  // 预载纹理:优先内圈 9 张,其余并发限流;已烘焙的 WebP 直接上传,不再运行时缩放
  useEffect(() => {
    let cancelled = false;
    const MAX_TEX = 640;

    const loadOne = async (index: number): Promise<void> => {
      if (cancelled || sourcesRef.current[index]) return;
      const src = FIELD_IMAGES[index] ?? "";
      if (!src) return;

      const img = new window.Image();
      img.src = src;
      try {
        await img.decode();
      } catch {
        return;
      }
      if (cancelled) return;

      const isBakedThumb = src.includes("/photo-field/");
      if (isBakedThumb) {
        const cv = document.createElement("canvas");
        cv.width = img.naturalWidth;
        cv.height = img.naturalHeight;
        cv.getContext("2d")?.drawImage(img, 0, 0);
        sourcesRef.current[index] = cv;
        return;
      }

      const scale = Math.min(
        1,
        MAX_TEX / Math.max(img.naturalWidth, img.naturalHeight, 1)
      );
      const cv = document.createElement("canvas");
      cv.width = Math.max(1, Math.round(img.naturalWidth * scale));
      cv.height = Math.max(1, Math.round(img.naturalHeight * scale));
      cv.getContext("2d")?.drawImage(img, 0, 0, cv.width, cv.height);
      sourcesRef.current[index] = cv;
    };

    const order = [
      ...Array.from({ length: PRIORITY_COUNT }, (_, i) => i),
      ...Array.from(
        { length: IMAGE_COUNT - PRIORITY_COUNT },
        (_, i) => i + PRIORITY_COUNT
      ),
    ];

    void (async () => {
      let cursor = 0;
      const workers = Array.from({ length: LOAD_CONCURRENCY }, async () => {
        while (!cancelled) {
          const index = order[cursor++];
          if (index === undefined) break;
          await loadOne(index);
        }
      });
      await Promise.all(workers);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <motion.div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
      initial={{ opacity: 0 }}
      animate={hidden ? { opacity: 0, scale: 1.06 } : { opacity: 1, scale: 1 }}
      transition={{ duration: hidden ? 0.9 : 1.1, ease: EASE_OUT_EXPO }}
    >
      <Canvas
        orthographic
        flat
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 100], zoom: 1, near: 0.1, far: 1000 }}
        gl={{
          alpha: true,
          antialias: false,
          powerPreference: "high-performance",
        }}
        resize={{ scroll: false, offsetSize: true }}
        style={{ position: "absolute", inset: 0 }}
      >
        <FieldScene
          sources={sourcesRef}
          reduced={reduced}
          velocity={scrollVelocity}
          hiddenRef={hiddenRef}
        />
      </Canvas>
    </motion.div>
  );
}

export default PhotoField;
