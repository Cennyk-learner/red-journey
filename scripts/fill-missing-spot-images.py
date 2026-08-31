#!/usr/bin/env python3
"""Fill spots missing from 素材 without cross-spot duplicate content.

Moves unused frames from overstocked folders (not copies), then web-fills the rest.
"""

from __future__ import annotations

import hashlib
import io
import json
import shutil
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
ASSETS = ROOT.parent / "素材" / "广西"
MAX_EDGE = 1600
JPEG_Q = 82
UA = "red-journey/1.0 (educational)"
WIKI = "https://commons.wikimedia.org/wiki/Special:FilePath/"


def md5(path: Path) -> str:
    return hashlib.md5(path.read_bytes()).hexdigest()


def save_jpeg(data: bytes, dest: Path) -> bool:
    try:
        with Image.open(io.BytesIO(data)) as im:
            im = im.convert("RGB")
            w, h = im.size
            if max(w, h) > MAX_EDGE:
                r = MAX_EDGE / max(w, h)
                im = im.resize((int(w * r), int(h * r)), Image.Resampling.LANCZOS)
            dest.parent.mkdir(parents=True, exist_ok=True)
            im.save(dest, "JPEG", quality=JPEG_Q, optimize=True)
        return True
    except Exception as e:
        print(f"  save fail: {e}")
        return False


def fetch(url: str) -> bytes | None:
    for i in range(3):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=90) as r:
                return r.read()
        except Exception as e:
            print(f"  fetch: {e}")
            time.sleep(2 + i)
    return None


def is_scenic(data: bytes) -> bool:
    try:
        with Image.open(io.BytesIO(data)) as im:
            im = im.convert("RGB")
            if min(im.size) < 320:
                return False
            t = im.resize((64, 64))
            st = ImageStat.Stat(t)
            mean = sum(st.mean) / 3
            var = sum(st.var) / 3
            return not (mean > 225 and var < 400)
    except Exception:
        return False


def renumber(spot_id: str) -> list[str]:
    d = OUT / spot_id
    d.mkdir(parents=True, exist_ok=True)
    files = sorted(d.glob("*.jpg"))
    tmp = []
    for i, f in enumerate(files, 1):
        t = d / f"_r{i:02d}.jpg"
        f.rename(t)
        tmp.append(t)
    paths = []
    for i, t in enumerate(tmp, 1):
        final = d / f"{i:02d}.jpg"
        t.rename(final)
        paths.append(f"/spots/{spot_id}/{final.name}")
    return paths


def move_tail(src_id: str, dest_id: str, keep_src: int, take: int) -> None:
    """Move last images from src to dest so content is not duplicated."""
    src = OUT / src_id
    dest = OUT / dest_id
    dest.mkdir(parents=True, exist_ok=True)
    files = sorted(src.glob("*.jpg"))
    movers = files[keep_src : keep_src + take]
    for f in movers:
        target = dest / f"m_{f.name}"
        shutil.move(str(f), str(target))
        print(f"  move {src_id}/{f.name} -> {dest_id}")
    renumber(src_id)
    renumber(dest_id)


def import_extra_assets(pattern: str, spot_id: str, skip_first: int, limit: int) -> None:
    """Import remaining 素材 files matching pattern that were beyond MAX_PER_SPOT."""
    dest = OUT / spot_id
    dest.mkdir(parents=True, exist_ok=True)
    # Avoid any bytes already used by any spot
    existing: set[str] = set()
    for d in OUT.iterdir() if OUT.exists() else []:
        if d.is_dir():
            for f in d.glob("*.jpg"):
                existing.add(md5(f))
    matches = sorted(
        [f for f in ASSETS.glob("*.jpg") if pattern in f.name],
        key=lambda p: (1 if "推测" in p.name else 0, p.name),
    )
    candidates = matches[skip_first:]
    n = len(list(dest.glob("*.jpg")))
    added = 0
    for src in candidates:
        if added >= limit:
            break
        try:
            with Image.open(src) as im:
                im = im.convert("RGB")
                w, h = im.size
                if max(w, h) > MAX_EDGE:
                    r = MAX_EDGE / max(w, h)
                    im = im.resize((int(w * r), int(h * r)), Image.Resampling.LANCZOS)
                buf = io.BytesIO()
                im.save(buf, "JPEG", quality=JPEG_Q)
                data = buf.getvalue()
            digest = hashlib.md5(data).hexdigest()
            if digest in existing:
                continue
            n += 1
            added += 1
            out = dest / f"x{n:02d}.jpg"
            out.write_bytes(data)
            existing.add(digest)
            print(f"  asset {src.name} -> {spot_id}")
        except Exception as e:
            print(f"  skip {src.name}: {e}")
    renumber(spot_id)


def download_list(spot_id: str, urls: list[str], scenic: bool = False) -> None:
    dest = OUT / spot_id
    dest.mkdir(parents=True, exist_ok=True)
    existing = {md5(f) for f in dest.glob("*.jpg")}
    n = len(list(dest.glob("*.jpg")))
    for url in urls:
        if n >= 8:
            break
        print(f"  web {url[-50:]}...")
        data = fetch(url)
        if not data:
            continue
        if scenic and not is_scenic(data):
            print("    non-scenic")
            continue
        digest = hashlib.md5(data).hexdigest()
        if digest in existing:
            print("    dup")
            continue
        n += 1
        if save_jpeg(data, dest / f"w{n:02d}.jpg"):
            existing.add(digest)
            print(f"    OK")
        time.sleep(0.6)
    renumber(spot_id)


