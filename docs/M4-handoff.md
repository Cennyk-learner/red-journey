# M4 交接文档 — 视觉改版(白+红)+ 世界地图 + 沉浸式详情面板

状态:**核心已完成并浏览器验证**。承接 `M3-handoff.md`。这是一次大改版,起因是用户看了 M2/M3 的深色方案后要求:①整站改白+红亮色(之前误把"学动效"做成了"学深色配色");②地图改成清晰的完整中国地图(川桂高亮),不要之前那种糊成一团的暗色聚光图;③详情做成点景点从右侧滑出的沉浸式面板,不是独立页面。

## 这一阶段做了什么(4 个子任务)

### M4a 配色系统改亮色
`src/app/globals.css` 设计 token 从「绛红夜·鎏金」深色改为「中国红·白」亮色:
- `--bg #fefcfa`(暖白)、`--surface #fff`、`--crimson #d21f2e`(明亮中国红)、`--ink #241412`(深墨文字)
- 新增 `--ink-invert`(反白,用于深色大图/暗背景上的文字)、`.glass-card-dark`(深色语境玻璃卡)
- `.glass-card` 改为白色系柔光卡片;`color-scheme: light`
- **注意**:改 token 后凡是用 `text-ink`/`bg-bg` 的组件语义自动反转(以前 ink 是浅色,现在是深墨),已全部适配。

### M4b Hero 双版本(等用户选型)
两个 Hero + `/hero-lab` 对比页(顶部 tab 切换):
- **版本A `hero-fluid.tsx`**:明亮流体着色器 —— 白/米白宣纸底上晕开中国红/朱砂/鎏金红墨光云(`fluid-shader.tsx` 的片元着色器已改成亮色配方),叠加逐行文字 reveal + 鼠标暖光。
- **版本B `hero-landmark.tsx`**:风景大图 —— 广安邓小平故里陈列馆实景打底(暗角+暗化)+ 鼠标视差 + 反白文字 reveal。
- 共享内容层 `hero-content.tsx`(`HeroContent` + `ScrollHint`,`tone` 参数决定深墨/反白文字)。
- **首页当前默认用版本A**(`src/app/page.tsx` 引 `HeroFluid`)。用户选定后:删掉未选版本 + `/hero-lab` + `hero-content` 的多余 tone 分支。

### M4c 世界地图(最费劲,踩了大坑)
全国视角 = 清晰亮色中国地图;城市视角 = 当地实景背景 + 景点足迹。
- `world-map.tsx`:世界底图(`world-110m.json` TopoJSON,周边国家浅米弱化)+ 中国省级行政区(暖白陆地、金棕省界、**省名标注**用数据自带的 `properties.center`)+ **四川/广西整块红色高亮**(填充+深红描边+呼吸+可点击)。海洋浅蓝。geoMercator 中国居中,`scale = width*0.62`,`center [104,38]`。
- `city-map.tsx`:城市区县半透明轮廓(让实景透出)+ 景点序号点 + 鎏金足迹连线(GSAP 生长)+ 景点标签,点景点触发 `onOpenSpot`。
- `map-backdrop.tsx`:城市实景背景 WebGL —— 图片 cover 铺满 + 暗角 + 鼠标视差 + **城市切换时 fbm 水墨融合过渡**(移植 CrossMind FluidWorld 双纹理混合)。
- `journey-map.tsx`:整合两视角交叉淡出 + 面包屑返回;点高亮省 `PROVINCE_CITY` 映射下钻。
- `map-section.tsx`:首页全屏地图区块(页面流内,滚到满屏滚过继续)。

### M4d 全站统一详情面板
- `spot-panel.tsx`:`SpotPanelProvider`(挂在 `providers.tsx`)+ `useSpotPanel().open(spotId)` 全站统一入口 + `SpotPanelView` 面板视图。
- 右侧滑入(桌面 62% 宽,移动端全屏),顶部 mini-hero 头图(景点图→城市图→渐变兜底)+ 标题区,下方 summary + 分节图文 + 图集 + **上一站/下一站(面板内切换)**,遮罩变暗 + Esc 关闭 + 锁滚动。

## 图片素材(真实、免费许可)
从 **Wikimedia Commons** 下载了真实的当地红色景点照片(免费许可,适合公开展示),用 sharp 压成 webp(700-850KB):
- `public/cities/guangan/museum.webp`(邓小平故里陈列馆,尼康D810专业图)、`residence.webp`(邓家老宅)
- `public/cities/baise/memorial.webp`(百色起义纪念馆,实拍)
- `public/hero/landmark.webp`(= 广安陈列馆图,Hero版本B背景)
- 下载方法:Wikimedia 文件 URL 可由文件名 MD5 构造(见对话记录),或用 Commons API。实地拍摄后直接替换这些 webp 即可。

