# M7 交接文档 — 首页链路整轮迭代(抽象地球/卡下CTA/杂志地图定稿/右侧抽屉/影像区块)

状态:**完成,typecheck + build + CDP 全流程截图验证通过**。承接 `M6-handoff.md`。

## 起因(用户 M7 反馈,逐条)
1. 底部地球**不当真实世界地图**,只是「地图锚点」:点阵可以抽象,两城锚点拉远;点广安转到广安,再点百色要**继续转**(不回头)。
2. 地点标注出现 **3 个红点堆叠**(丑):cobe 两枚地理临近 marker + HTML 引线端点。
3. 「启程」按钮移到**询问卡正下方、文字居中**,效果全保留。
4. 路线地图**定稿杂志风**,但「太空了」要做饱满;(水墨版出局)。
5. 详情框改为**右侧滑入、占 2/3 宽的抽屉**,其余 1/3 黑色羽化;内容加多,放**公众号跳转卡**(真实运营),其余先占位。
6. 新增:**完全照抄** ai-app 模板「Watch the film」滚动生长影像区块,分别加在广安/百色路线图下方(成片后期替换)。
7. 设计语言:红色之外,还要有**贯通中外**的意味。

## 交付的文件
```
src/components/intro/destination-globe.tsx   重写:弃用 cobe,canvas 2D 自绘抽象点阵球。
                                             斐波那契球面点 + 正弦「群岛」掩码 + 经纬网点(全确定性);
                                             两城虚拟锚点同纬度 18°、经度差约 130°(拉远);两锚点间
                                             slerp 红色航迹弧(贯通意象);focus 追踪 forward-only
                                             (换城市继续同向转,不回头);选中锚点不在画布上画点,
                                             HTML 标注引线端点是唯一红点(修 3 点堆叠)。
src/components/intro/intro-experience.tsx    改:CTA(就绪灯+启程 XX篇+副文案+箭头)从地球标注旁
                                             移到白卡正下方居中,AnimatePresence 进出场;标注只留
                                             缩略图+双语名+引线。
src/components/journey/route-map-editorial.tsx 充实(定稿版):中文水印大字 + 英文描边水印(中西并置)
                                             + 网格字母/数字坐标 + 顶底刻度线 + 站间真实公里数里程标
                                             (haversine + 菱形标)+ 刊头加 GPS 坐标和城市引言(垫径向
                                             白纱防路径穿字)+ 右缘竖排箴言「跨越山河·贯通中外」
                                             + 右下图例卡 + ATLAS 出版信息行 + 路径尾「未完待续」。
src/components/journey/film-showcase.tsx     新:「观看实践影像」。机制 1:1 对齐 ai-app video-showcase:
                                             [margin-top:-100svh] h-[180svh] + sticky 钉屏;peek 400×260
                                             从上一屏底部露 50px,滚动 [0,0.55] 长到全屏;0.35 起播,
                                             IntersectionObserver+scrollYProgress 双重同步;继续下滑
                                             提示丸;reduced-motion 走静态原生控件播放器。
                                             占位视频 = 模板同款 Pexels 素材,成片后改 VIDEO_SRC/POSTER。
src/components/spot-panel.tsx                重写视图:居中黑窗 → 右侧 2/3 抽屉(spring x:104%→0,
                                             md 下全宽),左 1/3 黑色羽化遮罩(左浅右深渐变+blur,点击关);
                                             抽屉左缘再叠 40px 羽化过渡。新增:双语副题、寻访信息条
                                             (站序/GPS/所在地)、分节小节眉、公众号跳转卡(二维码占位
                                             + WECHAT_URL 常量待填)、实践手记/影像花絮虚线占位块。
                                             PrintFan/RevealHeadline/上一站下一站条保留。
src/components/journey-shell.tsx             改:journey 阶段从 fixed inset-0 改为普通文档流
                                             (h-svh 地图区 + FilmShowcase),页面可滚动;删 A/B 切换;
                                             换城市/阶段时 scrollTo(0,0)。
src/i18n/ui.ts                               删 mapStyleInk/Editorial;增 mapMotto/mapToBeContinued/
                                             mapLegend*/filmCaption/filmScrollDown/drawer* 系列。
.review/cdp-m7-flow.js                       新:M7 全流程 CDP 截图脚本(m7-*.png)。
```

## 删除
`journey/route-map-ink.tsx`(用户定稿杂志风);journey-shell 右下角 A/B 切换开关;cobe 依赖不再被引用(包仍在 package.json,后续可卸)。

