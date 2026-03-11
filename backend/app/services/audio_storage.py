from __future__ import annotations

import os
from pathlib import Path

from app.core.config import settings


def get_audio_path(filename: str) -> str:
    base_dir = Path(__file__).resolve().parents[2]
    path = Path(settings.AUDIO_STORAGE_PATH)
    if not path.is_absolute():
        path = base_dir / path
    return str(path / filename)
