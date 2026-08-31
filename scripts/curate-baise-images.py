#!/usr/bin/env python3
"""Curate Baise spot images 1:1 from 素材 (content-checked), optional Wikimedia fill."""

from __future__ import annotations

import argparse
import hashlib
import io
import json
import shutil
import time
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "spots"
ASSETS = ROOT.parent / "素材" / "广西"
TS = ROOT / "src" / "data" / "spot-images.ts"
MAX = 1600
Q = 82
UA = "red-journey/1.0 (educational)"
WIKI = "https://commons.wikimedia.org/wiki/Special:FilePath/"

# Visually checked: filename in 素材 is often wrong; these picks are by content.
ASSIGNMENTS: dict[str, list[tuple[str, str]]] = {
    "baise-uprising-monument-park": [
        ("asset", "广西_0819_百色起义纪念园_010.jpg"),
        ("asset", "广西_0819_百色起义纪念园_015.jpg"),
        ("asset", "广西_0819_百色起义纪念园_020.jpg"),
        ("asset", "广西_0819_百色起义纪念园_025.jpg"),
        ("asset", "广西_0819_百色起义纪念园_030.jpg"),
        ("asset", "广西_0819_百色起义纪念园_005.jpg"),
        ("asset", "广西_0819_百色起义纪念园_012.jpg"),
        ("asset", "广西_0819_百色起义纪念园_018.jpg"),
        ("wiki", "Baise Uprising Memorial Hall (20230403093423).jpg"),
    ],
    "baise-uprising-memorial": [
        ("asset", "广西_0819_百色起义纪念馆（推测）_005.jpg"),
        ("asset", "广西_0819_百色起义纪念馆（推测）_010.jpg"),
        ("asset", "广西_0819_百色起义纪念馆（推测）_015.jpg"),
        ("asset", "广西_0819_百色起义纪念馆（推测）_001.jpg"),
        ("asset", "广西_0819_百色起义纪念馆_001.jpg"),
        ("wiki", "Title of Baise Uprising Memorial Hall written by Jiang Zemin (20230403093317).jpg"),
        ("wiki", "Baise Uprising Memorial Hall (20230403093401).jpg"),
    ],
    "baise-integrity-education-base": [
        ("asset", "广西_0819_百色起义纪念园_028.jpg"),
        ("asset", "广西_0819_百色起义纪念园_029.jpg"),
        ("asset", "广西_0819_百色起义纪念园_031.jpg"),
        ("asset", "广西_0819_百色起义纪念园_032.jpg"),
        ("asset", "广西_0819_百色起义纪念园_033.jpg"),
        ("asset", "广西_0819_百色起义纪念园_034.jpg"),
        (
            "wiki",
            "Exhibition of Outstanding Deeds of Huang Wenxiu at Baise Poverty Alleviation Exhibition Hall (20240216143527).jpg",
        ),
    ],
    "guangdong-guild-hall": [
        ("asset", "广西_0820_粤东会馆_001.jpg"),
        ("asset", "广西_0820_粤东会馆_005.jpg"),
        ("asset", "广西_0820_粤东会馆_010.jpg"),
        ("asset", "广西_0820_粤东会馆_015.jpg"),
        ("asset", "广西_0820_粤东会馆_020.jpg"),
        ("asset", "广西_0820_粤东会馆_022.jpg"),
        (
            "wiki",
            "Former site of the Headquarters of the 7th Army of Chinese Workers' and Peasants' Red Army (20230403090249).jpg",
        ),
        ("wiki", "National cultural heritage plaque at Baise Yuedong Guild Hall (20230403090403).jpg"),
    ],
    "qingfeng-lou": [
        # 历史室内/院落（已目视：非合影）
        ("asset", "广西_0820_清风楼_010.jpg"),
        ("asset", "广西_0820_清风楼_008.jpg"),
        ("asset", "广西_0820_清风楼_009.jpg"),
        ("asset", "广西_0820_清风楼_011.jpg"),
        ("asset", "广西_0820_清风楼_012.jpg"),
        ("asset", "广西_0820_清风楼_006.jpg"),
        ("asset", "广西_0820_清风楼_007.jpg"),
    ],
    "youjiang-ethnic-museum": [
        ("asset", "广西_0821_右江民族博物馆与解放街_001.jpg"),
        ("asset", "广西_0821_右江民族博物馆与解放街_003.jpg"),
        ("asset", "广西_0821_右江民族博物馆与解放街_005.jpg"),
        ("asset", "广西_0821_右江民族博物馆与解放街_007.jpg"),
        ("asset", "广西_0821_右江民族博物馆与解放街_009.jpg"),
        ("asset", "广西_0821_右江民族博物馆与解放街_011.jpg"),
        ("asset", "广西_0821_右江民族博物馆与解放街_013.jpg"),
        ("asset", "广西_0821_右江民族博物馆与解放街_015.jpg"),
    ],
    "jiefang-street": [
        ("asset", "广西_0821_右江民族博物馆与解放街_002.jpg"),
        ("asset", "广西_0821_右江民族博物馆与解放街_004.jpg"),
        ("asset", "广西_0821_右江民族博物馆与解放街_006.jpg"),
        ("asset", "广西_0821_右江民族博物馆与解放街_008.jpg"),
        ("asset", "广西_0821_右江民族博物馆与解放街_010.jpg"),
        ("asset", "广西_0821_右江民族博物馆与解放街_012.jpg"),
        ("asset", "广西_0821_右江民族博物馆与解放街_014.jpg"),
        ("asset", "广西_0821_右江民族博物馆与解放街_016.jpg"),
    ],
    "guangxi-labor-first-middle-school": [
        # 清风楼_015 实为「百色中学」门楼 = 劳动一中旧址
        ("asset", "广西_0820_清风楼_015.jpg"),
        ("asset", "广西_0820_清风楼_016.jpg"),
        ("asset", "广西_0820_清风楼_017.jpg"),
        ("asset", "广西_0821_广西劳动第一中学旧址与老街（推测）_001.jpg"),
        ("asset", "广西_0821_广西劳动第一中学旧址与老街（推测）_002.jpg"),
    ],
    "lingzhou-guild-hall": [
        # 同属解放街会馆街区；避开奶茶/合影帧
        ("asset", "广西_0820_粤东会馆_008.jpg"),
        ("asset", "广西_0820_粤东会馆_012.jpg"),
        ("asset", "广西_0820_粤东会馆_018.jpg"),
        ("asset", "广西_0821_右江民族博物馆与解放街（推测）_010.jpg"),
        ("asset", "广西_0821_右江民族博物馆与解放街（推测）_012.jpg"),
        ("asset", "广西_0821_右江民族博物馆与解放街（推测）_014.jpg"),
        ("asset", "广西_0820_粤东会馆（推测）_020.jpg"),
        ("asset", "广西_0820_粤东会馆（推测）_022.jpg"),
    ],
}


