# M3 交接文档 — 足迹地图双样板 /map-lab

状态:**已完成并验证,等待用户选型**。承接 `M2-handoff.md`。

## 这一阶段做了什么

下载了三份行政区划 GeoJSON,做了一个共享的「质感中国地图」底图组件,基于它实现了两种交互样板(滚动叙事式 / 交互探索式),放在 `/map-lab` 对比页供用户在电脑和手机上实测后选型。**这是用户明确要求的步骤,不要跳过选型直接二选一替用户决定。**

## 交付的文件

```
public/geo/china-100000.json     全国省级边界(35个省/自治区/直辖市/特别行政区)
public/geo/guangan-511600.json   广安市级边界(6个区县)
public/geo/baise-451000.json     百色市级边界(12个区县)

src/lib/geo.ts                   d3-geo 投影工具(fitProjection/projectPoint/loadGeo)
src/lib/use-element-size.ts      ResizeObserver 封装,测量容器实际渲染尺寸
src/lib/map-data.ts              cities/spots → 地图点位/路径的数据派生层(两样板共用)

src/components/map/red-map.tsx           共享底图组件:金线边界+深红渐变陆地+光晕足迹点
src/components/map/map-scroll-narrative.tsx  样板A·滚动叙事式
src/components/map/map-exploratory.tsx       样板B·交互探索式

src/app/map-lab/page.tsx         对比页,tab切换两样板(见下方"设计决策"关于为何是tab不是并排)
```

## 数据来源

GeoJSON 来自阿里云 DataV.GeoAtlas 官方接口:`https://geo.datav.aliyun.com/areas/bound/{adcode}_full.json`。这是构建时一次性下载的静态文件,**不是运行时请求外部 API**——纯前端项目部署后不依赖阿里云可用性。

如果以后要加新城市:
1. 查到该城市的行政区划代码(adcode),例如搜"广安 行政区划代码"或直接看 `china-100000.json` 里对应省份 feature 的 `properties.adcode`
2. `curl -o public/geo/<拼音>-<adcode>.json https://geo.datav.aliyun.com/areas/bound/<adcode>_full.json`
3. 在 `src/lib/map-data.ts` 的 `GEO_PATHS.byCity` 里加一条映射
4. 在 `src/data/cities.ts` 加对应城市数据(见 `CLAUDE.md` 的"增删景点/城市方法")

## 设计决策与来源

**共享底图 + 两套交互外壳**的架构,而不是两个完全独立的地图实现——`RedMap` 组件只负责"给定 GeoJSON + 视口 + 点位/路径数据 → 渲染出质感 SVG",不管数据怎么随时间/交互变化。这样两个样板的差异只在"如何驱动 RedMap 的 props",复用度高,以后不管选哪个,底图渲染逻辑都不用重写。

**分层视角(全国→市级)解决"不空不挤"**:两个样板都遵循同一个原则——全国视角只显示广安/百色两个大点(不挤),点入或滚动到对应阶段后才展开该市具体的景点足迹点(不空)。这是你在澄清问题时明确要求的方案,已经在两个样板里都实现。

**路径生长动画的实现方式**:`RedMap` 给 trail `<path>` 设置 `pathLength={1}` + 初始 `strokeDasharray={1} strokeDashoffset={1}`(整条线用 stroke-dash 技巧隐藏),并通过 `trailRef` 把这个 DOM 节点暴露给外部。两个样板各自用 GSAP 把 `strokeDashoffset` 从 1 动画到 0,实现"画出来"的效果。选这个方案是因为 `pathLength` 归一化后,不管路径实际多长(全国路径 vs 市内景点路径,长度差异很大),动画写法都一样,不用管坐标系换算。

**样板A的 ScrollTrigger 用单条 timeline,而非三个独立 ScrollTrigger**:最初尝试给每段动画各挂一个 `start:"+=X%" end:"+=Y%"` 的独立 ScrollTrigger,发现这种写法依赖手算百分比、容易在滚动总距离变化时互相错位。改成 GSAP 官方推荐模式——只在最外层 `gsap.timeline()` 挂**一个** ScrollTrigger(`pin` + `scrub`),三段动画用 timeline 内部的绝对时间位置(`0`/`1`/`2`)对齐,由 GSAP 自动保证滚动进度和动画段落的映射关系,不需要手动同步。

**`/map-lab` 用 tab 切换而非左右并排**:两个地图都是全屏沉浸式设计,并排会导致每个都只有半屏宽,细节和文字看不清,也不符合两者本来的设计意图(尤其样板A需要完整视口高度做 pin)。改成上方 tab 切换,每次只看一个,但能完整体验。

## 已验证的结论

这次学会了 M2 踩过的坑(WebGL 异步 readPixels 会读到假黑屏),验证时全部用**同步 DOM 查询 + 真实点击/滚动事件**,不再依赖不可靠的异步像素采样:

