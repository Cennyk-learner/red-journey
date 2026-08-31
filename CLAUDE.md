# 红色足迹 · Red Journey

三下乡红旅赛道项目:中英双语景点展示系统,展示实践团在四川广安、广西百色的红色景点足迹。

## 项目背景

- 用途:三下乡社会实践(红旅赛道 + 促进中外交流),向中外观众双语展示红色景点
- 已去/将去地点:四川广安、广西百色(具体景点仍在增删中,架构已适配)
- 视觉要求:高动效、贴近 `../参考/` 素材的动效风格(学**动效手法**,不是学配色);基调「**白 · 红点缀**」—— **大面积纯白留白,中国红只做强调点缀**(按钮/路径/序号/高亮才用红),深墨文字,克制高级文旅感。历史:M1-M3 深色「绛红夜」→ M4 白+红为主 → M5 白得更彻底、红降为点缀,前两版作废。
- 首页 = 一条游戏化沉浸链路(**不是传统滚动落地页**),正式需求见 `../需求文档_首页游戏化沉浸体验.docx`(参考图在 `../.docx-media/`):**开场漂浮照片场**(three.js 照片环,照抄 ai-app hero,M7c)+ 悬浮询问卡(saas 模板卡质感)+ 底部**抽象点阵地球**(canvas 自绘,非真实地理;两城锚点拉远,换城市继续同向旋转)→ 选目的地 → 照片场淡出、背景**水墨交融**过渡到该城风景大图(WebGL,Ken Burns 动效)+ 地球转向引出地点标注 + 卡下方居中「启程 XX篇」游戏 CTA → 全屏叙事路线地图(**已定稿:高端杂志风**,含里程标/双语水印/图例)→ 下滑「观看实践影像」滚动生长区块(照抄 ai-app video-showcase,占位视频)→ 点景点弹概览气泡 → "查看详情"弹**右侧 2/3 黑色抽屉**(公众号跳转卡 + 占位区块)。
- 完整规划见 `../PLAN.md`;每个里程碑详细交接见 `docs/M{N}-handoff.md` —— **新窗口接手先读最新一份**(当前是 M7)
- **当前待办(M8 候选)**:公众号真实链接+二维码;成片替换占位视频;移动端适配;华蓥山/纪念碑园实拍图;nav 锚点处理;CC BY-SA 图片署名;可卸载 cobe。详见 `docs/M7-handoff.md`。

## 技术栈

Next.js 16 (App Router, 静态导出 `output: 'export'`) · React 19 · TypeScript · Tailwind CSS v4 · motion (framer-motion 后继) · GSAP + ScrollTrigger · lenis(丝滑滚动) · ogl(WebGL 着色器,水墨背景) · three + @react-three/fiber(开场漂浮照片场,M7c 起) · d3-geo(地图投影)

纯前端,无后端、无数据库。`npm run build` 产出静态文件到 `out/`,可部署到任意静态托管。

## 项目结构

```
src/
  app/            page.tsx 首页, hero-lab/page.tsx Hero选型对比页, layout.tsx, globals.css
  components/
    fluid-shader.tsx  Hero版本A的WebGL明亮流体着色器(白底红墨光云,ogl)
    hero-fluid.tsx    Hero版本A(流体) / hero-landmark.tsx 版本B(风景大图) / hero-content.tsx 共享文字层
    nav.tsx           顶部导航(滚动变白底,含中/EN切换)
    footer.tsx        页脚
    spot-panel.tsx    【全站统一详情抽屉】SpotPanelProvider + useSpotPanel().open(id) + 右侧2/3抽屉视图
    section-placeholders.tsx  画廊/时间线/照片墙/团队 占位骨架(待M5填充)
    providers.tsx / smooth-scroll.tsx  全局 provider(含SpotPanelProvider) 与 lenis 滚动
    map/
      world-map.tsx     全国视角:清晰中国地图(省界+省名+川桂红高亮),可点省下钻
      city-map.tsx      城市视角:区县半透明轮廓+景点序号点+鎏金足迹连线(叠在实景上)
      map-backdrop.tsx  城市实景背景(WebGL:cover+暗角+鼠标视差+城市切换水墨过渡)
      journey-map.tsx   整合两视角交叉淡出+下钻+面包屑
      map-section.tsx   首页全屏地图区块
  data/           【核心可维护数据】types.ts / cities.ts / spots.ts / team.ts
  i18n/           LocaleProvider.tsx(全局中英切换) + ui.ts(UI文案字典)
  lib/
    motion.tsx / geo.ts(d3-geo投影+TopoJSON加载) / map-data.ts(数据派生) / use-element-size.ts
public/
  geo/            world-110m.json(世界TopoJSON) + china-100000.json(全国,【已清洗退化环】)
                  + guangan-511600.json + baise-451000.json
  cities/<id>/    各城市真实景点图(webp):guangan/museum.webp,residence.webp;baise/memorial.webp
  hero/           landmark.webp(Hero版本B背景)
  spots/<id>/     各景点图片(待实拍上传),目录名对应 data/spots.ts 的 id
docs/             各里程碑交接文档(M1~M4-handoff.md)
```