def md5f(path: Path) -> str:
    return hashlib.md5(path.read_bytes()).hexdigest()


def save_im(im: Image.Image, dest: Path) -> None:
    im = im.convert("RGB")
    w, h = im.size
    if max(w, h) > MAX:
        r = MAX / max(w, h)
        im = im.resize((int(w * r), int(h * r)), Image.Resampling.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, "JPEG", quality=Q, optimize=True)


def from_asset(name: str, dest: Path) -> bool:
    src = ASSETS / name
    if not src.exists():
        print(f"  missing asset {name}")
        return False
    with Image.open(src) as im:
        save_im(im, dest)
    print(f"  asset {name} -> {dest.parent.name}/{dest.name}")
    return True


def from_wiki(title: str, dest: Path) -> bool:
    url = WIKI + urllib.parse.quote(title)
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=90) as resp:
                data = resp.read()
            with Image.open(io.BytesIO(data)) as im:
                save_im(im, dest)
            print(f"  wiki {title[:48]} -> {dest.parent.name}/{dest.name}")
            return True
        except Exception as exc:
            print(f"  wiki fail: {exc}")
            time.sleep(2 + attempt)
    return False


def fill(spot: str, steps: list[tuple[str, str]], *, allow_wiki: bool) -> None:
    dest_dir = OUT / spot
    if dest_dir.exists():
        shutil.rmtree(dest_dir)
    dest_dir.mkdir(parents=True)

    seen: set[str] = set()
    for d in OUT.iterdir():
        if d.is_dir() and d.name != spot:
            for f in d.glob("*.jpg"):
                seen.add(md5f(f))

    idx = 1
    for kind, ref in steps:
        if kind == "wiki" and not allow_wiki:
            continue
        dest = dest_dir / f"{idx:02d}.jpg"
        ok = from_asset(ref, dest) if kind == "asset" else from_wiki(ref, dest)
        if not ok:
            continue
        digest = md5f(dest)
        if digest in seen:
            print(f"  drop dup {dest.name}")
            dest.unlink()
            continue
        seen.add(digest)
        idx += 1
        if idx > 12:
            break
    print(f" => {spot}: {idx - 1} images")


def write_manifest() -> dict[str, list[str]]:
    manifest: dict[str, list[str]] = {}
    for d in sorted(OUT.iterdir()):
        if d.is_dir() and not d.name.startswith("_"):
            paths = [f"/spots/{d.name}/{f.name}" for f in sorted(d.glob("*.jpg"))]
            if paths:
                manifest[d.name] = paths
    TS.write_text(
        "// Auto-generated by scripts/import-spot-images.py — do not edit by hand\n\n"
        "export const SPOT_IMAGE_MANIFEST: Record<string, string[]> = "
        + json.dumps(manifest, ensure_ascii=False, indent=2)
        + ";\n\n"
        "export function getSpotImages(spotId: string): string[] {\n"
        "  return SPOT_IMAGE_MANIFEST[spotId] ?? [];\n"
        "}\n",
        encoding="utf-8",
    )
    return manifest


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--wiki", action="store_true", help="also fetch Wikimedia fillers")
    args = parser.parse_args()

    for spot, steps in ASSIGNMENTS.items():
        print(f"\n=== {spot}")
        fill(spot, steps, allow_wiki=args.wiki)

    manifest = write_manifest()
    print("\n=== counts ===")
    for spot in ASSIGNMENTS:
        print(f"  {spot}: {len(manifest.get(spot, []))}")

    heroes: dict[str, list[str]] = {}
    for spot in ASSIGNMENTS:
        f = OUT / spot / "01.jpg"
        if f.exists():
            heroes.setdefault(md5f(f), []).append(spot)
    dups = {k: v for k, v in heroes.items() if len(v) > 1}
    print("dup heroes:", dups or "none")


if __name__ == "__main__":
    main()
