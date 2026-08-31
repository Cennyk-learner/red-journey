#!/usr/bin/env python
"""
构建期字体管线 —— 依赖本机 Python + fontTools + brotli。

产出三样东西:

1. public/fonts/ma-shan-zheng-display.woff2
   马善政毛笔楷书(OFL)的子集,只含 scripts/display-glyphs.txt 里列出的字。
   原包的简体全集是单个 2.7MB woff2(未按 unicode-range 分片),直接引用会
   阻塞首屏,所以必须自己切。子集里没有的字会回落到思源宋体,不会渲染成豆腐块。
   ⚠ 改动大字文案后要重跑 `npm run fonts`,否则新字没有毛笔字形。

2. src/lib/logotype-paths.ts
   「红色足迹」四个字的字形轮廓(SVG path),用于站点徽记的「双钩填墨」书写动效:
   先描边(stroke-dashoffset 走一遍),再填墨。字形坐标已翻转到 SVG 的 y 轴向下,
   并归一到 1000 单位的 em 方格。

3. public/fonts/lxgw/
   霞鹜文楷屏显版 GB 字形(OFL)的官方 97 片 unicode-range 分包,原样搬到 public/。
   走 public 而不是让打包器处理 node_modules 里的 CSS:97 个 woff2 过一遍 CSS
   pipeline 拖慢构建,而且静态导出下路径不可控。浏览器按 unicode-range 只取
   页面真正用到的那几片。
"""

from __future__ import annotations

import re
import shutil
import subprocess
import sys
from pathlib import Path

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
SOURCE = (
    ROOT
    / "node_modules"
    / "@fontsource"
    / "ma-shan-zheng"
    / "files"
    / "ma-shan-zheng-chinese-simplified-400-normal.woff2"
)
GLYPH_LIST = ROOT / "scripts" / "display-glyphs.txt"
OUT_FONT = ROOT / "public" / "fonts" / "ma-shan-zheng-display.woff2"
OUT_PATHS = ROOT / "src" / "lib" / "logotype-paths.ts"

LXGW_PKG = ROOT / "node_modules" / "lxgw-wenkai-screen-webfont"
LXGW_CSS = LXGW_PKG / "lxgwwenkaigbscreen.css"
LXGW_OUT = ROOT / "public" / "fonts" / "lxgw"

LOGOTYPE = "红色足迹"
EM = 1000  # 归一化后的 em 方格边长


def collect_chars() -> str:
    """display-glyphs.txt 里的字符 + 基本拉丁与常用标点,去重后按码位排序。"""
    raw = GLYPH_LIST.read_text(encoding="utf-8")
    chars = {c for c in raw if not c.isspace()}
    chars |= set("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz")
    chars |= set("·—…、。，；：？！「」『』（）〈〉《》〇-—/.,:;'\"()&%°")
    return "".join(sorted(chars))


def subset(chars: str) -> None:
    OUT_FONT.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        sys.executable,
        "-m",
        "fontTools.subset",
        str(SOURCE),
        f"--text={chars}",
        "--flavor=woff2",
        f"--output-file={OUT_FONT}",
        "--layout-features=*",
        "--no-hinting",
        "--desubroutinize",
    ]
    subprocess.run(cmd, check=True)
    kb = OUT_FONT.stat().st_size / 1024
    print(f"[fonts] {OUT_FONT.name}: {len(chars)} 字 / {kb:.1f} KB")


