# M6 交接文档 — 按需求文档重做首页游戏化沉浸链路(询问卡/水墨背景/半球地球/双版路线地图/黑窗)

状态:**核心完成,typecheck + build + CDP 全流程截图验证通过**。承接 `M5-handoff.md`。

## 起因
用户对 M5 版完全不满意,给了正式需求文档(`../需求文档_首页游戏化沉浸体验.docx`,参考图已抽到 `../.docx-media/`)。核心要求:
1. **背景跟随选择变化**:选广安背景就是广安风景大图,切百色同理;切换用 CrossMind 的**水墨交融**效果;背景图本身要有动效。
2. **询问卡完全照抄 saas 模板卡**的白卡悬浮感(参考图①②)。
3. **页面下方地球**(8-bit 模板 cobe),选城市→地球转向引出地点标注(参考图⑤⑥,标注改成地点形式)。
4. 地点旁**游戏式 CTA**(3A 游戏引导感)。
5. 点击后全屏**叙事路线地图**(非工具地图);用户点名「不要潦草的 SVG」,要求 **水墨国风 / 高端文旅杂志风两版都做出来让他选**。
6. 详情大窗**完全照抄 ai-app 模板黑卡**内容形式(参考图⑦:扇形照片+居中大字+胶囊按钮)。
7. 反 AI 感:禁 hover-lift 之类的 AI 味套路,往大厂方向做。
8. 用户确认:进来**先不选**(中性背景);素材由我找 CC 授权高清图。

## 交付的文件
```
src/components/intro/ink-backdrop.tsx        新:全屏 WebGL 背景(ogl)。宣纸纹理→选城市后 fbm domain-warp
                                             水墨交融过渡到风景大图;Ken Burns 慢推拉+漂移+鼠标视差;
                                             顶部白纱保导航可读。技术源自 CrossMind FluidWorld / M4 map-backdrop。
src/components/intro/intro-experience.tsx    重写:居中悬浮白卡(saas 卡质感:2rem 圆角+大阴影+彻底的白)
                                             + 两枚图卡目的地选择 + 底部升起半球地球(translate-y 52%)
                                             + 白色光晕垫底 + 地点标注(缩略图+双语名+引线)
                                             + 游戏式「启程 广安篇」CTA(章节命名+就绪指示灯+副文案)。
src/components/journey/route-map-ink.tsx     新:路线地图方向A「水墨国风」。分层渐变水墨山(feGaussianBlur
                                             远虚近实)+云雾+朱砂旭日+亭台/飞鸟/松树/罗盘点景+飘动红旗
                                             +汉字序号印章节点(一/二/三)+朱笔路径生长+GSAP 进场编排。
src/components/journey/route-map-editorial.tsx 新:方向B「高端文旅杂志风」。纯白+基线网格+四角规线
                                             +巨型章节水印字+CHAPTER 03 站+细红线/流动虚线双层路径
                                             +照片 chip 节点卡(编号+缩略图+双语名,峰上/谷下交替)。
src/components/journey/overview-bubble.tsx   新:概览气泡抽成共享组件(两版地图共用)。
src/components/spot-panel.tsx                重写视图:完全对齐 ai-app 黑卡形式 —— #0a0a0a + 40px 圆角
                                             + PrintFan 扇形照片组(spring 展开+hover 抬起)
                                             + 标题逐词/逐字升起(RevealHeadline)+居中窄栏正文
                                             + 白胶囊「下一站」+描边胶囊「返回地图」+底部上/下一站条。
src/components/journey-shell.tsx             改:接入双版地图 + 右下角「水墨/杂志」A/B 切换(选型期临时)。
src/lib/route-geometry.ts                    新:两版地图共用几何(像素空间布局/Catmull-Rom/全宽延伸路径/
                                             手调 Y 峰谷节奏/山脊程序生成)。路径左右伸出视口(需求:最左到最右)。
src/lib/use-size.ts                          新:ResizeObserver 实测尺寸 hook(SVG 与 HTML 层永远对齐)。
src/lib/images.ts                            新:bgStack() CSS 多重背景兜底(景点无实拍图时自动垫城市图)。
src/components/nav.tsx                       改:全站白底后导航固定深墨字(原顶部反白在白背景上看不见)。
```

## 删除
`journey/route-map.tsx`、`journey/map-decorations.tsx`(M5 的潦草 SVG 版,用户明确否定)。

