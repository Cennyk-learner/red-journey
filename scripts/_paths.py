"""Shared path helpers — no machine-specific paths in repo scripts."""

from __future__ import annotations

import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def assets_dir() -> Path:
    """Local raw photo folder (outside repo). Override with RED_JOURNEY_ASSETS."""
    return Path(os.environ.get("RED_JOURNEY_ASSETS", str(ROOT.parent / "素材")))


def member_photos_dir() -> Path:
    """Per-member portrait sources for import-member-photos.py."""
    return Path(
        os.environ.get(
            "RED_JOURNEY_MEMBER_PHOTOS",
            str(ROOT / "scripts" / "seed" / "member-photos"),
        )
    )