def extract_logotype() -> None:
    """取四个字的轮廓,翻 y 轴并归一到 EM 方格。"""
    font = TTFont(SOURCE)
    upm = font["head"].unitsPerEm
    scale = EM / upm
    glyph_set = font.getGlyphSet()
    cmap = font.getBestCmap()
    hmtx = font["hmtx"]

    entries = []
    cursor = 0.0
    min_x = min_y = float("inf")
    max_x = max_y = float("-inf")

    for ch in LOGOTYPE:
        name = cmap[ord(ch)]
        pen = SVGPathPen(glyph_set)
        glyph_set[name].draw(pen)
        d = pen.getCommands()
        advance = hmtx[name][0] * scale
        entries.append({"char": ch, "d": d, "advance": round(advance, 2), "x": cursor})

        nums = [float(n) for n in re.findall(r"-?\d+(?:\.\d+)?", d)]
        for i in range(0, len(nums) - 1, 2):
            min_x = min(min_x, nums[i] + cursor)
            max_x = max(max_x, nums[i] + cursor)
            min_y = min(min_y, nums[i + 1])
            max_y = max(max_y, nums[i + 1])
        cursor += advance

    # SVG 里字形要套 scale(1,-1),所以字体的 y 上界变成 SVG 的 y 下界
    pad = 24
    vb_x = round(min_x - pad, 1)
    vb_y = round(-max_y - pad, 1)
    vb_w = round(max_x - min_x + pad * 2, 1)
    vb_h = round(max_y - min_y + pad * 2, 1)

    body = ",\n".join(
        "  {\n"
        f'    char: "{e["char"]}",\n'
        f'    x: {e["x"]},\n'
        f'    advance: {e["advance"]},\n'
        f'    d: "{e["d"]}",\n'
        "  }"
        for e in entries
    )

    OUT_PATHS.write_text(
        "// 本文件由 scripts/build-fonts.py 生成,请勿手改。\n"
        "// 「红色足迹」四字取自马善政毛笔楷书(OFL)。坐标是字体设计坐标系\n"
        f"// (y 轴向上、em = {EM}),在 SVG 里每个字形要套\n"
        '// transform="translate(x, 0) scale(1, -1)"。\n\n'
        "export interface LogotypeGlyph {\n"
        "  char: string;\n"
        "  /** 该字在行内的横向起点(em 单位) */\n"
        "  x: number;\n"
        "  /** 字符前进宽度(em 单位) */\n"
        "  advance: number;\n"
        "  /** 轮廓路径,y 轴向上 */\n"
        "  d: string;\n"
        "}\n\n"
        f"export const LOGOTYPE_EM = {EM};\n\n"
        "/** 已按翻转后的 SVG 坐标算好的 viewBox,含 24 单位留白 */\n"
        f'export const LOGOTYPE_VIEWBOX = "{vb_x} {vb_y} {vb_w} {vb_h}";\n\n'
        f"export const LOGOTYPE_GLYPHS: LogotypeGlyph[] = [\n{body},\n];\n",
        encoding="utf-8",
    )
    total = sum(len(e["d"]) for e in entries)
    print(
        f"[fonts] {OUT_PATHS.name}: {len(entries)} 字 / "
        f"viewBox {vb_x} {vb_y} {vb_w} {vb_h} / path 数据 {total / 1024:.1f} KB"
    )


def stage_lxgw() -> None:
    """把霞鹜文楷 GB 屏显版的分包搬到 public/fonts/lxgw/,并把 url() 改成绝对路径。"""
    files_out = LXGW_OUT / "files"
    files_out.mkdir(parents=True, exist_ok=True)

    css = LXGW_CSS.read_text(encoding="utf-8")
    used = set(re.findall(r"url\('\./files/([^']+)'\)", css))
    for name in used:
        shutil.copyfile(LXGW_PKG / "files" / name, files_out / name)

    # Keep relative urls so GitHub project Pages (/<repo>/) resolves fonts.
    (LXGW_OUT / "lxgw-wenkai-screen.css").write_text(css, encoding="utf-8")
    shutil.copyfile(LXGW_PKG / "OFL.txt", LXGW_OUT / "OFL.txt")

    mb = sum((files_out / n).stat().st_size for n in used) / 1024 / 1024
    print(f"[fonts] public/fonts/lxgw: {len(used)} 片分包 / {mb:.2f} MB(按需取用)")


if __name__ == "__main__":
    if not SOURCE.exists():
        raise SystemExit(f"找不到字体源,先跑 npm i: {SOURCE}")
    subset(collect_chars())
    extract_logotype()
    stage_lxgw()
