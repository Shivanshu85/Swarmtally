"""
config.py – Swarmtally Backend
================================
Centralized configuration and constants.

These are the canonical values used by the application.
main.py defines its own inline constants (preserved as-is);
this file serves as the single source of truth for future modules
and makes configuration easy to find and update.

Import example:
    from config import settings
    print(settings.CONF_THRESHOLD)
"""

import os
from pathlib import Path

# ── Directory layout ───────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).parent
UPLOAD_DIR = BASE_DIR / "uploads"
OUTPUT_DIR = BASE_DIR / "outputs"
MODEL_PATH = BASE_DIR / "best.pt"

# ── File upload limits ─────────────────────────────────────────────────────────
MAX_FILE_SIZE_MB: int = 10                        # Maximum accepted upload size
ALLOWED_EXTENSIONS: frozenset[str] = frozenset({".jpg", ".jpeg", ".png"})

# ── YOLOv8 inference ──────────────────────────────────────────────────────────
CONF_THRESHOLD: float = 0.25                      # Minimum detection confidence

# ── Bounding box colours (BGR for OpenCV) ──────────────────────────────────────
# "Duty and Honor" design palette
SAFFRON_BGR: tuple[int, int, int] = (50, 152, 254)   # #fe9832
OLIVE_BGR:   tuple[int, int, int] = (32, 83, 75)     # #4b5320

# ── CORS ──────────────────────────────────────────────────────────────────────
FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")

# ── Application metadata ──────────────────────────────────────────────────────
APP_NAME    = "Swarmtally"
APP_VERSION = "1.0.0"
APP_DESC    = "AI-powered drone detection and counting using YOLOv8"


class Settings:
    """
    Typed settings object for clean attribute access.
    Useful when passing config to service layers.
    """
    BASE_DIR         = BASE_DIR
    UPLOAD_DIR       = UPLOAD_DIR
    OUTPUT_DIR       = OUTPUT_DIR
    MODEL_PATH       = MODEL_PATH
    MAX_FILE_SIZE_MB = MAX_FILE_SIZE_MB
    ALLOWED_EXTENSIONS = ALLOWED_EXTENSIONS
    CONF_THRESHOLD   = CONF_THRESHOLD
    SAFFRON_BGR      = SAFFRON_BGR
    OLIVE_BGR        = OLIVE_BGR
    FRONTEND_URL     = FRONTEND_URL
    APP_NAME         = APP_NAME
    APP_VERSION      = APP_VERSION
    APP_DESC         = APP_DESC


settings = Settings()