1. **`npx tsc --noEmit` 与 `npm run build` 均干净通过**,`/map-lab` 路由正常静态导出,`public/geo/*.json` 三份文件正确进入 `out/` 产物(体积共约480KB)。
2. **全国地图渲染验证**:SVG 内 35 个省级 `<path>`(与 GeoJSON 的 35 个 features 一一对应),2 个城市标记点文字正确显示"四川·广安"/"广西·百色";path 的 `fill` 引用渐变 `url(#red-map-land-gradient)`,渐变首色 `rgb(58,18,22)` 正是设计的深红 `#3a1216`;描边色 `rgba(212,168,67,0.32)` 正是鎏金 hairline token。
3. **样板B(交互探索式)端到端验证**:点击广安光点 → 全国视角 SVG 淡出(opacity 0→实测确认)、广安市级 SVG 淡入(opacity 1)、市级地图渲染出 6 个区县 path、正确显示 3 个景点标记"邓小平故里"/"邓小平缅怀馆"/"华蓥山游击队遗址"(与 `spots.ts` 数据完全对应)、面包屑按钮出现且文案正确("返回全国视角 · 四川 · 广安")。点击返回按钮验证可以回到全国视角。
4. **样板A(滚动叙事式)端到端验证**:`pin:true` 正确撑出约 250% 视口高的滚动距离(实测 `scrollHeight` 与视口高度的比例吻合预期);程序化滚动到 1600px 时阶段文字正确变为"四川·广安"、广安市级 SVG 容器 opacity 变 1;滚动到底部时阶段文字正确变为"广西·百色"。三段式 timeline 与 ScrollTrigger 的映射关系验证无误。
5. **移动端视口验证**(390×844):无横向溢出,SVG 地图正确响应式缩放到 390px 宽度,tab 切换按钮正常可点击。
6. **控制台无报错**。

## 已知限制 / 尚未做的事

- **两个样板都还没有真人视觉验收**——数值/DOM/交互链路验证只能确认"功能对、数据对、没崩",不能替代"好不好看""滚动手感顺不顺"这类主观判断。**这是本里程碑最重要的未完成项:需要用户亲自打开 `npm run dev` 访问 `/map-lab`,在电脑和手机上分别体验两个样板,然后告诉我选哪个**(或者两个都不满意、要调整)。
- 阶段说明浮层(样板A底部的"跨越山河"/"四川·广安"/"广西·百色")文案是 M3 里临时写的,没有走 `src/i18n/ui.ts` 字典,如果继续用样板A需要在 M4 时把这段迁移到 i18n 系统里(目前双语能显示,但没有复用统一字典,是技术债)。
- 景点点位目前不可点击进详情页(M4 才做详情页路由),现在点击 marker 没有 `onClick`(city marker 除外)。
- 触屏设备上样板A的 scroll-scrub 体验没有做特别优化(依赖 lenis 的 `touchMultiplier`),真机可能需要调整 `scrub` 数值或 `end` 距离。

## 下一步

**先等用户选型反馈**,不要在没有选型结果的情况下就代替用户决定。用户选定后:

1. 把未选中的样板文件、`/map-lab` 路由、`.map-lab` 相关的临时 UI 一并删除(参考 `CLAUDE.md` 不要留技术债)。
2. 选定的样板嵌入首页 `#map` 区块(替换 `section-placeholders.tsx` 里的 `MapSection` 占位)。
3. 如果选了样板A,把阶段说明文案迁移进 `src/i18n/ui.ts`。
4. 给景点 marker 加 `onClick`,点击跳转到 M4 要做的详情页(`/spots/[id]`)。

## 给接手者的提示

- `RedMap` 组件是两个样板共同的地基,不要为了改一个样板的效果去改这个共享组件的默认行为(比如陆地渐变色、marker 光晕大小),除非用户明确要求两个样板视觉统一调整。如果只想改某个样板独有的东西,应该在样板文件里通过 props 覆盖,而不是改 `red-map.tsx` 内部硬编码值。
- `map-data.ts` 里的 `GEO_PATHS` 是唯一的"城市 id → GeoJSON 路径"映射表,新增城市时只改这一处 + `cities.ts`,不要在样板组件里硬编码城市 id 列表(样板A的 `CITY_IDS` 常量目前是硬编码的 `["guangan", "baise"]`,这是已知的技术债,如果加第三个城市需要同步改这里,理想情况下应该从 `CITIES` 数组派生,M3 先没做这个抽象是因为只有两个城市时过度设计没必要)。
- 验证 WebGL/Canvas 视觉效果时参考 `M2-handoff.md` 的教训;验证 SVG/DOM 内容(本里程碑用到的场景)反而是可靠的,直接用 `page_evaluate` 查询元素属性即可,不需要绕路。
