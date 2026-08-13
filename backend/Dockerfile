FROM python:3.11-slim

# ffmpeg is required by services/media_service.py to extract audio from
# uploaded video files before handing them to Whisper (Whisper only
# accepts audio). Without this, the /debate/upload-video pipeline fails
# at the extract_audio() step with a 503.
RUN apt-get update && apt-get install -y --no-install-recommends \
          ffmpeg \
          && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Where uploaded audio/video files are stored (see UPLOAD_DIR in
# core/config.py). Mount this as a volume in production so recordings
# survive container restarts/redeploys.
RUN mkdir -p /app/uploads
ENV UPLOAD_DIR=/app/uploads

# Run as a non-root user in production (item: Docker non-root execution).
# The image needs root briefly above to install ffmpeg via apt, but the
# process itself should never run as root — a compromised FastAPI worker
# with root inside the container is a much bigger blast radius than one
# running as an unprivileged user. Own /app (including the uploads dir
# just created) so the app user can still write uploaded recordings there.
RUN groupadd --system appuser && useradd --system --gid appuser --home /app appuser \
          && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

# Lets `docker compose ps` / orchestrators (Compose healthcheck below, or a
# Kubernetes liveness probe) detect a running-but-unresponsive backend
# instead of only detecting a crashed process.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
          CMD python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://localhost:8000/health', timeout=3).status == 200 else 1)"

# --workers 1 is deliberate for the default image: faster-whisper's local
# fallback model is loaded once per worker process and is memory-heavy;
# scale via multiple container replicas behind a load balancer instead of
# multiple uvicorn workers unless the host has RAM to spare.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
