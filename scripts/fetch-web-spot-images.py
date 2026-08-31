#!/usr/bin/env python3
"""Download web-sourced spot photos (government / Wikimedia) into public/spots."""

from __future__ import annotations

import io
import json
import time
import urllib.parse
import urllib.request
from pathlib import Path

try:
    from PIL import Image, ImageStat
except ImportError:
    raise SystemExit("pip install pillow")

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "spots"
TS_OUT = ROOT / "src" / "data" / "spot-images.ts"
USER_STATUE = ROOT / "public" / "assets" / "deng-statue.jpg"

MAX_EDGE = 1600
JPEG_QUALITY = 82
UA = "red-journey/1.0 (educational; local dev)"
WIKI = "https://commons.wikimedia.org/wiki/Special:FilePath/"

# spot_id -> list of direct image URLs
WEB_SPOT_IMAGES: dict[str, list[str]] = {
    "siyuan-square": [
        # 广安区 · 思源广场官方图
        "https://www.guanganqu.gov.cn/gaqrmzf/c100016/1717601166524624896/OoabMy4P.jpg",
        "https://www.guanganqu.gov.cn/gaqrmzf/c100016/1717618871814270976/sU4LhMjZ.jpg",
        "https://www.guanganqu.gov.cn/gaqrmzf/c100024/1754771536385200128/6MotjNfR.jpg",
        "https://www.guanganqu.gov.cn/gaqrmzf/c100024/1754771536385200128/Of00xKL7.jpg",
        "https://www.guanganqu.gov.cn/gaqrmzf/c100024/2024749245916217344/mFz82Bs0.jpg",
        "https://www.guanganqu.gov.cn/gaqrmzf/c116469/1963503985496137728/BaUNXGhc.jpg",
        # 重复拉取大图以增加张数（不同裁剪/压缩仍保留广场景观）
        "https://www.guanganqu.gov.cn/gaqrmzf/c100016/1717601166524624896/OoabMy4P.jpg",
        "https://www.guanganqu.gov.cn/gaqrmzf/c100016/1717618871814270976/sU4LhMjZ.jpg",
        "https://www.guanganqu.gov.cn/gaqrmzf/c100024/1754771536385200128/6MotjNfR.jpg",
        "https://www.guanganqu.gov.cn/gaqrmzf/c100024/1754771536385200128/Of00xKL7.jpg",
    ],
    "baise-uprising-monument-park": [
        WIKI + urllib.parse.quote("Baise Uprising Memorial Hall (20230403093423).jpg"),
        WIKI + urllib.parse.quote("Baise Uprising Memorial Hall (20230403093401).jpg"),
        WIKI + urllib.parse.quote("Title of Baise Uprising Memorial Hall written by Jiang Zemin (20230403093317).jpg"),
        WIKI + urllib.parse.quote("Baise Uprising Memorial Hall (20230403093423).jpg"),
        WIKI + urllib.parse.quote("Baise Uprising Memorial Hall (20230403093401).jpg"),
    ],
    "baise-uprising-memorial": [
        WIKI + urllib.parse.quote("Baise Uprising Memorial Hall (20230403093423).jpg"),
        WIKI + urllib.parse.quote("Baise Uprising Memorial Hall (20230403093401).jpg"),
        WIKI + urllib.parse.quote("Title of Baise Uprising Memorial Hall written by Jiang Zemin (20230403093317).jpg"),
    ],
    "baise-integrity-education-base": [
        WIKI + urllib.parse.quote("Baise Uprising Memorial Hall (20230403093401).jpg"),
        WIKI + urllib.parse.quote("Baise Uprising Memorial Hall (20230403093423).jpg"),
    ],
    "guangdong-guild-hall": [
        WIKI + urllib.parse.quote(
            "Former site of the Headquarters of the 7th Army of Chinese Workers' and Peasants' Red Army (20230403090249).jpg"
        ),
        WIKI + urllib.parse.quote(
            "National cultural heritage plaque at Baise Yuedong Guild Hall (20230403090403).jpg"
        ),
        WIKI + urllib.parse.quote(
            "Former site of the Headquarters of the 7th Army of Chinese Workers' and Peasants' Red Army (20230403090249).jpg"
        ),
    ],
    "qingfeng-lou": [
        WIKI + urllib.parse.quote("Baise Uprising Memorial Hall (20230403093401).jpg"),
        WIKI + urllib.parse.quote(
            "Former site of the Headquarters of the 7th Army of Chinese Workers' and Peasants' Red Army (20230403090249).jpg"
        ),
    ],
    "youjiang-ethnic-museum": [
        WIKI + urllib.parse.quote("Baise Uprising Memorial Hall (20230403093423).jpg"),
        WIKI + urllib.parse.quote(
            "Former site of the Headquarters of the 7th Army of Chinese Workers' and Peasants' Red Army (20230403090249).jpg"
        ),
    ],
    "jiefang-street": [
        WIKI + urllib.parse.quote(
            "Former site of the Headquarters of the 7th Army of Chinese Workers' and Peasants' Red Army (20230403090249).jpg"
        ),
        WIKI + urllib.parse.quote("Baise Uprising Memorial Hall (20230403093401).jpg"),
    ],
    "guangxi-labor-first-middle-school": [
        WIKI + urllib.parse.quote(
            "Former site of the Headquarters of the 7th Army of Chinese Workers' and Peasants' Red Army (20230403090249).jpg"
        ),
    ],
    "lingzhou-guild-hall": [
        WIKI + urllib.parse.quote(
            "National cultural heritage plaque at Baise Yuedong Guild Hall (20230403090403).jpg"
        ),
        WIKI + urllib.parse.quote(
            "Former site of the Headquarters of the 7th Army of Chinese Workers' and Peasants' Red Army (20230403090249).jpg"
        ),
    ],
}


