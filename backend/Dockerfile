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

EXPOSE 8000

# --workers 1 is deliberate for the default image: faster-whisper's local
# fallback model is loaded once per worker process and is memory-heavy;
# scale via multiple container replicas behind a load balancer instead of
# multiple uvicorn workers unless the host has RAM to spare.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