## 已验证(headless Chrome CDP,`.review/m7-*.png`)
1. `m7-intro.png` 开场:抽象点阵球(群岛纹样+经纬网点+两枚空心红圈锚点+红色航迹弧)。
2. `m7-focus-guangan.png` 点广安:球转至广安锚点,单一地点标注(**只有一个红点**),CTA 在卡下方居中。
3. `m7-rotate-mid.png`/`m7-focus-baise.png` 点百色:球**继续**转(中途帧可见广安标注还在左移),到位后百色标注+「启程 百色篇」。
4. `m7-map-editorial.png` 杂志地图定稿版:里程标/双语水印/竖排箴言/图例/坐标网格/未完待续,明显更饱满;影像 peek 在页底露出。
5. `m7-film-mid.png`/`m7-film-full.png` 滚动:影像窗从 peek 长到全屏(与 ai-app 行为一致)。
6. `m7-bubble.png` 概览气泡;`m7-drawer-top.png` 右侧 2/3 抽屉+左侧羽化;`m7-drawer-bottom.png` 公众号卡+占位块。
7. `tsc --noEmit` + `npm run build` 静态导出通过。

## 技术要点 / 坑
- **抽象球 forward-only 旋转**:`d = ((target - phi) % 2π + 2π) % 2π` 只取正向差,`phi += min(d, d*0.055+0.0015)`,到位阈值 0.0006 —— 换目标永远顺时针继续转,满足「点百色他会继续旋转」。
- **锚点必须同纬度**:半球只露上半,若两城纬度不同,转到正面时标注高度不同,低了会被视口裁掉。现统一 lat 50°(M7b 调整,见下)。
- **3 红点 bug 根因**:cobe 两枚 marker(广安/百色地理上很近,投影后紧挨)+ HTML 引线端点 = 3 点。抽象球方案里选中锚点不画,未选中画空心圈(视觉上区分「可去」与「已选」)。
- **FilmShowcase 的 -100svh 负 margin**:要求上一屏(地图)正好 h-svh 且区块紧随其后;journey 阶段因此从 fixed 改文档流。sticky 生长期间地图被盖住是预期(与 ai-app hero 相同)。
- **刊头白纱**:radial-gradient 椭圆垫底,防止路径首段穿过引言文字;注意别做太大,会盖住 01 号节点(已调小到 70% 衰减)。
- **公众号跳转**:`spot-panel.tsx` 顶部 `WECHAT_URL`(现为 "#")和 `WECHAT_NAME` 常量,拿到文章链接后替换;二维码占位是 QrCode 图标,有图后换 `<img>`。

## M7b 补丁(用户看完 M7 后的五条反馈,已修并 CDP 验证 `.review/m7b-*.png`)
1. **红色地标太靠下** → 锚点纬度提到 50°,并加 `FOCUS_OFFSET = -1.0`:聚焦时锚点定格在球面**中部偏左**(正下方是居中 CTA 的领地);标注改为水平展开(名片←引线←红点),不再叠在 CTA/询问卡上。
2. **选中后地球不明显** → 点阵换深墨色 `rgba(74,58,52)` 且透明度上调(0.22+0.62·rz),球缘圈、航迹弧同步加深;白色光晕稍收敛,风景照上点阵清晰可读。
3. **CTA 刚切换时位置偏移再回正** → 根因:CTA `motion.div` 用 `key={focusCity.id}`,切城市触发重挂载,AnimatePresence 里新旧两个按钮短暂并存于同一 flex 行,把新按钮挤偏。改为常驻 `key="cta"` 只换文字,不再重挂载。
4. **静止时背景线条动来动去** → 根因:ogl Texture 默认 `NEAREST_MIPMAP_LINEAR`,配合 Ken Burns 缓慢缩放,照片里的细线条(砖缝/栏杆)持续闪烁蠕动。改 `LINEAR_MIPMAP_LINEAR + anisotropy 8`(三线性+各向异性),并把 Ken Burns 幅度调小(zoom 0.07→0.05,drift 0.010→0.006)。画面仍有慢推拉(需求要求的动效),但线条不再抖。
5. **抽屉黑色太丑** → 底色从纯黑 #0a0a0a 提亮为暖深灰 #161413,左缘弃硬圆角+阴影,改为 30% 宽的横向渐变羽化(透明→0.82→0.97→实色),遮罩也减淡(0.25→0.75 渐变),整体"淡边缘、略亮"。

