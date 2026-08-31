"use client";

import { Mesh, Program, Renderer, Texture, Triangle } from "ogl";
import { useEffect, useRef, type ReactNode } from "react";

// ============================================================
// 绢本底 SilkGround —— 长卷的画心材质(WebGL, ogl)
//
// 不是贴一张绢的图,而是用着色器把「绢」画出来:
//   经纬织纹(两组正交细线)+ fbm 墨色晕染 + 边缘做旧 + 极慢的墨气流动。
// 实拍照片以柔光混合嵌进绢面(soft-light),照片因此像印在绢上,
// 而不是浮在绢上 —— 这是素材只有一两张时不显空的关键。
//
// 卷面随滚动横移,但绢纹是「定」在绢上的(uOffset 跟着走),
// 墨气(uTime)则独立于滚动慢慢呼吸。
// ============================================================

const VERT = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uPhoto;
uniform float uHasPhoto;   // 0 = 无照片,纯绢
uniform float uTime;
uniform vec2 uRes;         // 视口尺寸(px)
uniform float uScrollW;    // 卷面总宽(px)
uniform float uOffset;     // 当前横向滚动(px)
uniform float uPhotoAspect;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
float noise(vec2 p){
  vec2 i=floor(p), f=fract(p);
  float a=hash(i), b=hash(i+vec2(1.,0.)), c=hash(i+vec2(0.,1.)), d=hash(i+vec2(1.,1.));
  vec2 u=f*f*(3.-2.*f);
  return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
}
float fbm(vec2 p){ float v=0.,a=.5; for(int i=0;i<5;i++){v+=a*noise(p);p*=2.;a*=.5;} return v; }

// 绢基色(暖白偏米,带一点旧绢的黄)
const vec3 SILK = vec3(0.949, 0.918, 0.847);
// 做旧的深边色
const vec3 AGE  = vec3(0.72, 0.62, 0.46);

