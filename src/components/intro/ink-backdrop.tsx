"use client";

import { Mesh, Program, Renderer, Texture, Triangle } from "ogl";
import { useEffect, useRef, type ReactNode } from "react";

// ============================================================
// InkBackdrop — 首页全屏风景背景(WebGL, ogl)
// 1. 初始:玄墨暖黑(程序生成的渐变 + 颗粒,不是图片)
// 2. 选目的地:fbm domain-warp 噪声驱动的「水墨交融」过渡到该城风景大图
//    (移植 CrossMind FluidWorld 的双世界液体混合手法)
// 3. 背景图自带动效:Ken Burns 慢推拉 + 缓慢漂移 + 鼠标视差
// M8 起改玄墨调:顶底压暗 + 暗角,照片像展厅打光而不是旅游宣传照。
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
uniform sampler2D texA;
uniform sampler2D texB;
uniform float uProgress;   // 0=texA, 1=texB(水墨侵入)
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uMouse;       // -1..1
uniform float uAspectA;    // texA 宽高比
uniform float uAspectB;
uniform float uKenA;       // 是否对 A 做 Ken Burns(纸张底不做)
uniform float uKenB;
uniform float uPhotoStage; // 0=宣纸开场浅罩, 1=实景展厅压暗

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
float noise(vec2 p){
  vec2 i=floor(p), f=fract(p);
  float a=hash(i), b=hash(i+vec2(1.,0.)), c=hash(i+vec2(0.,1.)), d=hash(i+vec2(1.,1.));
  vec2 u=f*f*(3.-2.*f);
  return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
}
float fbm(vec2 p){ float v=0.,a=.5; for(int i=0;i<5;i++){v+=a*noise(p);p*=2.;a*=.5;} return v; }

// cover 采样:保持图片比例填满视口
vec2 coverUv(vec2 uv, float texAspect){
  float viewAspect = uRes.x/uRes.y;
  vec2 s = viewAspect > texAspect ? vec2(1., texAspect/viewAspect) : vec2(viewAspect/texAspect, 1.);
  return (uv - .5)*s + .5;
}

// Ken Burns:缓慢放大 + 漂移(A/B 同相位,升级换层时无跳变)
vec2 kenBurns(vec2 uv, float t, float on){
  float zoom = 1.0 + on * (0.05 + 0.012 * sin(t * 0.05));
  vec2 drift = on * vec2(sin(t * 0.041), cos(t * 0.033)) * 0.006;
  return (uv - .5) / zoom + .5 + drift;
}

