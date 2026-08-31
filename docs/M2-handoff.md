# M2 交接文档 — Hero 红金流体 + 导航 + 首页骨架

状态:**已完成并验证**。承接 `M1-handoff.md`。

## 这一阶段做了什么

把 M1 的自检占位首页替换成真正的视觉交付物:全屏 WebGL 红金流体 Hero、顶部导航(含中英切换)、逐行文字 reveal 大标题、城市入口按钮,以及首页其余区块的骨架结构(地图/画廊/时间线/照片墙/团队目前是占位卡片,留给 M3/M5 填充)。

## 交付的文件

```
src/components/fluid-shader.tsx        WebGL 红金流体着色器背景(ogl 引擎)
src/components/nav.tsx                  顶部导航,滚动响应 + 中英切换
src/components/hero.tsx                 Hero 区块:着色器背景 + 逐行文字 reveal + 城市入口
src/components/section-placeholders.tsx 地图/画廊/时间线/照片墙/团队 五个区块占位骨架
src/components/footer.tsx               页脚
src/app/page.tsx                        【重写】真正的首页分区结构(替换 M1 自检页)
```

## 技术决策与来源

**着色器算法融合了两个参考素材**:
- fbm 噪声算法(hash/noise/fbm 函数)、domain-warp 流体扭曲手法 —— 直接移植自 CrossMind `FluidWorld.tsx`,原版是冷蓝/暖橙双世界切换,本项目改成单一绛红→朱砂→鎏金暖色渐变,去掉了双世界 `uProgress` 切换逻辑(不需要)。
- 引擎写法(imperative ogl,而非 R3F/three,resize/可见性/reduced-motion 生命周期管理)—— 移植自 `参考/shader-template` 的 `shader-canvas.tsx`。选 ogl 而不是 CrossMind 用的 three.js + R3F,是为了减小首屏 JS 体积(ogl 是轻量级 WebGL 封装,shader 模板同款选择)。
- 额外加了鼠标跟随柔光(`uMouse`/`uMouseI`),桌面端体验更细腻;触屏设备不触发 `pointermove`,自然退化为无光晕,不需要单独判断设备类型。

**逐行文字 reveal 手法**:`overflow-hidden` 容器 + 内部 `span` 做 `y: 110% → 0%` 位移动画,stagger 延迟 —— 直接移植自 `参考/shader-template` 的 `hero.tsx`。

**导航滚动响应**:结构移植自 `参考/shader-template` 的 `nav.tsx`(滚动后从透明变实底玻璃拟态),精简掉了原版的汉堡菜单/多级导航(本项目只有 3 个锚点,不需要移动端抽屉菜单,直接横向挤压隐藏非核心链接),加入了本项目独有的中/EN 切换按钮。

## 已验证的结论

验证方式:本次用了浏览器自动化工具(`page_navigate` + `page_evaluate` + `page_click`),不再只是 curl 断言字符串。

1. **`npx tsc --noEmit` 无错误,`npm run build` 干净通过**,静态导出正常。
2. **WebGL 着色器渲染验证**(费了一番周折,记录下来避免后人重复踩坑):
   - 无头浏览器环境里,异步 `readPixels`(在单独的 `page_evaluate` 调用里读取)会读到全黑 `[0,0,0,255]`,一度怀疑着色器没有真正绘制。
   - 排查后确认这是 **`preserveDrawingBuffer: false`(默认值,ogl/CrossMind/shader-template 三处都是这个配置)导致的时序假象**:合成器在两次 CDP 调用之间可能已经清空/交换了缓冲区,不代表画面本身是黑的。
   - 决定性证据:①截图文件体积(58KB dataURL / 324KB PNG)远超纯黑画面应有的体积;②在同一个 `page_evaluate` 调用内做「同步 `drawArrays` 后立即 `readPixels`」,读到了 `[46,14,17]` 等深绛红色值,且画布四角/中心采样值各不相同(证明是渐变图案而非纯色);③独立的最小着色器编译测试(纯红色三角形)证明这个浏览器环境本身没有 WebGL 限制。
   - **结论:着色器渲染正确**,颜色落在设计的绛红→朱砂→鎏金色域内。
   - **没能拿到可直接目视的截图文件**——`page_screenshot` 返回的路径(`screenshots/external/screenshots/...`)存在于浏览器工具自己的沙箱文件系统里,本会话的 `Read` 工具访问不到那个路径(试了直接读、glob 全盘搜索、offloaded-artifacts 接口,均未定位到实际文件)。这是环境限制,不是代码问题。**如果后续接手者有可用的截图查看方式,建议实际看一眼视觉效果**,毕竟"颜色数值对"不完全等于"好看"。
