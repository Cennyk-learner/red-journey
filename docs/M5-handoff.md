# M5 交接文档 — 首页大改:目的地选择 → 地球 → 叙事路线地图 → 黑色详情窗

状态:**核心已完成并浏览器验证**。承接 `M4-handoff.md`。

## 起因
用户看了 M4 的方案后要求整个首页重做成一条游戏化沉浸链路,并明确:①Hero 选版本 B(风景),但整体太丑要大改;②配色红白为主,**白要彻底、红只做点缀**;③首页做成:进来先问"您的目的地是?"(广安/百色卡片选择)→ 下方 cobe 点阵地球,选目的地地球转过去引出该地点双语标注 → 引出地点旁"开始一段…旅程"游戏式 CTA → 点 CTA 原内容渐隐 → 出现全屏"旅游路线叙事地图"(文旅宣传册气质,非导航工具,参考图 1/2/3 风格)→ 点景点先弹概览气泡 → 点"查看详情"整页弹黑色详情大窗。用户提供了三个 ReactBits 模板作参考(8-bit 的 cobe 地球、saas 的卡片、ai-app 的黑色大卡)。

**代码来源说明**:参考模板只学**技术做法**(cobe 库用法、卡片/黑窗的视觉结构),所有组件都是**原创代码**,适配本项目数据与红白主题,未逐字照搬模板源码。这样更干净、好维护。

## 交付的文件(新增)
```
src/components/journey-shell.tsx            首页编排状态机(intro ↔ journey 渐隐切换)
src/components/intro/destination-globe.tsx  cobe 点阵地球(装饰旋转+选定后转向引出双语标注)
src/components/intro/intro-experience.tsx   目的地卡片选择 + 地球 + "开始旅程"CTA
src/components/journey/route-map.tsx        全屏叙事路线地图 + 概览气泡(OverviewBubble)
src/components/journey/map-decorations.tsx  SVG 装饰件(水墨山/松树/云/红旗/罗盘)
src/components/spot-panel.tsx               【重写】黑色居中详情大窗(原为右滑白面板)
src/app/page.tsx                            【重写】首页 = <JourneyShell/>
```
配色 token(`globals.css`)大改:`--bg` 纯白,新增 `--paper`(纸张米白)、`--panel-dark`(详情窗黑底);红色从"主视觉"降为"点缀色"。

## 删除的文件(已备份/清理)
- M4c 的真实中国地图:`world-map/city-map/journey-map/map-backdrop/map-section.tsx` → 备份在 `.backup-m4c-map/`(gitignore),用户说"先备份,后面估计用不到"。
- 旧 Hero:`hero.tsx/hero-fluid/hero-landmark/hero-content/fluid-shader.tsx` + `/hero-lab` 路由。
- 孤立 lib:`map-data.ts/geo.ts/use-element-size.ts`、`section-placeholders.tsx`。
- 依赖仍在 package.json(d3-geo/topojson/three 等),没主动卸(留着不碍事;要精简可删)。新增 `cobe`。

## 数据变化
- `spots.ts` 每个景点加了 `tags?: Bilingual[]`(概览气泡/详情窗的特色标签,如「5A景区」「爱国教育」)。`types.ts` 同步加字段。
- 景点仍是那 6 个(广安3 + 百色3),含华蓥山游击队遗址。

