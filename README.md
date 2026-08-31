# 红色足迹 · Red Journey

三下乡社会实践项目 — 中英双语沉浸式红色景点展示网站（四川广安 · 广西百色）。

## 在线预览

静态站点，构建后可部署至 GitHub Pages、Vercel 或任意静态托管。

## 技术栈

Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · GSAP · Lenis · Three.js

## 快速开始

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # 静态导出到 out/
npm run typecheck
```

## 维护数据

| 文件 | 内容 |
|------|------|
| `src/data/spots.ts` | 景点信息、行程顺序 |
| `src/data/cities.ts` | 城市与地图数据 |
| `src/data/team.ts` | 实践团队成员 |
| `src/data/media-coverage.ts` | 媒体报道与公众号链接 |

## 图片导入（本地）

原始实拍放在仓库外的 `../素材/` 目录，或通过环境变量指定：

```bash
# Windows PowerShell
$env:RED_JOURNEY_ASSETS = "D:\path\to\素材"
python scripts/import-spot-images.py
python scripts/prepare-team-assets.py
```

成员单人照导入见 `scripts/seed/member-photos/README.md`。

## 脱敏说明

发布前请阅读 [docs/DESENSITIZATION.md](docs/DESENSITIZATION.md)。

## 许可证

项目代码仅供学习与团队展示使用。图片素材请遵守各自版权说明。