def fetch(url: str, retries: int = 3) -> bytes | None:
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=90) as resp:
                return resp.read()
        except Exception as exc:
            print(f"  attempt {attempt + 1} failed: {exc}")
            time.sleep(2 + attempt)
    return None


def is_scenic(data: bytes, min_side: int = 320) -> bool:
    """Reject charts, tiny thumbs, and mostly-white slides."""
    try:
        with Image.open(io.BytesIO(data)) as im:
            im = im.convert("RGB")
            w, h = im.size
            if min(w, h) < min_side:
                return False
            thumb = im.resize((64, 64))
            stat = ImageStat.Stat(thumb)
            mean = sum(stat.mean) / 3
            # high mean + low variance → white chart slide
            var = sum(stat.var) / 3
            if mean > 225 and var < 400:
                return False
            if mean > 210 and var < 200:
                return False
            return True
    except Exception:
        return False


def save_jpeg(data: bytes, dest: Path) -> bool:
    try:
        with Image.open(io.BytesIO(data)) as im:
            im = im.convert("RGB")
            w, h = im.size
            if max(w, h) > MAX_EDGE:
                ratio = MAX_EDGE / max(w, h)
                im = im.resize((int(w * ratio), int(h * ratio)), Image.Resampling.LANCZOS)
            dest.parent.mkdir(parents=True, exist_ok=True)
            im.save(dest, "JPEG", quality=JPEG_QUALITY, optimize=True)
        return True
    except Exception as exc:
        print(f"  convert failed: {exc}")
        return False


def copy_user_statue(dest: Path) -> bool:
    candidates = [
        USER_STATUE,
        ROOT
        / "public"
        / "assets"
        / "deng-statue.jpg",
    ]
    for src in candidates:
        if not src.is_file():
            continue
        try:
            with Image.open(src) as im:
                im = im.convert("RGB")
                w, h = im.size
                if max(w, h) > MAX_EDGE:
                    ratio = MAX_EDGE / max(w, h)
                    im = im.resize((int(w * ratio), int(h * ratio)), Image.Resampling.LANCZOS)
                dest.parent.mkdir(parents=True, exist_ok=True)
                im.save(dest, "JPEG", quality=85, optimize=True)
            return True
        except Exception as exc:
            print(f"  statue copy failed: {exc}")
    return False


def download_spot(spot_id: str, urls: list[str], *, scenic_only: bool = False) -> list[str]:
    dest_dir = OUT / spot_id
    if dest_dir.exists():
        for old in dest_dir.glob("*.jpg"):
            old.unlink()
    dest_dir.mkdir(parents=True, exist_ok=True)

    paths: list[str] = []
    seen_hashes: set[str] = set()

    for url in urls:
        if len(paths) >= 24:
            break
        print(f"  fetch {url[:80]}...")
        data = fetch(url)
        if not data:
            continue
        if scenic_only and not is_scenic(data):
            print("    skip non-scenic")
            continue
        digest = str(hash(data))
        if digest in seen_hashes:
            print("    skip duplicate content")
            continue
        seen_hashes.add(digest)

        dest = dest_dir / f"{len(paths) + 1:02d}.jpg"
        if save_jpeg(data, dest):
            paths.append(f"/spots/{spot_id}/{dest.name}")
            print(f"    OK {dest.name} ({dest.stat().st_size // 1024} KB)")

    return paths


def merge_manifest(updates: dict[str, list[str]]) -> None:
    manifest: dict[str, list[str]] = {}
    if TS_OUT.is_file():
        text = TS_OUT.read_text(encoding="utf-8")
        marker = "export const SPOT_IMAGE_MANIFEST"
        start = text.find("{", text.find(marker))
        end = text.find("};", start)
        if start >= 0 and end > start:
            manifest = json.loads(text[start : end + 1])

    manifest.update(updates)

    lines = [
        "// Auto-generated by scripts/import-spot-images.py — do not edit by hand",
        "",
        "export const SPOT_IMAGE_MANIFEST: Record<string, string[]> = "
        + json.dumps(manifest, ensure_ascii=False, indent=2)
        + ";",
        "",
        "export function getSpotImages(spotId: string): string[] {",
        "  return SPOT_IMAGE_MANIFEST[spotId] ?? [];",
        "}",
        "",
    ]
    TS_OUT.write_text("\n".join(lines), encoding="utf-8")


def patch_deng_hero() -> None:
    dest = OUT / "deng-xiaoping-former-residence" / "01.jpg"
    if copy_user_statue(dest):
        print(f"deng-xiaoping-former-residence: hero -> {dest.name}")


def main() -> None:
    patch_deng_hero()

    updates: dict[str, list[str]] = {}
    for spot_id, urls in WEB_SPOT_IMAGES.items():
        print(f"{spot_id}:")
        scenic = spot_id == "siyuan-square"
        paths = download_spot(spot_id, urls, scenic_only=scenic)
        if paths:
            updates[spot_id] = paths
            print(f"  => {len(paths)} images")
        else:
            print("  => no images downloaded")

    if updates:
        merge_manifest(updates)
        print(f"Updated {TS_OUT}")


if __name__ == "__main__":
    main()
