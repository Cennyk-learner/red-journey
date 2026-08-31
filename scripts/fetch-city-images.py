#!/usr/bin/env python3
"""Download CC-licensed city/scenery webp assets from Wikimedia Commons."""

from __future__ import annotations

import io
import time
import urllib.request
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    raise SystemExit("pip install pillow")

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "cities"

# CC BY-SA 4.0, author N509FZ — see docs/M6-handoff.md
DOWNLOADS: list[tuple[str, str]] = [
    (
        "cities/guangan/residence.webp",
        "https://commons.wikimedia.org/wiki/Special:FilePath/Former%20residence%20of%20Deng%20Xiaoping%20(20250115093513).jpg",
    ),
    (
        "cities/guangan/scenery.webp",
        "https://commons.wikimedia.org/wiki/Special:FilePath/%E5%B9%BF%E5%AE%89%E7%AB%99%2001.jpg",
    ),
    (
        "cities/guangan/museum.webp",
        "https://commons.wikimedia.org/wiki/Special:FilePath/Deng%20Xiaoping%20Former%20Residence%20Museum%20(20250115103920).jpg",
    ),
    (
        "cities/guangan/siyuan.webp",
        "https://www.guanganqu.gov.cn/gaqrmzf/c100016/1717601166524624896/OoabMy4P.jpg",
    ),
    (
        "cities/baise/memorial.webp",
        "https://commons.wikimedia.org/wiki/Special:FilePath/Baise%20Uprising%20Memorial%20Hall%20(20230403093423).jpg",
    ),
    (
        "cities/baise/scenery.webp",
        "https://commons.wikimedia.org/wiki/Special:FilePath/Baise%20Uprising%20Memorial%20Hall%20(20230403093423).jpg",
    ),
]

SPOT_DOWNLOADS: list[tuple[str, str]] = [
    (
        "spots/guangdong-guild-hall/01.webp",
        "https://commons.wikimedia.org/wiki/Special:FilePath/Former%20site%20of%20the%20Headquarters%20of%20the%207th%20Army%20of%20Chinese%20Workers%27%20and%20Peasants%27%20Red%20Army%20(20230403090249).jpg",
    ),
]


def fetch(url: str, retries: int = 3) -> bytes | None:
    for attempt in range(retries):
        try:
            req = urllib.request.Request(
                url,
                headers={"User-Agent": "red-journey/1.0 (educational; local dev)"},
            )
            with urllib.request.urlopen(req, timeout=60) as resp:
                return resp.read()
        except Exception as exc:
            print(f"  attempt {attempt + 1} failed: {exc}")
            time.sleep(2 + attempt)
    return None


def to_webp(data: bytes, dest: Path, max_edge: int = 1920) -> bool:
    try:
        with Image.open(io.BytesIO(data)) as im:
            im = im.convert("RGB")
            w, h = im.size
            if max(w, h) > max_edge:
                ratio = max_edge / max(w, h)
                im = im.resize((int(w * ratio), int(h * ratio)), Image.Resampling.LANCZOS)
            dest.parent.mkdir(parents=True, exist_ok=True)
            im.save(dest, "WEBP", quality=82, method=6)
        return True
    except Exception as exc:
        print(f"  convert failed: {exc}")
        return False


def main() -> None:
    for rel, url in DOWNLOADS + SPOT_DOWNLOADS:
        dest = ROOT / "public" / rel
        print(f"Fetching {rel}...")
        data = fetch(url)
        if not data:
            print(f"  SKIP {rel}")
            continue
        if to_webp(data, dest):
            print(f"  OK {dest.relative_to(ROOT)} ({dest.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
