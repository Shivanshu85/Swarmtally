"""
Swarmtally – FastAPI Backend
============================
Drone Detection and Counting using YOLOv8.

Endpoints:
  GET  /health           – Health check
  POST /detect           – Run inference on uploaded image
  GET  /outputs/{file}   – Serve annotated result images (static)
"""

import asyncio
import os
import re
import uuid
import time
from pathlib import Path

from logging_config import setup_logging
setup_logging()

import cv2
import numpy as np
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from ultralytics import YOLO

# ─────────────────────────────────────────────
# Directory setup
# ─────────────────────────────────────────────
BASE_DIR = Path(__file__).parent
UPLOAD_DIR = BASE_DIR / "uploads"
OUTPUT_DIR = BASE_DIR / "outputs"
MODEL_PATH = BASE_DIR / "best.pt"

# Create directories if they don't exist
UPLOAD_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)

# ─────────────────────────────────────────────
# Load YOLOv8 model once at startup
# This avoids reloading on every request (saves ~2s per call)
# ─────────────────────────────────────────────
print(f"[Swarmtally] Loading YOLOv8 model from: {MODEL_PATH}")
if not MODEL_PATH.exists():
    raise FileNotFoundError(
        f"Model file not found at {MODEL_PATH}. "
        "Place your trained best.pt inside the backend/ folder."
    )
model = YOLO(str(MODEL_PATH))
print("[Swarmtally] ✓ Model loaded successfully.")

