"""Prepare team page assets: copy group photos and crop avatars from group shots.

Raw group photos live outside the repo. Set RED_JOURNEY_ASSETS to your local 素材 folder
(default: ../素材 relative to red-journey).
"""
from pathlib import Path
from PIL import Image

from _paths import ROOT, assets_dir

ASSETS = assets_dir()
OUT = ROOT / "public" / "team"
AVATARS = OUT / "avatars"

GUANGAN_GROUP_SRC = ASSETS / "四川" / "3088313e15590a4341cf144a53946e86.jpg"
# Baise group: banner photo at memorial — pick a mid-size wide group shot
BAISE_GROUP_SRC = ASSETS / "广西" / "image_1787206062235.jpg"

# Crop boxes: (left%, top%, right%, bottom%) of image width/height
GUANGAN_CROPS = {
    "guo-yunbei": (0.02, 0.08, 0.11, 0.92),
    "zhang-ruiyang": (0.09, 0.08, 0.20, 0.92),
    "cao-yuanke": (0.18, 0.08, 0.29, 0.92),
    "chen-jiarui": (0.27, 0.08, 0.38, 0.92),
    "chen-yuxiao": (0.36, 0.08, 0.47, 0.92),
    "lin-yi": (0.45, 0.08, 0.56, 0.92),
    "tang-yang": (0.54, 0.08, 0.65, 0.92),
    "xu-fulin": (0.63, 0.08, 0.74, 0.92),
    "an-taiyu": (0.72, 0.08, 0.83, 0.92),
}

BAISE_CROPS = {
    "jian-shangyun": (0.02, 0.10, 0.14, 0.90),
    "wang-dandan": (0.12, 0.10, 0.24, 0.90),
    "gao-qianya": (0.22, 0.10, 0.34, 0.90),
    "sun-aiming": (0.32, 0.10, 0.44, 0.90),
    "wang-jindong": (0.42, 0.10, 0.54, 0.90),
    "lin-yi": (0.52, 0.10, 0.64, 0.90),
    "liao-qi": (0.62, 0.10, 0.74, 0.90),
    "xu-fulin": (0.72, 0.10, 0.84, 0.90),
}


def crop_person(img: Image.Image, box: tuple[float, float, float, float], max_w: int = 900) -> Image.Image:
    w, h = img.size
    left = int(box[0] * w)
    top = int(box[1] * h)
    right = int(box[2] * w)
    bottom = int(box[3] * h)
    cropped = img.crop((left, top, right, bottom))
    if cropped.width > max_w:
        ratio = max_w / cropped.width
        cropped = cropped.resize((max_w, int(cropped.height * ratio)), Image.Resampling.LANCZOS)
    return cropped


def save_jpg(img: Image.Image, path: Path, quality: int = 88) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if img.mode != "RGB":
        img = img.convert("RGB")
    img.save(path, "JPEG", quality=quality, optimize=True)


def copy_group(src: Path, dest: Path, max_w: int = 1920) -> None:
    if not src.exists():
        print(f"SKIP missing: {src}")
        return
    img = Image.open(src)
    if img.width > max_w:
        ratio = max_w / img.width
        img = img.resize((max_w, int(img.height * ratio)), Image.Resampling.LANCZOS)
    save_jpg(img, dest)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    AVATARS.mkdir(parents=True, exist_ok=True)

    copy_group(GUANGAN_GROUP_SRC, OUT / "guangan-group.jpg")
    copy_group(BAISE_GROUP_SRC, OUT / "baise-group.jpg", max_w=1600)

    if GUANGAN_GROUP_SRC.exists():
        g_img = Image.open(GUANGAN_GROUP_SRC)
        for name, box in GUANGAN_CROPS.items():
            save_jpg(crop_person(g_img, box), AVATARS / f"{name}.jpg")

    if BAISE_GROUP_SRC.exists():
        b_img = Image.open(BAISE_GROUP_SRC)
        for name, box in BAISE_CROPS.items():
            dest = AVATARS / f"{name}.jpg"
            if name in ("lin-yi", "xu-fulin") and dest.exists():
                continue  # prefer guangan crop if already exists
            save_jpg(crop_person(b_img, box), dest)

    # Hero poster from guangan group
    if (OUT / "guangan-group.jpg").exists():
        poster = Image.open(OUT / "guangan-group.jpg")
        poster = poster.resize((1920, int(1920 * poster.height / poster.width)), Image.Resampling.LANCZOS)
        save_jpg(poster, OUT / "hero-poster.jpg", quality=85)

    print("Done:", OUT)


if __name__ == "__main__":
    main()
