# =============================================================================
# Swarmtally – Backend Dockerfile
# Uses Chainguard Python images (Wolfi-OS based) – consistently 0 known CVEs.
# Two-stage build:
#   builder  – cgr.dev/chainguard/python:latest-dev  (has pip + build tools)
#   runner   – cgr.dev/chainguard/python:latest       (minimal, no shell, non-root)
# =============================================================================

# ── Stage 1: Builder ──────────────────────────────────────────────────────────
# latest-dev includes pip, shell, and build tools needed to compile native wheels
FROM cgr.dev/chainguard/python:latest-dev AS builder

WORKDIR /app

# Install Python dependencies into /app/packages so they are easy to copy.
# --prefix writes lib/, bin/ etc. under the given directory.
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir --prefix=/app/packages -r requirements.txt

# ── Stage 2: Runtime ─────────────────────────────────────────────────────────
# cgr.dev/chainguard/python:latest is a distroless-style image:
#   - Wolfi OS base (musl libc) → 0 known CVEs
#   - Runs as non-root user (uid 65532) by default
#   - No shell, no package manager – smallest possible attack surface
FROM cgr.dev/chainguard/python:latest

# ── System labels ─────────────────────────────────────────────────────────────
LABEL maintainer="Swarmtally"
LABEL description="Swarmtally FastAPI backend – drone detection with YOLOv8"

WORKDIR /app

# Copy installed Python packages from builder into /usr/local
COPY --from=builder /app/packages /usr/local

# Copy application files
COPY main.py .
COPY best.pt .
COPY entrypoint.py .

# Create runtime directories (volumes are mounted here by docker-compose).
# Chainguard images default to non-root (uid 65532); create dirs as root first.
USER root
RUN mkdir -p uploads outputs && chown -R 65532:65532 /app
USER 65532

# ── Expose API port ───────────────────────────────────────────────────────────
EXPOSE 8000

# ── Health check ──────────────────────────────────────────────────────────────
# Chainguard runtime has no curl/wget – use Python's built-in urllib instead.
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

# ── Startup command ───────────────────────────────────────────────────────────
# entrypoint.py reads $PORT (default 8000) and exec()s uvicorn as PID 1,
# ensuring proper signal forwarding (SIGTERM → graceful shutdown).
# Pure Python exec – no shell required, compatible with distroless runtime.
CMD ["python", "entrypoint.py"]