3. **中英切换端到端验证**:点击导航按钮后 —— `<h1>` 文案从中文变英文、`<html lang>` 属性从 `zh-CN` 同步变 `en`、按钮文案从 `EN` 变 `中`(提示可切回中文)。功能链路完整可用。
4. **移动端视口验证**(390×844,iPhone 尺寸):无横向溢出(`scrollWidth === innerWidth`),导航栏可见,`<h1>` 字号自动降到 40px 且不超出视口宽度。
5. **控制台无报错**(`console_get_logs`/`console_get_exceptions` 均为空)。
6. 该无头浏览器环境的 `prefers-reduced-motion` 检测返回 `true`(环境特性,非 bug),这意外验证了 reduced-motion 分支——该分支下着色器只渲染一帧静态画面、不启动 rAF 循环,而这一帧同样正确渲染出了颜色,证明降级路径没有写挂。

## 已知限制 / 尚未做的事

- 地图/画廊/时间线/照片墙/团队五个区块目前都是**虚线边框的占位卡片**(`section-placeholders.tsx`),文字写着"M3/M5 · xxx占位",没有任何真实内容或动效,等待后续里程碑填充。
- Hero 里的城市入口按钮当前 `href` 都指向 `#map`(锚点跳转到地图占位区),等 M3 地图做完后可能要改成更精确的行为(比如点击广安直接让地图下钻到广安视角)。
- 没有做真实浏览器的视觉截图确认(见上文说明),建议用户或后续接手者用 `npm run dev` 亲自看一眼,尤其关注:
  - 流体着色器的动态观感(色彩流动是否够"液态"、鎏金高光是否突兀)
  - 逐行文字 reveal 的时序节奏(delay 数值是拍脑袋定的,`STAGGER_DELAY = 1.5` 秒起入场,可能偏慢或偏快)
  - 移动端触屏下 Hero 的实际观感(没有鼠标,那圈柔光效果不会出现,画面会比桌面端"素"一些,是否需要移动端单独加点别的动态元素待定)

## 下一步(M3 该做什么)

1. 建 `/map-lab` 路由,下载 DataV GeoAtlas GeoJSON(全国 `100000_full` + 广安 `511600_full` + 百色 `451000_full`)到 `public/geo/`。
2. 用 d3-geo 做投影,自绘质感 SVG 中国地图(金线省界、深红渐变陆地、光晕足迹点)。
3. 做两个交互样板(滚动叙事式 / 交互探索式),供用户在电脑和手机上实测后选型。
4. 样板做完后**务必实际用浏览器看一遍**再报告完成——地图这种强视觉/强交互的组件,光靠 DOM/WebGL 数值校验是不够的。

## 给接手者的提示

- `section-placeholders.tsx` 里的占位区块用了统一的 `SectionShell` 包装(eyebrow + 标题 + 内容插槽),M5 填充内容时可以复用这个壳,或者直接删掉占位内容换成真实组件,不需要保留"占位"字样。
- 着色器文件 `fluid-shader.tsx` 里的配色常量(`BG_DEEP`/`CRIMSON`/`VERMILION`/`GOLD`/`GOLD_HI`)是手动把 `globals.css` 里的十六进制 token 转成了 GLSL 需要的 0-1 浮点 vec3,**如果以后调整 `globals.css` 里的设计 token,记得同步更新这里的着色器常量**,两处目前没有自动同步机制。
- 如果要验证 WebGL 视觉效果,不要只依赖异步 `page_evaluate` 里的 `readPixels`(会读到假黑屏),要么用同步 draw+read 的写法(参考本文档"已验证的结论"第2条的方法),要么想办法找到真实可查看的截图路径。
