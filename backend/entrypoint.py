"""
entrypoint.py – Start uvicorn, respecting the $PORT environment variable.

Used in the Docker container because the Chainguard runtime image has no shell,
so shell variable expansion (${PORT:-8000}) is not available in CMD exec form.
This script replicates that behaviour purely in Python.
"""
import os
import sys

port = os.environ.get("PORT", "8000")

cmd = [
    sys.executable, "-m", "uvicorn",
    "main:app",
    "--host", "0.0.0.0",
    "--port", port,
]

# os.execv replaces the current process, making uvicorn PID 1.
# This ensures OS signals (SIGTERM, SIGINT) are forwarded correctly.
os.execv(sys.executable, cmd)