void main(){
  // 卷面坐标:把视口 uv 映到整条绢面上,滚动时纹样跟着绢走
  float scrollPx = uOffset + vUv.x * uRes.x;
  vec2 scrollUv = vec2(scrollPx / uScrollW, vUv.y);

  // ── 经纬织纹 ─────────────────────────────────────────────
  // 两组正交细线,频率错开,叠加出绢的十字织感
  float weaveX = sin(scrollPx * 1.9) * 0.5 + 0.5;
  float weaveY = sin(vUv.y * uRes.y * 1.7) * 0.5 + 0.5;
  float weave = weaveX * weaveY;
  vec3 col = SILK * (0.965 + weave * 0.05);

  // ── 墨色晕染(慢流动)────────────────────────────────────
  float t = uTime * 0.05;
  vec2 q = scrollUv * vec2(uScrollW / uRes.y, uRes.y / uRes.y) * 2.2;
  vec2 warp = vec2(fbm(q + t), fbm(q + 5.2 - t));
  float ink = fbm(q * 1.3 + warp * 1.7 - t * 0.4);
  // 晕开的墨往暖灰里沉,不能死黑
  col = mix(col, vec3(0.62, 0.56, 0.47), smoothstep(0.52, 0.86, ink) * 0.5);

  // ── 边缘做旧 ─────────────────────────────────────────────
  // 上下两边(天头/地头)与卷首卷尾泛黄发暗
  float edgeY = smoothstep(0.0, 0.16, vUv.y) * smoothstep(1.0, 0.84, vUv.y);
  float edgeX = smoothstep(0.0, 0.05, scrollUv.x) * smoothstep(1.0, 0.95, scrollUv.x);
  float age = 1.0 - edgeX * edgeY;
  col = mix(col, AGE, age * 0.5);

  // ── 实拍照片以柔光嵌入 ───────────────────────────────────
  if (uHasPhoto > 0.5) {
    // 照片沿卷面平铺,保持比例 cover 卷面高度
    float viewAspect = uScrollW / uRes.y;
    vec2 s = viewAspect > uPhotoAspect
      ? vec2(1.0, uPhotoAspect / viewAspect)
      : vec2(viewAspect / uPhotoAspect, 1.0);
    vec2 puv = (scrollUv - 0.5) * s + 0.5;
    vec3 photo = texture2D(uPhoto, clamp(puv, 0.0, 1.0)).rgb;
    // 柔光混合:照片叠进绢的明暗里
    vec3 blended = mix(
      2.0 * col * photo + col * col * (1.0 - 2.0 * photo),
      sqrt(col) * (2.0 * photo - 1.0) + 2.0 * col * (1.0 - photo),
      step(0.5, photo)
    );
    // 只让照片淡淡透出来,像印在绢上,不能像贴上去
    col = mix(col, blended, 0.34);
  }

  // ── 细颗粒 ───────────────────────────────────────────────
  col += (hash(vUv * uRes.xy + uTime) - 0.5) * 0.016;

  gl_FragColor = vec4(col, 1.0);
}
`;

interface SilkGroundProps {
  /** 卷面总宽(px),纹样按它归一 */
  scrollWidth: number;
  /** 当前横向滚动(px),纹样跟着绢走 */
  offset: number;
  /** 嵌入绢面的实拍照片;null = 纯绢 */
  photoUrl?: string | null;
  className?: string;
}

export function SilkGround({
  scrollWidth,
  offset,
  photoUrl,
  className,
}: SilkGroundProps): ReactNode {
  const hostRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({ offset, scrollWidth });
  stateRef.current = { offset, scrollWidth };

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    const boot = () => {
      if (cancelled || !hostRef.current) return;
      const host = hostRef.current;

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const renderer = new Renderer({
        alpha: false,
        antialias: false,
        depth: false,
        stencil: false,
        dpr: 1,
      });
      const gl = renderer.gl;
      const canvas = gl.canvas;
      canvas.style.position = "absolute";
      canvas.style.inset = "0";
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.display = "block";
      host.appendChild(canvas);

      // 1×1 白像素占位,等照片来了再换
      const blank = new Texture(gl, {
        image: new Uint8Array([255, 255, 255, 255]),
        width: 1,
        height: 1,
      });

      const program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms: {
          uPhoto: { value: blank },
          uHasPhoto: { value: 0 },
          uTime: { value: 0 },
          uRes: { value: [1, 1] },
          uScrollW: { value: 1 },
          uOffset: { value: 0 },
          uPhotoAspect: { value: 1 },
        },
      });
      const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

      renderer.dpr = Math.min(window.devicePixelRatio || 1, 1.5);

      const resize = () => {
        const rect = host.getBoundingClientRect();
        renderer.setSize(Math.max(1, rect.width), Math.max(1, rect.height));
        program.uniforms.uRes.value = [rect.width, rect.height];
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(host);

      // 载入照片
      let token = 0;
      const loadPhoto = (url: string | null | undefined) => {
        const my = ++token;
        if (!url) {
          program.uniforms.uHasPhoto.value = 0;
          return;
        }
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          if (my !== token) return;
          const tex = new Texture(gl, {
            image: img,
            generateMipmaps: true,
            minFilter: gl.LINEAR_MIPMAP_LINEAR,
            magFilter: gl.LINEAR,
          });
          program.uniforms.uPhoto.value = tex;
          program.uniforms.uHasPhoto.value = 1;
          program.uniforms.uPhotoAspect.value =
            img.naturalWidth / img.naturalHeight;
        };
        img.src = url;
      };
      loadPhoto(photoUrl);

      let raf = 0;
      const start = performance.now();
      const loop = () => {
        raf = requestAnimationFrame(loop);
        const { offset: off, scrollWidth: sw } = stateRef.current;
        program.uniforms.uOffset.value = off;
        program.uniforms.uScrollW.value = Math.max(1, sw);
        if (!reduceMotion) {
          program.uniforms.uTime.value = (performance.now() - start) * 0.001;
        }
        renderer.render({ scene: mesh });
      };
      loop();

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        canvas.remove();
        gl.getExtension("WEBGL_lose_context")?.loseContext();
      };
    };

    boot();

    return () => {
      cancelled = true;
      cleanup?.();
    };
    // photoUrl 变化时重建着色器上下文代价大,但换城本来就是整段重挂,
    // 这里简单起见随 effect 重跑即可
  }, [photoUrl]);

  return (
    <div
      ref={hostRef}
      aria-hidden
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: "var(--paper)",
      }}
    />
  );
}