## 数据/素材变化
- `types.ts` City 加 `sceneryImage?`(全屏风景背景,缺省回退 heroImage)。
- **新增图片(Wikimedia Commons,CC BY-SA,作者 N509FZ,来源注释在 cities.ts 头部)**:
  - `public/cities/guangan/scenery.webp`(邓小平故居正面全景 2560px)
  - `public/cities/baise/scenery.webp`(百色起义纪念馆 2560px)
  - `public/spots/deng-xiaoping-former-residence/01.webp,02.webp`
  - `public/spots/deng-xiaoping-memorial-hall/01.webp,02.webp`
  - `public/spots/baise-uprising-memorial/01.webp`
  - `public/spots/guangdong-guild-hall/01.webp`
- 华蓥山游击队遗址、百色起义纪念碑园 Commons 无图(下载被 429 限流的两张备选质量也不符),`images: []`,
  UI 全部走 bgStack 兜底城市图。实拍后放 `public/spots/<id>/` 并回填 `spots.ts`。
- `ui.ts` 新增:`ctaReady/ctaStart/mapStyleInk/mapStyleEditorial`。

## 已验证(headless Chrome CDP,`.review/m6-*.png`)
1. 开场:白底+悬浮询问卡+半球点阵地球(卡 z-20 盖住地球,已修初版重叠 bug)。
2. 点广安 → 水墨交融过渡到故居全景大图(`m6-focus-mid.png` 可见融合边界),地球转向+地点标注+「启程 广安篇」CTA。
3. 广安→百色切换:第二次水墨过渡正常(`m6-switch-mid.png`)。
4. 启程 → 水墨版路线地图:渐变水墨山/朱砂日/印章节点/朱笔路径,完全不潦草(`m6-map-ink.png`)。
5. 右下角切「杂志」→ 编辑风地图(`m6-map-editorial.png`)。
6. 点节点 → 概览气泡(实拍缩略图+标签+查看详情)→ 黑色详情窗(扇形照片+大字标题+胶囊按钮,`m6-detail.png`)。
7. `tsc --noEmit` + `npm run build` 静态导出通过。

## 技术要点 / 坑
- **InkBackdrop 换图状态机**:B 纹理载入→uProgress 0→1(fbm 扰动对角扫描,扫描域 [-0.5,1.5] 保证全覆盖)→把 B 升级为 A→progress 归 0。A/B 的 Ken Burns 用同相位,升级瞬间无跳变。连续快速切换用 loadToken 防竞态。
- **路线地图布局在像素空间**(useSize 实测宽高),不再用 viewBox slice —— M5 的坑:slice 裁切后 SVG 坐标和 HTML 气泡百分比坐标对不上。路径首尾向视口外延伸 90px,方向顺着首尾段斜率,实现「最左到最右」。
- **印章节点用汉字序号**(一/二/三)+微旋转,比阿拉伯数字更有印章感。
- **杂志版流动虚线**:`strokeDasharray:"14 32"` + GSAP 循环 `strokeDashoffset -46`,注意不能和 pathLength=1 的生长动画放同一条 path(dasharray 会互相打架),所以拆成两层。
- 下载 Wikimedia 原图直链偶发 429,换 `Special:FilePath/<文件名>` 一般能过;还不行就隔几秒重试。
- sharp 在项目 node_modules 里可用,转 webp 就用它(见本次命令历史)。

## 待办(M7 候选)
1. **用户二选一**:水墨 vs 杂志。定了以后删掉未选版本 + journey-shell 右下角切换开关。
2. 移动端适配(询问卡/CTA 在窄屏的布局、地图节点密度、黑窗全屏)。
3. 华蓥山/纪念碑园实拍图。
4. nav 锚点仍指向不存在的 section。
5. 若用户觉得水墨过渡太快/太慢:`ink-backdrop.tsx` 里 `dt / 1400` 的 1400(ms)。
6. 图片授权署名:CC BY-SA 要求署名,建议 footer 或关于页加一行(来源注释已写在 cities.ts)。

## 给接手者
- CDP 验证脚本:`.review/cdp-m6-flow.js`(全流程)/`cdp-m6-baise.js`(百色+城市切换)。先起
  `chrome --headless=new --remote-debugging-port=9333 --window-size=1600,900 --user-data-dir=<临时目录>`。
- 别动 `.backup-m4c-map/`。
- 加景点:改 `spots.ts` 即可,两版地图/气泡/黑窗全自动;>6 个景点时 route-geometry 的 Y_PATTERNS 自动回退交替模式。
