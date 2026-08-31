# M1 交接文档 — 脚手架 + 设计系统 + 数据模型 + i18n

状态:**已完成并验证**。日期:2026-07(项目启动阶段)。

## 这一阶段做了什么

搭建了整个项目的地基:Next.js 16 静态导出脚手架、绛红夜·鎏金设计 token、双语基础设施、景点/城市数据模型(含占位内容)。后续所有里程碑(Hero、地图、详情页、区块)都建立在这些文件之上。

## 交付的文件

```
package.json / tsconfig.json / postcss.config.mjs / next.config.ts / .gitignore
src/app/globals.css          设计 token(绛红夜·鎏金)+ 工具类
src/app/layout.tsx           根 layout,字体引入,Providers 包裹
src/app/page.tsx             【临时占位首页】仅用于自检,M2 会整个重写
src/components/providers.tsx 聚合 ReducedMotionProvider + LocaleProvider + SmoothScroll
src/components/smooth-scroll.tsx  lenis 丝滑滚动(移植自 CrossMind)
src/lib/motion.tsx            motion 动画变体库 + useReducedMotion
src/i18n/LocaleProvider.tsx   全局中英切换 context
src/i18n/ui.ts                UI 固定文案双语字典
src/data/types.ts             Bilingual / City / Spot / SpotSection / TeamMember 类型
src/data/cities.ts            广安、百色两城市数据
src/data/spots.ts             6个占位景点(广安3个+百色3个),含 getVisibleSpots/getSpot/getAdjacentSpots
src/data/team.ts              团队占位信息 + 项目简介双语文案
```

## 已验证的结论

1. **`npm install` 成功**,关键依赖(ogl、d3-geo、motion、gsap、lenis、@fontsource/*)版本齐全,与参考素材(CrossMind / shader-template)版本对齐,后续可以直接照搬那边的动效代码模式。
2. **`npx tsc --noEmit` 无错误**。
3. **`npm run build` 干净通过**,输出 `Route (app) ○ / ○ /_not-found`,证明 `output: 'export'` 静态导出配置正常工作,产物是纯静态文件。
4. **`npm run dev` 起服后用 curl 验证了渲染结果**:
   - 默认语言 `zh-CN`,标题、副标题双语字典取值正确
   - 数据模型跑通:页面正确渲染出「城市 2 / 景点 6」
   - CSS 正确编译:`--color-gold` (`d4a843`)、`--color-crimson` (`c8102e`) 等 token 都出现在生成的 CSS 里,`.text-gold-bright`、`.text-red-gold-gradient` 工具类生成正常
   - 字体正确加载:CSS 里能查到 `font-family: Noto Sans SC`
5. 修了一个 `next.config.ts` 的 workspace-root 警告(用户主目录下还有一个 `package-lock.json` 导致 Next 误判),加了 `turbopack.root` 显式指定。
6. **没有做浏览器截图验证**(环境里没有可用的浏览器自动化/截图工具),验证方式是 curl 抓 HTML/CSS 断言关键字符串存在。这只能确认"没崩、数据对、token 对",**无法确认视觉效果好不好看** —— 这个真正的视觉判断要等 M2 做出可视的 Hero 后,建议用户自己起 `npm run dev` 用浏览器看一眼。

## 已知限制 / 尚未做的事

- 首页 `page.tsx` 是**纯自检占位页**,只有一个标题 + 语言切换按钮 + 景点列表,没有任何"高动效"设计,不代表最终视觉,M2 会整个替换掉。
- `public/` 目录还不存在,图片资源(`spots/*/`, `cities/*/`)要等实地采集或先放占位图。
- `docs/` 目录本文档是第一份,后续每个里程碑完成后都会在这里加一份 `M{N}-handoff.md`。

## 下一步(M2 该做什么)

1. 把 CrossMind 的 `FluidWorld.tsx`(domain-warp fbm WebGL 流体渐变着色器)移植到 ogl,双色系从"冷蓝/暖橙"改成"绛红→朱砂→鎏金"单一暖色渐变(不需要双世界切换那套逻辑,只要静态氛围流动)。
2. 参考 `参考/shader-template` 的 `hero.tsx` 逐行文字 reveal 手法(`overflow-hidden` + `y: 110% → 0%` + stagger),做双语大标题("跨越山河 / Across Mountains" 那种)。
3. 顶部导航:logo/项目名 + 锚点导航 + 中/EN 切换按钮(用已有的 `useLocale().toggleLocale`)。
4. 首页骨架:把 M1 占位页替换为真正的分区结构(Hero → 地图占位 → 画廊占位 → 时间线占位 → 照片墙占位 → 团队占位 → footer),内容区块细节留给 M5,但骨架和滚动节奏这时候要定下来。
5. **务必用浏览器实际看一遍**(不只是 curl 验证),尤其检查 hero 着色器在桌面和 `prefers-reduced-motion` 开启时的表现。

## 给接手者的提示

- 不要重新设计数据模型或 i18n 方案,这两块已经过用户澄清确认(纯前端数据文件、全局中英切换),照着用的就行。
- 如果发现 `src/app/page.tsx` 看起来"太简陋",这是预期的——它是自检页,不是设计交付物。
- 颜色/字体 token 已经定稿(见 `CLAUDE.md` 设计系统速查),除非用户明确要求调整,不要重新发明一套 token。