# ─────────────────────────────────────────────
# FastAPI application
# ─────────────────────────────────────────────
app = FastAPI(
    title="Swarmtally API",
    description="AI-powered drone detection and counting using YOLOv8",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─────────────────────────────────────────────
# CORS – allow frontend (Next.js) to call this API
# ─────────────────────────────────────────────
# NOTE: "*" wildcard CANNOT be combined with allow_credentials=True
# (violates the CORS spec and raises a Starlette RuntimeError).
# List only the specific origins that need access.
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

_CORS_ORIGINS = list({
    "http://localhost:3000",
    "http://localhost:3001",
    FRONTEND_URL,
})

app.add_middleware(
    CORSMiddleware,
    allow_origins=_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# Serve output images as static files
# Access via: GET /outputs/<filename>
# ─────────────────────────────────────────────
app.mount("/outputs", StaticFiles(directory=str(OUTPUT_DIR)), name="outputs")

# ─────────────────────────────────────────────
# Allowed file types
# ─────────────────────────────────────────────
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}

# Maximum upload size (bytes) – 10 MB
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

# Maximum image dimension (pixels) – prevents OOM on huge images
MAX_IMAGE_DIMENSION = 8192

# ─────────────────────────────────────────────
# Colour constants for bounding box rendering
# Uses the "Duty and Honor" design palette
# ─────────────────────────────────────────────
# Saffron orange  #fe9832  →  BGR = (50, 152, 254)
SAFFRON_BGR = (50, 152, 254)
# Dark olive      #4b5320  →  BGR = (32, 83, 75)
OLIVE_BGR = (32, 83, 75)
# Confidence threshold
CONF_THRESHOLD = 0.25


# ─────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────

@app.get("/health", tags=["System"])
def health_check():
    """Returns API health status and loaded model name."""
    return {
        "status": "ok",
        "app": "Swarmtally",
        "model": MODEL_PATH.name,
        "version": "1.0.0",
    }


@app.post("/detect", tags=["Detection"])
async def detect_drones(file: UploadFile = File(...)):
    """
    Accepts an image upload, runs YOLOv8 drone detection inference,
    draws saffron bounding boxes, and returns detection metadata.

    Returns:
        drone_count       – Total drones detected
        confidences       – List of confidence scores (0–1) per drone
        processed_image_url – Path to the annotated result image
        inference_ms      – Inference time in milliseconds
    """
    # ── 1. Validate file extension ─────────────────────────────────────────
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Unsupported file type '{ext}'. "
                "Accepted formats: .jpg, .jpeg, .png"
            ),
        )

    # ── 2. Read uploaded bytes ──────────────────────────────────────────────
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    if len(contents) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=(
                f"File too large ({len(contents) // (1024*1024)} MB). "
                f"Maximum allowed size is {MAX_FILE_SIZE_BYTES // (1024*1024)} MB."
            ),
        )

    # ── 3. Decode image with OpenCV ─────────────────────────────────────────
    np_arr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if img is None:
        raise HTTPException(
            status_code=400,
            detail="Could not decode image. Ensure it is a valid JPEG or PNG file.",
        )

    # Guard against extremely large images that would exhaust RAM during inference
    h, w = img.shape[:2]
    if h > MAX_IMAGE_DIMENSION or w > MAX_IMAGE_DIMENSION:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Image dimensions ({w}×{h}px) exceed the maximum allowed "
                f"{MAX_IMAGE_DIMENSION}×{MAX_IMAGE_DIMENSION}px."
            ),
        )

    # ── 4. Run YOLOv8 inference ─────────────────────────────────────────────
    #   conf=0.25  – minimum confidence threshold as per PRD
    #   Runs in a thread pool executor so the async event loop is NOT blocked.
    #   Without this, concurrent requests would queue behind each inference call.
    start_time = time.perf_counter()
    loop = asyncio.get_event_loop()
    results = await loop.run_in_executor(
        None, lambda: model(img, conf=CONF_THRESHOLD, verbose=False)
    )
    inference_ms = round((time.perf_counter() - start_time) * 1000, 1)

    # ── 5. Count detections (each box = one drone) ──────────────────────────
    #   count = len(results[0].boxes)  ← as specified in TRD §10
    boxes = results[0].boxes
    drone_count = len(boxes)

    # ── 6. Extract confidence scores ────────────────────────────────────────
    confidences: list[float] = []
    if drone_count > 0:
        confidences = [round(float(c), 4) for c in boxes.conf.tolist()]

    # ── 7. Draw custom bounding boxes on the image ──────────────────────────
    annotated = img.copy()

    for idx, box in enumerate(boxes):
        # Bounding box coordinates
        x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
        conf = float(box.conf[0])

        # Label format: "DRN-01: 91.2%"
        label = f"DRN-{idx + 1:02d}: {conf * 100:.1f}%"

        # Draw saffron border rectangle (2px thick)
        cv2.rectangle(annotated, (x1, y1), (x2, y2), SAFFRON_BGR, 2)

        # Draw olive label background
        (text_w, text_h), baseline = cv2.getTextSize(
            label, cv2.FONT_HERSHEY_SIMPLEX, 0.45, 1
        )
        # If the label goes above the image frame, draw it inside the bounding box
        if y1 - text_h - baseline - 6 < 0:
            label_y1 = y1
            label_y2 = y1 + text_h + baseline + 6
            text_y = y1 + text_h + 3
        else:
            label_y1 = y1 - text_h - baseline - 6
            label_y2 = y1
            text_y = y1 - baseline - 2

        cv2.rectangle(
            annotated,
            (x1, label_y1),
            (x1 + text_w + 6, label_y2),
            OLIVE_BGR,
            -1,  # Filled
        )

        # Draw white label text
        cv2.putText(
            annotated,
            label,
            (x1 + 3, text_y),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.45,
            (255, 255, 255),
            1,
            cv2.LINE_AA,
        )

    # ── 8. Save annotated image ─────────────────────────────────────────────
    out_filename = f"result_{uuid.uuid4().hex[:10]}.jpg"
    out_path = OUTPUT_DIR / out_filename
    cv2.imwrite(
        str(out_path),
        annotated,
        [cv2.IMWRITE_JPEG_QUALITY, 92],
    )

    # ── 9. Return JSON response ─────────────────────────────────────────────
    return JSONResponse(
        content={
            "drone_count": drone_count,
            "confidences": confidences,
            "processed_image_url": f"/outputs/{out_filename}",
            "inference_ms": inference_ms,
        }
    )


@app.delete("/cleanup/{filename}", tags=["System"])
async def cleanup_session_output(filename: str):
    """
    Deletes a single annotated result image when the user's session ends.
    Called by the frontend when the user clicks "Re-Detect".

    Security measures:
      - Filename is validated against the exact pattern our generator produces
        (result_<10 lowercase hex chars>.jpg), so only files we wrote can ever
        be targeted – no path traversal, no arbitrary file deletion.
      - The endpoint is idempotent: returns 200 whether the file existed or not.
    """
    # Only accept filenames that exactly match our own generated pattern.
    if not re.fullmatch(r"result_[a-f0-9]{10}\.jpg", filename):
        raise HTTPException(
            status_code=400,
            detail="Invalid filename. Only session output files can be deleted.",
        )

    file_path = OUTPUT_DIR / filename
    if file_path.exists():
        file_path.unlink()

    return {"status": "ok", "filename": filename}
