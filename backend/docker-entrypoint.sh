#!/bin/bash
# Container entrypoint: run the embedding "sidecar" (a local Ollama) alongside the API.
#
# Chat / generation go to Ollama Cloud (OLLAMA_BASE_URL=https://ollama.com/v1);
# embeddings run against the local Ollama started here
# (EMBED_BASE_URL=http://localhost:11434/v1) using nomic-embed-text. Ollama Cloud
# has no embeddings endpoint, so this keeps retrieval identical to local dev while
# chat is served by the cloud.
set -e

echo "[entrypoint] starting Ollama embedding sidecar..."
ollama serve &

# Wait for the local Ollama to accept requests.
tries=0
until curl -sf http://localhost:11434/api/tags >/dev/null 2>&1; do
  tries=$((tries + 1))
  if [ "$tries" -gt 60 ]; then
    echo "[entrypoint] Ollama did not become ready in time" >&2
    exit 1
  fi
  sleep 1
done

# Ensure the embed model is present (no-op if it was baked into the image).
EMBED_MODEL="${OLLAMA_EMBED_MODEL:-nomic-embed-text}"
echo "[entrypoint] ensuring embed model: ${EMBED_MODEL}"
ollama pull "${EMBED_MODEL}" >/dev/null 2>&1 || true

echo "[entrypoint] running Alembic migrations..."
alembic upgrade head

echo "[entrypoint] starting application on :${PORT:-8000}..."
exec gunicorn app.main:app \
     --workers 2 \
     --worker-class uvicorn.workers.UvicornWorker \
     --bind 0.0.0.0:${PORT:-8000} \
     --access-logfile - \
     --error-logfile - \
     --log-level info