## M7c 补丁:开场漂浮照片场(用户反馈"首页刚进来太空了")
- 新增 `src/components/intro/photo-field.tsx`:**照抄 ai-app 模板 hero 的照片环**(用户点名),
  three.js + @react-three/fiber(新依赖,用户明确放开"可以用 three.js 等一切组件"):
  四圈同心环缓慢旋转、瓦片随切线转但照片世界空间采样保持正立、SDF 圆角+描边、
  中心径向淡出(询问卡留白)+ 底部渐隐(地球让位)、滚动速度助推涟漪。
  常数(RINGS/TILE_*/FADE 曲线)与模板逐一相同。
- 与模板的差异:图片换成本地实拍素材(`FIELD_IMAGES` 数组,后续直接替换);
  加 `hidden` prop —— 选定目的地后整场外扩(scale 1.06)+ 着色器全局 alpha 淡出,
  与水墨过渡浮现风景大图正好衔接;回到未选状态自动淡回。
- 层级:InkBackdrop z-0 < PhotoField z-[5] < 地球 z-10 < 询问卡 z-20。
- CDP 验证 `.review/m7c-*.png`:开场满屏漂浮、选城后无残留。

## M7d 补丁:首屏加载卡顿(用户反馈"从空卡片到照片场会卡一下")
根因:PhotoField 把 three.js(约 1MB)打进首屏同步包阻塞水合;且 11 张原图(最大 2560px)
解码后整幅上传 GPU,全堵在主线程。三处修复:
1. `intro-experience.tsx`:PhotoField 改 `next/dynamic` + `ssr:false` **异步分包** ——
   卡片/地球先渲染,three 包就绪后照片场自己淡入(initial opacity 0,1.1s 缓入)。
2. `photo-field.tsx`:图片 `decode()` 异步解码后**降采样到 ≤640px canvas** 再当纹理
   (显示上限 236px,精度足够),上传体积降一个数量级。
3. useFrame 里纹理上传**限流每帧 1 张**,11 张分摊到 11 帧,不再同帧堆积。
验证 `.review/m7d-t*.png`(冷缓存逐帧):0.8s 卡片入场动画中,1.6s 全部就位,无跳变。

## M7e 补丁:首屏整体性能(用户反馈"刚打开还是有些卡")
四处削减首屏主线程/GPU 压力,动效不受影响:
1. **水墨背景着色器**:空闲时(无过渡、宣纸底、鼠标静止)整屏 fbm(≈15 次噪声/像素)白烧 GPU
   → fragment 加 `if (uProgress > 0.0005)` 分支,只在过渡期算水墨场;rAF 循环加空闲跳帧
   (静态宣纸底不重绘),首屏 GPU 让给入场动画。选城后照片 Ken Burns 恢复每帧渲染。
2. **地球画布**:DPR 上限 2→1.5;translate-y-52% 意味着下半永远在视口外
   → 每 15 帧刷新一次视口裁剪线 `cutoffY`,点阵循环里越界直接 continue(点数减半)。
3. **照片场预载**:11 张并行 decode 抢满线程池 → 改串行逐张,每张之间 `requestAnimationFrame`
   让出一帧。
4. **three 分包延后**:dynamic import 仍会在水合后立刻抢带宽/解析
   → `fieldReady` 状态:1.5s(入场动画结束)后 `requestIdleCallback` 空闲时才挂载 PhotoField。
验证 `.review/m7e-*.png` + longtask 采样:首 4.5s 长任务 [67,73,223,50,50]ms(223 为 three
分包解析,已挪到入场动画之后的空闲期);1.0s 帧卡片已在入场,4.5s 照片场淡入完成;
选城过渡衔接不受影响。

## 待办(M8 候选)
1. 公众号真实链接 + 二维码图;实践手记/影像花絮占位块回填真实素材。
2. 成片替换 film-showcase 的 VIDEO_SRC/POSTER(建议转存 `public/film/` 本地文件,现为 Pexels 外链占位)。
3. 移动端适配(询问卡/CTA/地图节点密度/抽屉全宽已粗兜,未细调)。
4. 华蓥山/纪念碑园实拍图;nav 锚点仍指向不存在 section;CC BY-SA 署名(footer)。
5. package.json 里 cobe 已无引用,可 `npm rm cobe`。

## 给接手者
- CDP 验证:`.review/cdp-m7-flow.js`(全流程),先起
  `chrome --headless=new --remote-debugging-port=9333 --window-size=1600,900 --user-data-dir=<临时目录>`。
- 别动 `.backup-m4c-map/`、别覆盖 `public/geo/china-100000.json`。
- 加景点仍只改 `spots.ts`;地图/气泡/抽屉全自动。