## 增删景点/城市的方法(最常见的维护操作)

- **加/删/隐藏景点**:编辑 `src/data/spots.ts`,增删一个对象,或把 `visible` 改 `false`(不删数据,保留草稿)。地图足迹点、时间线、画廊、详情面板**全部自动更新**,不需要改其他文件。
- **加/删城市**:编辑 `src/data/cities.ts`;在 `src/lib/map-data.ts` 的 `GEO_PATHS.byCity` 和 `CITY_PROVINCE` 加映射;在 `journey-map.tsx` 的 `PROVINCE_CITY` 加"省名→cityId"映射(点省下钻用)。城市级 GeoJSON 下载方法见 `docs/M3-handoff.md`。
- **图文素材**:占位文案已按真实广安/百色红色景点写好中英初稿;城市实景图已用真实 Wikimedia 图(见项目结构 `public/cities/`);景点详情图待实拍,放进 `public/spots/<id>/` 并更新 `spots.ts` 的 `images`/`body[].image` 即可。
- **⚠️ 不要覆盖 `public/geo/china-100000.json`**:它已清洗掉导致 d3 投影爆炸的退化环(详见 `docs/M4-handoff.md` 踩坑记录)。若必须重新下载,记得重跑清洗,否则四川高亮会覆盖全屏。

## 设计系统速查

Token 定义在 `src/app/globals.css` 的 `:root`(「中国红·白」亮色):

- `--bg #fefcfa`(暖白底)、`--surface #fff`、`--crimson #d21f2e`(明亮中国红,主视觉)、`--vermilion #e8432c`(朱砂)、`--gold #c9992f`(鎏金点缀)、`--ink #241412`(深墨文字)、`--ink-invert #fdf6f0`(反白,用于深色大图/暗背景上)
- 工具类:`.glass-card`(白色玻璃卡,浅底用)、`.glass-card-dark`(深色语境玻璃卡,图片/暗背景上用)、`.text-red-gold-gradient`(红金渐变文字,白底主强调)、`.gold-hr`(分隔线)、`.en-accent`(英文serif斜体强调)、`.red-map-highlight`(地图高亮省呼吸动画)
- 字体:中文思源黑体/宋体(`noto-sans-sc`/`noto-serif-sc`),英文强调 `instrument-serif` 斜体

## 双语系统

- `useLocale()` hook(来自 `src/i18n/LocaleProvider.tsx`)提供 `{ locale, toggleLocale, tr }`
- 内容双语字段类型是 `Bilingual = { zh: string; en: string }`,取值用 `tr(spot.name)` 而不是手写 `spot.name[locale]`
- UI 固定文案(导航、按钮等)在 `src/i18n/ui.ts` 的 `ui` 字典里,用 `t(ui.xxx, locale)` 取值
- 语言选择存 `localStorage`,首次访问按浏览器语言自动判断

## 已知注意事项

- `next.config.ts` 里显式设置了 `turbopack.root`,因为用户主目录下若也有 `package-lock.json`,不设置会导致 Next 误判 workspace 根目录并报警告
- `LocaleProvider` 首次渲染固定输出 `zh`(避免 SSR/CSR hydration mismatch),挂载后才从 localStorage/浏览器语言矫正 —— 如果看到语言"闪一下"是预期行为,不是 bug
- 原始实拍素材放在仓库外的 `../素材/`,通过 `RED_JOURNEY_ASSETS` 环境变量指向;勿将本地绝对路径写进脚本
- Hero 着色器(`fluid-shader.tsx`)里的配色常量是手动从 `globals.css` 的十六进制 token 转成 GLSL vec3 的,**改 token 时记得同步改着色器常量**,没有自动同步机制
- **地图退化环坑**:d3-geo 渲染政区图时,若某省填充异常覆盖全图,是 DataV GeoJSON 里的退化小环在 geoMercator 自适应重采样下数值爆炸所致。`china-100000.json` 已清洗;重下需重跑清洗。详见 `docs/M4-handoff.md`。
- **前端视觉验证**:MCP 浏览器工具不稳定,备用方案是本地 Chrome headless + CDP(脚本在 `.review/`,已 gitignore)。起 `chrome --headless=new --remote-debugging-port=9333 --user-data-dir=<temp>`,用 `.review/cdp-shot.js`(截图)/`cdp-eval.js`(取值)/`cdp-flow.js`(点击+截图)。Node 写文件路径用 `C:/...` 正斜杠。验证 WebGL 别用异步 `readPixels`(假黑屏),详见 `docs/M2-handoff.md`。

## 常用命令

```
npm run dev         # 开发服务器 http://localhost:3000
npm run build        # 静态导出到 out/
npm run typecheck    # tsc --noEmit
```