void main(){
  vec2 uv = vUv;
  // 鼠标视差:整体 UV 轻微反向偏移(景深感)
  vec2 par = uMouse * 0.012;

  float t = uTime;

  vec2 uvA = coverUv(kenBurns(uv + par, t, uKenA), uAspectA);
  vec3 colA = texture2D(texA, uvA).rgb;
  vec3 col = colA;

  // 只在过渡期计算水墨场:空闲时整屏 fbm(约15次噪声/像素)白烧 GPU,
  // 集显上会拖垮首屏入场动画
  if (uProgress > 0.0005) {
    vec2 uvB = coverUv(kenBurns(uv + par, t, uKenB), uAspectB);
    vec3 colB = texture2D(texB, uvB).rgb;

    // 水墨融合边界:fbm 扰动的对角扫描(progress 增大时 B 从左上晕染侵入)
    float tt = t * 0.06;
    vec2 q = uv * 2.2;
    vec2 warp = vec2(fbm(q + tt), fbm(q + 5.2 - tt));
    float n = fbm(q * 1.4 + warp * 1.6);
    float field = (uv.x + uv.y) * 0.5 + (n - 0.5) * 0.55;
    // 扫描起终点超出 field 的实际范围,保证两端完全覆盖、无残留
    float p = uProgress * 2.0 - 0.5;
    float edge = smoothstep(p - 0.18, p + 0.18, field);
    float m = 1.0 - edge; // m=1 处显示 B

    col = mix(colA, colB, m);

    // 融合带:墨色加深 + 内缘轻微提亮,像湿墨晕开的边界
    float band = 1.0 - abs(m - 0.5) * 2.0;
    float bandActive = step(0.001, uProgress) * step(uProgress, 0.999);
    col *= 1.0 - band * band * 0.22 * bandActive;
    col += band * band * band * 0.06 * bandActive;
  }

  // 双态罩层:宣纸开场用浅罩;实景推入后换展厅压暗。
  // 冲击感靠整体压曝光 + 顶底暗角,不在画面中间盖宣纸纱。
  vec3 paperVeil = vec3(0.952, 0.925, 0.878);
  vec3 darkVeil = vec3(0.04, 0.03, 0.022);
  vec3 veil = mix(paperVeil, darkVeil, uPhotoStage);
  float edgeAmt = mix(0.42, 0.78, uPhotoStage);
  float topAmt = mix(0.28, 0.62, uPhotoStage);
  col = mix(col, veil, smoothstep(mix(0.72, 0.52, uPhotoStage), 1.0, uv.y) * edgeAmt);
  col = mix(col, veil, smoothstep(mix(0.28, 0.42, uPhotoStage), 0.0, uv.y) * topAmt);
  vec2 c = uv - vec2(0.5, 0.5);
  float vig = smoothstep(mix(1.08, 0.98, uPhotoStage), mix(0.28, 0.38, uPhotoStage), length(c));
  // 实景中心也略压一档,像展厅投光,白墙不至于冲掉反白字
  float midMul = mix(0.9, 0.78, uPhotoStage);
  float edgeMul = mix(0.9, 0.38, uPhotoStage);
  col *= mix(edgeMul, midMul, vig);

  gl_FragColor = vec4(col, 1.0);
}
`;

const DPR_CAP = 1.5;

/** 程序生成宣纸底(暖白渐变 + 细颗粒),作为初始 texA。
    国博门面开场用浅底;选城后仍由水墨场推入城市风景。 */
function makeGroundCanvas(): HTMLCanvasElement {
  const cv = document.createElement("canvas");
  cv.width = 512;
  cv.height = 512;
  const ctx = cv.getContext("2d")!;
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, "#faf6ef");
  grad.addColorStop(0.45, "#f3ece0");
  grad.addColorStop(1, "#ebe2d2");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);
  const img = ctx.getImageData(0, 0, 512, 512);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const g = (Math.random() - 0.5) * 7;
    d[i] += g;
    d[i + 1] += g * 0.95;
    d[i + 2] += g * 0.85;
  }
  ctx.putImageData(img, 0, 0);
  return cv;
}

interface InkBackdropProps {
  /** 当前背景图 URL;null = 宣纸底 */
  imageUrl: string | null;
  className?: string;
}

export function InkBackdrop({ imageUrl, className }: InkBackdropProps): ReactNode {
  const hostRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<{ setImage: (url: string | null) => void } | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new Renderer({
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "high-performance",
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

    const ground = makeGroundCanvas();
    // 三线性过滤 + 各向异性:ogl 默认 NEAREST_MIPMAP_LINEAR,配合 Ken Burns
    // 缓慢缩放会让照片里的细线条(砖缝/栏杆)持续闪烁蠕动("线条动来动去")
    const texOpts = {
      generateMipmaps: true,
      minFilter: gl.LINEAR_MIPMAP_LINEAR,
      magFilter: gl.LINEAR,
      anisotropy: 8,
    };
    const texA = new Texture(gl, { image: ground, width: 512, height: 512, ...texOpts });
    const texB = new Texture(gl, { image: ground, width: 512, height: 512, ...texOpts });

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        texA: { value: texA },
        texB: { value: texB },
        uProgress: { value: 0 },
        uTime: { value: 0 },
        uRes: { value: [1, 1] },
        uMouse: { value: [0, 0] },
        uAspectA: { value: 1 },
        uAspectB: { value: 1 },
        uKenA: { value: 0 },
        uKenB: { value: 0 },
        uPhotoStage: { value: 0 },
      },
    });
    const mesh = new Mesh(gl, { geometry, program });

    renderer.dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);

    let lastW = 0,
      lastH = 0,
      resizePending = 0;
    const resize = () => {
      const rect = host.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width));
      const h = Math.max(1, Math.round(rect.height));
      if (w === lastW && h === lastH) return;
      lastW = w;
      lastH = h;
      renderer.setSize(w, h);
      program.uniforms.uRes.value = [w, h];
      renderer.render({ scene: mesh });
    };
    const queueResize = () => {
      if (resizePending) return;
      resizePending = requestAnimationFrame(() => {
        resizePending = 0;
        resize();
      });
    };
    resize();
    const ro = new ResizeObserver(queueResize);
    ro.observe(host);

    // 鼠标视差
    const targetMouse: [number, number] = [0, 0];
    const curMouse: [number, number] = [0, 0];
    const onMove = (e: PointerEvent) => {
      targetMouse[0] = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouse[1] = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    // 换图状态机:载入 B → progress 0→1 水墨侵入 → B 升级为 A
    let loadToken = 0;
    let progressAnimating = false;
    let pendingSwap: {
      url: string | null;
      /** 照片→照片:压暗保持,避免切换时闪回宣纸浅罩 */
      keepStage: boolean;
      duration: number;
    } | null = null;
    /** 当前已落定(或正在落入)的画面 URL */
    let settledUrl: string | null = null;
    let texBSource: HTMLImageElement | HTMLCanvasElement | null = null;

    const applyTexture = (
      tex: Texture,
      img: HTMLImageElement | HTMLCanvasElement,
      slot: "A" | "B"
    ) => {
      tex.image = img;
      tex.needsUpdate = true;
      const aspect =
        img instanceof HTMLImageElement ? img.naturalWidth / img.naturalHeight : 1;
      const isPhoto = img instanceof HTMLImageElement ? 1 : 0;
      if (slot === "A") {
        program.uniforms.uAspectA.value = aspect;
        program.uniforms.uKenA.value = reduceMotion ? 0 : isPhoto;
      } else {
        program.uniforms.uAspectB.value = aspect;
        program.uniforms.uKenB.value = reduceMotion ? 0 : isPhoto;
        texBSource = img;
      }
    };

    const promoteToA = (img: HTMLImageElement | HTMLCanvasElement) => {
      applyTexture(texA, img, "A");
      program.uniforms.uProgress.value = 0;
    };

    const setImage = (url: string | null) => {
      const token = ++loadToken;
      const fromPhoto = settledUrl !== null;
      const toPhoto = url !== null;
      const keepStage = fromPhoto && toPhoto;
      const duration = reduceMotion ? 280 : keepStage ? 1100 : 1400;

      const begin = (img: HTMLImageElement | HTMLCanvasElement) => {
        if (token !== loadToken) return;
        // 打断进行中的过渡:先把当前 B 促升为 A,再启新一轮,避免闪回旧底
        if (progressAnimating && texBSource) {
          promoteToA(texBSource);
          if (pendingSwap) settledUrl = pendingSwap.url;
          progressAnimating = false;
          pendingSwap = null;
        }
        applyTexture(texB, img, "B");
        program.uniforms.uProgress.value = 0;
        if (keepStage) program.uniforms.uPhotoStage.value = 1;
        progressAnimating = true;
        pendingSwap = { url, keepStage, duration };
      };
      if (url === null) {
        begin(ground);
        return;
      }
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => begin(img);
      img.src = url;
    };
    apiRef.current = { setImage };

    let raf = 0;
    const start = performance.now();
    const FRAME_MS = 1000 / 60;
    let last = start;

    const loop = () => {
      raf = requestAnimationFrame(loop);
      const now = performance.now();
      const dt = now - last;
      if (dt < FRAME_MS - 1) return;
      last = now - (dt % FRAME_MS);

      const k = 1 - Math.pow(1 - 0.1, dt / FRAME_MS);
      const mouseDelta =
        Math.abs(targetMouse[0] - curMouse[0]) +
        Math.abs(targetMouse[1] - curMouse[1]);
      curMouse[0] += (targetMouse[0] - curMouse[0]) * k;
      curMouse[1] += (targetMouse[1] - curMouse[1]) * k;

      if (progressAnimating && pendingSwap) {
        const p = program.uniforms.uProgress.value as number;
        const np = Math.min(1, p + dt / pendingSwap.duration);
        program.uniforms.uProgress.value = np;
        // 罩层:宣纸↔实景跟进度;照片↔照片保持展厅压暗,不闪浅罩
        if (pendingSwap.keepStage) {
          program.uniforms.uPhotoStage.value = 1;
        } else if (pendingSwap.url) {
          program.uniforms.uPhotoStage.value = np;
        } else {
          program.uniforms.uPhotoStage.value = 1 - np;
        }
        if (np >= 1) {
          const done = pendingSwap;
          pendingSwap = null;
          progressAnimating = false;
          settledUrl = done.url;
          program.uniforms.uPhotoStage.value = done.url ? 1 : 0;
          // 同步促升:B 纹理已在手,不必再异步解码一次(避免完成瞬间闪帧)
          if (texBSource) promoteToA(texBSource);
        }
      }

      // 空闲跳帧:静态宣纸底(无过渡、无 Ken Burns、鼠标基本静止)
      // 不必每帧重绘 —— 首屏 GPU 让给照片场/地球的入场动画
      const idle =
        !progressAnimating &&
        (program.uniforms.uKenA.value as number) === 0 &&
        mouseDelta < 0.0015;
      if (idle) return;

      program.uniforms.uTime.value = (now - start) * 0.001;
      program.uniforms.uMouse.value = [curMouse[0], curMouse[1]];
      renderer.render({ scene: mesh });
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(resizePending);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      canvas.remove();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      apiRef.current = null;
    };
  }, []);

  // imageUrl 变化 → 触发水墨过渡(含首次从纸张到图片)
  const prevUrl = useRef<string | null>(null);
  useEffect(() => {
    if (prevUrl.current === imageUrl) return;
    prevUrl.current = imageUrl;
    apiRef.current?.setImage(imageUrl);
  }, [imageUrl]);

  return (
    <div
      ref={hostRef}
      aria-hidden
      className={className}
      style={{ position: "absolute", inset: 0, overflow: "hidden" }}
    />
  );
}
