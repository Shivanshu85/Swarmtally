"""
logging_config.py – Swarmtally Backend
=======================================
Provides a structured logging setup for the FastAPI application.

Usage (in main.py, optional):
    from logging_config import setup_logging
    setup_logging()

This module is entirely optional — the app works without it.
Import it at the top of main.py if you want structured JSON logs in production.
"""

import logging
import sys
import os


def setup_logging(level: str | None = None) -> None:
    """
    Configure application-wide logging.

    Args:
        level: Log level string (DEBUG, INFO, WARNING, ERROR).
               Defaults to LOG_LEVEL env var, or INFO.
    """
    log_level_str = level or os.getenv("LOG_LEVEL", "INFO").upper()
    log_level = getattr(logging, log_level_str, logging.INFO)

    # Root logger configuration
    logging.basicConfig(
        level=log_level,
        format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
        stream=sys.stdout,
        force=True,  # Override any existing configuration
    )

    # Suppress noisy third-party loggers
    logging.getLogger("ultralytics").setLevel(logging.WARNING)
    logging.getLogger("urllib3").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)

    logger = logging.getLogger(__name__)
    logger.info(f"Logging configured | level={log_level_str}")


# Module-level logger for use within this file
logger = logging.getLogger("swarmtally")