## 已验证的结论(浏览器真实截图)
MCP 浏览器工具中途掉线,改用**本地 Chrome headless + CDP**自建截图/交互验证(脚本在 `.review/`,已 gitignore):
1. **配色转亮**:首页米白底 + 红墨流体 Hero,深墨标题清晰(截图确认)。
2. **世界地图**:全国省界完整清晰、省名全标注、四川广西红色高亮块 + 白字省名、周边国家/海洋浅色陪衬 —— 达到"参考图的清晰度 + 我们的红白风格"(见 `.review/map11.png` 级别效果)。
3. **下钻交互**:点广西高亮省 → 切到百色城市视角(百色起义纪念馆实景背景 + 3 个景点足迹点)。
4. **详情面板**:点景点 → 右侧滑出面板,地图变暗,mini-hero 头图 + 双语标题 + 分节内容 + "下一站:粤东会馆"导航,全部正确。
5. `npx tsc --noEmit` + `npm run build` 均干净通过,静态导出正常。

## ⚠️ 重要踩坑记录:地图投影 bug(务必读)
**现象**:四川高亮省的红填充变成覆盖整个视口的巨大方块,导致全图泛红;而广西正常。
**排查**:用 CDP `getBoundingClientRect` 发现四川高亮 path 的屏幕包围盒是 `5547×5547`(全屏),广西正常。逐 polygon 投影发现四川 `coordinates[1]` 是个只有 5 点的退化小环(广安一带的小飞地),几乎共线的点在 geoMercator **自适应曲线重采样**下数值爆炸,投影出 -3713~3821 的极端坐标。数据本身经纬度正常([106.26, 30.2] 附近),不是坏数据,是 d3 数值不稳定。
**解决**:写脚本清洗 `public/geo/china-100000.json`,删除"单独投影会产生极端坐标(<-500 或 >2500)"的退化环(全国共删 2 个)。清洗后四川投影恢复 446~783 正常。**这份 GeoJSON 现在是清洗过的版本**——如果以后重新从 DataV 下载覆盖它,退化环 bug 会复现,需要重新跑清洗(清洗逻辑见对话记录,核心:对每个省的每个 polygon 单独 geoPath,过滤掉投影坐标越界的环)。
**教训**:d3-geo 渲染政区图,遇到"某个多边形填充异常覆盖全图"先怀疑退化环 + 自适应重采样,用逐 polygon 投影定位。

## 已知限制 / 待办
- **Hero 还没选型**:首页暂用版本A。让用户看 `/hero-lab` 选 A 还是 B,再删另一个。
- **城市视角视觉偏乱**:区县半透明轮廓叠在实景上 + 实景本身可能有标语牌等元素,略杂。可考虑弱化/去掉区县轮廓,只留景点点+连线;或给实景加更重的暗化。留待用户看过城市视角后决定。
- **景点详情图未上传**:`spot.body[].image` 和 `spot.images` 指向的 `/spots/<id>/*.jpg` 还不存在,面板里显示浅色占位框。实地拍摄后放进 `public/spots/<id>/` 即可。
- **高亮省填充偏暗**:`#e0392a` 88% 叠暖白显得暗红,可调更鲜亮。
- **四川/广西城市映射**:`journey-map.tsx` 的 `PROVINCE_CITY` 硬编码,加城市要同步改(已知技术债,与 M3 handoff 提的 CITY_IDS 同类)。
- **`fitProjectionTo` 死代码**:`geo.ts` 里这个函数 M4c 重构后没人用了,可删。

## 下一步(M5)
画廊/时间线/照片墙/团队区块填充(`section-placeholders.tsx` 现在是占位)。画廊卡片、时间线节点点击都应复用 `useSpotPanel().open(id)`(全站统一面板已就绪)。

## 给接手者的提示
- **验证前端用本地 Chrome CDP**:MCP 浏览器工具不稳定。`.review/cdp-shot.js`(截图)、`cdp-eval.js`(执行JS取值)、`cdp-flow.js`(导航+点击+截图)可复用。先起 `chrome --headless=new --remote-debugging-port=9333 --user-data-dir=<temp>`。Node 在 Git Bash 下写文件路径用 `C:/...` 正斜杠,别用 `/c/...`。
- 地图配色/scale 都在 `world-map.tsx` 顶部,好调。改省界/高亮色改 `<defs>` 和 `fill/stroke` 常量。
- 不要动 `china-100000.json`(已清洗),要重新下载记得重跑清洗。