def write_manifest() -> dict[str, list[str]]:
    manifest = {}
    for d in sorted(OUT.iterdir()):
        if d.is_dir():
            paths = [f"/spots/{d.name}/{f.name}" for f in sorted(d.glob("*.jpg"))]
            if paths:
                manifest[d.name] = paths
    TS_OUT.write_text(
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


def verify_baise() -> None:
    baise = [
        "baise-uprising-monument-park",
        "baise-uprising-memorial",
        "baise-integrity-education-base",
        "guangdong-guild-hall",
        "qingfeng-lou",
        "youjiang-ethnic-museum",
        "jiefang-street",
        "guangxi-labor-first-middle-school",
        "lingzhou-guild-hall",
    ]
    print("\n=== counts & hero uniqueness ===")
    heroes: dict[str, list[str]] = {}
    all_hashes: dict[str, list[str]] = {}
    for s in baise:
        files = sorted((OUT / s).glob("*.jpg")) if (OUT / s).exists() else []
        print(f"  {s}: {len(files)}")
        for f in files:
            h = md5(f)
            all_hashes.setdefault(h, []).append(f"{s}/{f.name}")
            if f.name == "01.jpg":
                heroes.setdefault(h, []).append(s)
    bad_h = {k: v for k, v in heroes.items() if len(v) > 1}
    shared = {k: v for k, v in all_hashes.items() if len(v) > 1}
    if bad_h:
        print("FAIL duplicate 01.jpg:", bad_h)
    else:
        print("OK distinct 01.jpg per spot")
    if shared:
        print(f"WARN {len(shared)} shared hashes across spots")
        for v in list(shared.values())[:5]:
            print(" ", v)
    else:
        print("OK no shared image bytes across Baise spots")


def main() -> None:
    # 廉政：纪念园素材里未用满的后半段（主 import 只取了 24 张，素材有 64）
    print("baise-integrity-education-base:")
    import_extra_assets("百色起义纪念园", "baise-integrity-education-base", 24, 8)

    # 灵洲：解放街素材未用满的后半（主 import 解放街 16 张，素材约 32）
    print("lingzhou-guild-hall:")
    import_extra_assets("右江民族博物馆与解放街", "lingzhou-guild-hall", 16, 8)

    # 劳动一中：补素材里带劳动的，再 web
    print("guangxi-labor-first-middle-school:")
    import_extra_assets("劳动第一中学", "guangxi-labor-first-middle-school", 0, 4)
    download_list(
        "guangxi-labor-first-middle-school",
        [
            WIKI
            + urllib.parse.quote(
                "Former site of the Headquarters of the 7th Army of Chinese Workers' and Peasants' Red Army (20230403090249).jpg"
            ),
        ],
    )

    # 若灵洲仍不足，从粤东会馆未用素材取传统会馆建筑（粤东/灵洲同属解放街会馆群）
    lz = OUT / "lingzhou-guild-hall"
    if len(list(lz.glob("*.jpg"))) < 3:
        print("lingzhou: extra from 粤东会馆 unused assets")
        import_extra_assets("粤东会馆", "lingzhou-guild-hall", 24, 6)

    # 思源广场
    print("siyuan-square:")
    download_list(
        "siyuan-square",
        [
            "https://www.guanganqu.gov.cn/gaqrmzf/c100016/1717601166524624896/OoabMy4P.jpg",
            "https://www.guanganqu.gov.cn/gaqrmzf/c100016/1717618871814270976/sU4LhMjZ.jpg",
            "https://www.guanganqu.gov.cn/gaqrmzf/c100024/1754771536385200128/6MotjNfR.jpg",
            "https://www.guanganqu.gov.cn/gaqrmzf/c100024/1754771536385200128/Of00xKL7.jpg",
            "https://www.guanganqu.gov.cn/gaqrmzf/c100024/2024749245916217344/mFz82Bs0.jpg",
            "https://www.guanganqu.gov.cn/gaqrmzf/c116469/1963503985496137728/BaUNXGhc.jpg",
        ],
        scenic=True,
    )

    # Ensure deng statue is 01
    statue = ROOT / "public" / "assets" / "deng-statue.jpg"
    deng = OUT / "deng-xiaoping-former-residence"
    if statue.is_file() and deng.is_dir():
        files = sorted(deng.glob("*.jpg"))
        # write statue as temp then renumber with statue first
        tmp_dir = deng / "_keep"
        tmp_dir.mkdir(exist_ok=True)
        for f in files:
            shutil.move(str(f), str(tmp_dir / f.name))
        with Image.open(statue) as im:
            im.convert("RGB").save(deng / "01.jpg", "JPEG", quality=85)
        i = 2
        for f in sorted(tmp_dir.glob("*.jpg")):
            if i > 24:
                f.unlink()
                continue
            # skip if same as statue
            if md5(f) == md5(deng / "01.jpg"):
                f.unlink()
                continue
            shutil.move(str(f), str(deng / f"{i:02d}.jpg"))
            i += 1
        shutil.rmtree(tmp_dir, ignore_errors=True)
        print("deng: statue pinned as 01.jpg")

    write_manifest()
    verify_baise()


if __name__ == "__main__":
    main()
