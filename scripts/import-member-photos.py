"""Import member portraits into public/team/avatars.

Place one file per member in scripts/seed/member-photos/ (or set RED_JOURNEY_MEMBER_PHOTOS):
  chen-yuxiao.jpg, liao-qi.png, ...
"""
from pathlib import Path

from PIL import Image

from _paths import ROOT, member_photos_dir

OUT = ROOT / "public" / "team" / "avatars"

MEMBER_IDS = [
    "chen-yuxiao",
    "liao-qi",
    "chen-jiarui",
    "an-taiyu",
    "cao-yuanke",
    "guo-yunbei",
    "lin-yi",
    "tang-yang",
    "xu-fulin",
    "zhang-ruiyang",
    "gao-qianya",
    "jian-shangyun",
    "sun-aiming",
    "wang-dandan",
    "wang-jindong",
]

ASPECT = 3 / 4
MAX_WIDTH = 800


def find_source(member_id: str, source_dir: Path) -> Path | None:
    for ext in (".jpg", ".jpeg", ".png", ".webp", ".heic"):
        candidate = source_dir / f"{member_id}{ext}"
        if candidate.exists():
            return candidate
    return None


def crop_portrait(img: Image.Image, focus_y: float = 0.0) -> Image.Image:
    """Portrait crop aligned to top so faces stay visible in full-body shots."""
    w, h = img.size
    if w / h > ASPECT:
        new_w = int(h * ASPECT)
        left = (w - new_w) // 2
        return img.crop((left, 0, left + new_w, h))
    new_h = int(w / ASPECT)
    if new_h >= h:
        return img
    top = int((h - new_h) * focus_y)
    return img.crop((0, top, w, top + new_h))


def save_avatar(src: Path, dest: Path) -> None:
    img = Image.open(src)
    if img.mode != "RGB":
        img = img.convert("RGB")
    cropped = crop_portrait(img, focus_y=0.0)
    if cropped.width > MAX_WIDTH:
        ratio = MAX_WIDTH / cropped.width
        cropped = cropped.resize(
            (MAX_WIDTH, int(cropped.height * ratio)),
            Image.Resampling.LANCZOS,
        )
    dest.parent.mkdir(parents=True, exist_ok=True)
    cropped.save(dest, "JPEG", quality=88, optimize=True)


def main() -> None:
    source_dir = member_photos_dir()
    if not source_dir.is_dir():
        raise SystemExit(
            f"Member photo folder not found: {source_dir}\n"
            "Create it and add {member-id}.jpg files, or set RED_JOURNEY_MEMBER_PHOTOS."
        )

    missing: list[str] = []
    for member_id in MEMBER_IDS:
        src = find_source(member_id, source_dir)
        if src is None:
            missing.append(member_id)
            continue
        dest = OUT / f"{member_id}.jpg"
        save_avatar(src, dest)
        print(f"OK {member_id} <- {src.name}")

    if missing:
        raise SystemExit(f"Missing sources for: {', '.join(missing)}")

    print("Done:", OUT)


if __name__ == "__main__":
    main()