## 已验证(本地 Chrome CDP 真实截图,逐帧确认)
1. **开场**:白底,大衬线标题"您的目的地是?",两张目的地卡(缩略图+名+简介),右侧 cobe 点阵地球带广安/百色两个红点。红仅点缀,白为主 —— 达到用户要的克制高级感。
2. **选目的地**:点广安 → 卡片红框高亮、地球转到中国面向镜头、"四川·广安"引线标注浮出、红色"开始一段 四川·广安 的红色之旅"CTA 出现 + "共3处景点"。
3. **进入路线地图**:CTA 点击 → intro 渐隐、全屏路线地图渐显。纸张底 + 水墨山/松树/云/红旗/罗盘装饰 + 蜿蜒红色主路径(GSAP 生长)串联3个序号节点(邓小平故里→缅怀馆→华蓥山游击队遗址)。左上"重新选择"返回 + 标题(已修与返回按钮重叠的 bug)。
4. **概览气泡**:点节点 → 节点旁弹卡片(缩略图+名+简介+标签pills+"查看详情"按钮)。
5. **黑色详情窗**:点"查看详情" → 整页居中弹黑色大圆角窗,金色点缀,"四川·广安·第1站"眉标 + 大标题 + tagline + 标签 + summary + 分节图文(左标题右正文)+ 图集 + 上/下一站。Esc/点遮罩关闭。
6. `tsc --noEmit` + `npm run build` 均通过,静态导出正常(路由只剩 `/`)。

## 技术要点 / 坑
- **cobe 地球**:`onRender` 回调在 cobe 的 TS 类型里没暴露(运行时支持),改用手动 rAF `globe.update({phi})` 循环(cobe 文档推荐写法)。focus 走 ref 不重建地球,避免闪烁。地球转向逻辑:`phiForLocation = atan2(-x,z)` 算目标经度,每帧缓动 6%。
- **路线地图布局**:景点沿蛇形路径**程序化排布**(`layoutNodes`:从左到右均分 + 正弦起伏),**数据驱动**,加/删景点自动重排,不依赖真实坐标。路径用 Catmull-Rom 平滑。**这是关键设计**——用户要的是"叙事路线"不是真实地图,所以不用地理投影。
- **详情窗**沿用 `SpotPanelProvider` 的全站统一入口 `useSpotPanel().open(id)`,只换了视图(右滑白 → 居中黑)。以后画廊/时间线也能复用。

## 已知限制 / 待办
- **景点详情图 `/spots/<id>/*.jpg` 仍未上传**:概览气泡缩略图、详情窗头图、图集现在是空/占位色。实拍后放进 `public/spots/<id>/` 即可(城市图 `public/cities/` 已是真实 Wikimedia 图)。
- **移动端未细调**:intro 的 grid 在窄屏会堆叠(地球在下),路线地图 SVG 用 `preserveAspectRatio slice` 铺满,但节点标签在小屏可能挤。M6 要专门过一遍手机。
- **装饰件较简约**:山/树/云是程序化 SVG,不是手绘插画(用户认可这个技术方向)。若想更精致可后续换成更复杂的 SVG 或引入免费插画素材。
- **路线地图只有单城市视角**:没有"全国/两城市总览"了(用户要的就是选一个城市进去看它的路线)。切城市靠左上"重新选择"回开场再选。
- **nav 导航栏的锚点**(足迹地图/精选影像/关于我们)现在指向不存在的 section,点了没反应。M6 或后续区块补齐时再接,或先隐藏非首页锚点。

## 下一步(建议 M6)
1. 等用户看过这版反馈(整体风格、装饰精致度、文案)。
2. 移动端适配(intro 堆叠、路线地图节点密度、详情窗全屏)。
3. 补景点实拍图。
4. nav 锚点处理(隐藏或接真实区块)。
5. 双语全量校对(新增的 intro/route 文案)。

## 给接手者
- **验证用本地 Chrome CDP**:MCP 浏览器工具不稳。`.review/cdp-shot.js`(单截图)、`cdp-flow.js`(点击+截图)、`cdp-route.js`(进路线地图截图)、`cdp-detail.js`(进详情窗截图)可复用。先起 `chrome --headless=new --remote-debugging-port=9333 --user-data-dir=<temp>`。Node 写文件路径用 `C:/...` 正斜杠。`.review/` 已 gitignore。
- 加/删景点:改 `spots.ts`(含新的 `tags`),路线地图/概览/详情全自动更新,蛇形布局自动重排。
- 改配色:`globals.css` 顶部 token。红是点缀,别大面积用。
- 别动 `.backup-m4c-map/`(真实地图备份,用户要留着)。
