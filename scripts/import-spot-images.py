#!/usr/bin/env python3
"""Import field photos from 素材 into public/spots and generate spot-images.ts."""

from __future__ import annotations

import json
import re
import shutil
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    raise SystemExit("pip install pillow")

try:
    import pillow_heif

    pillow_heif.register_heif_opener()
    HAS_HEIF = True
except ImportError:
    HAS_HEIF = False

from _paths import ROOT, assets_dir

ASSETS = assets_dir()
OUT = ROOT / "public" / "spots"
TS_OUT = ROOT / "src" / "data" / "spot-images.ts"

MAX_PER_SPOT = 24
MAX_EDGE = 1600
JPEG_QUALITY = 82

# Filename keyword → spot id (first match wins)
PATTERNS: list[tuple[str, list[str]]] = [
    ("deng-xiaoping-former-residence", ["邓小平故里"]),
    ("siyuan-square", ["思源广场"]),
    ("intangible-heritage-experience", ["非遗文化体验馆", "非遗体验馆"]),
    ("guangan-museum", ["广安市博物馆", "博物馆"]),
    ("baise-uprising-monument-park", ["百色起义纪念园"]),
    ("baise-uprising-memorial", ["百色起义纪念馆"]),
    ("baise-integrity-education-base", ["廉政教育基地", "廉政教育"]),
    ("guangdong-guild-hall", ["粤东会馆"]),
    ("qingfeng-lou", ["清风楼"]),
    ("youjiang-ethnic-museum", ["右江民族博物馆"]),
    ("jiefang-street", ["解放街"]),
    ("guangxi-labor-first-middle-school", ["劳动第一中学", "劳动一中"]),
    ("lingzhou-guild-hall", ["灵洲会馆", "灵州会馆"]),
]

# Combined folder: split by index
SPLIT_RULES: dict[str, tuple[str, str]] = {
    "右江民族博物馆与解放街": ("youjiang-ethnic-museum", "jiefang-street"),
    "劳动第一中学旧址与老街": (
        "guangxi-labor-first-middle-school",
        "jiefang-street",
    ),
}


def classify(name: str) -> str | None:
    for combined, (a, b) in SPLIT_RULES.items():
        if combined in name:
            m = re.search(r"_(\d+)\.(jpg|jpeg|heic)$", name, re.I)
            idx = int(m.group(1)) if m else 0
            return a if idx % 2 == 1 else b
    for spot_id, keys in PATTERNS:
        for k in keys:
            if k in name:
                return spot_id
    return None


def save_image(src: Path, dest: Path) -> bool:
    dest.parent.mkdir(parents=True, exist_ok=True)
    ext = src.suffix.lower()
    if ext == ".heic" and not HAS_HEIF:
        return False
    try:
        with Image.open(src) as im:
            im = im.convert("RGB")
            w, h = im.size
            if max(w, h) > MAX_EDGE:
                ratio = MAX_EDGE / max(w, h)
                im = im.resize((int(w * ratio), int(h * ratio)), Image.Resampling.LANCZOS)
            im.save(dest, "JPEG", quality=JPEG_QUALITY, optimize=True)
        return True
    except Exception as e:
        print(f"  skip {src.name}: {e}")
        return False


def main() -> None:
    buckets: dict[str, list[Path]] = {p[0]: [] for p in PATTERNS}

    for folder in ["四川", "广西"]:
        base = ASSETS / folder
        if not base.is_dir():
            continue
        for f in sorted(base.iterdir()):
            if f.suffix.lower() not in (".jpg", ".jpeg", ".heic"):
                continue
            spot = classify(f.name)
            if spot and len(buckets[spot]) < MAX_PER_SPOT:
                buckets[spot].append(f)

    manifest: dict[str, list[str]] = {}
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)

    for spot_id, files in buckets.items():
        paths: list[str] = []
        for i, src in enumerate(files, start=1):
            dest = OUT / spot_id / f"{i:02d}.jpg"
            if save_image(src, dest):
                paths.append(f"/spots/{spot_id}/{i:02d}.jpg")
        if paths:
            manifest[spot_id] = paths
            print(f"{spot_id}: {len(paths)} images")

    def copy_subset(
        from_id: str,
        to_id: str,
        start: int = 0,
        count: int = 12,
        replace: bool = False,
    ) -> None:
        src_paths = manifest.get(from_id, [])
        if not src_paths:
            return
        if manifest.get(to_id) and not replace:
            return
        picked = src_paths[start : start + count]
        if (OUT / to_id).exists():
            shutil.rmtree(OUT / to_id)
        manifest[to_id] = []
        dest_dir = OUT / to_id
        dest_dir.mkdir(parents=True, exist_ok=True)
        for i, url in enumerate(picked, start=1):
            src_file = ROOT / "public" / url.lstrip("/")
            dest_file = dest_dir / f"{i:02d}.jpg"
            if src_file.exists():
                shutil.copy2(src_file, dest_file)
                manifest[to_id].append(f"/spots/{to_id}/{i:02d}.jpg")
        if manifest[to_id]:
            print(f"{to_id}: {len(manifest[to_id])} images (from {from_id})")

    if not manifest.get("baise-integrity-education-base"):
        copy_subset("baise-uprising-memorial", "baise-integrity-education-base", 8, 12)
    if not manifest.get("lingzhou-guild-hall"):
        copy_subset("jiefang-street", "lingzhou-guild-hall", 0, 16)
    if len(manifest.get("guangxi-labor-first-middle-school", [])) < 8:
        copy_subset(
            "youjiang-ethnic-museum",
            "guangxi-labor-first-middle-school",
            0,
            12,
            replace=True,
        )

    def seed_scenic(spot_id: str, webp_rel: str, count: int = 6) -> None:
        if manifest.get(spot_id):
            return
        src_webp = ROOT / "public" / webp_rel.lstrip("/")
        if not src_webp.is_file():
            return
        dest_dir = OUT / spot_id
        dest_dir.mkdir(parents=True, exist_ok=True)
        paths: list[str] = []
        for i in range(1, count + 1):
            dest = dest_dir / f"{i:02d}.jpg"
            try:
                with Image.open(src_webp) as im:
                    im = im.convert("RGB")
                    im.save(dest, "JPEG", quality=82, optimize=True)
                paths.append(f"/spots/{spot_id}/{i:02d}.jpg")
            except Exception as exc:
                print(f"  seed {spot_id} skip: {exc}")
                break
        if paths:
            manifest[spot_id] = paths
            print(f"{spot_id}: {len(paths)} scenic images (from {webp_rel})")

    # siyuan-square: run scripts/fetch-web-spot-images.py after import

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
    print(f"Written {TS_OUT}")


if __name__ == "__main__":
    main()
