# Multi-stage Dockerfile for FastAPI Backend

# Stage 1: Builder
FROM python:3.12-slim as builder

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Stage 2: Runtime
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install runtime dependencies only.
# zstd: required by the Ollama installer to extract its release archive.
RUN apt-get update && apt-get install -y \
    postgresql-client \
    curl \
    zstd \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Install Ollama (embedding sidecar) and pre-pull the embed model, so cold starts
# are fast and don't depend on the model registry at runtime. Models live in an
# app-owned dir (OLLAMA_MODELS) so the non-root user can read them at runtime.
ENV OLLAMA_MODELS=/models
# The build-time `ollama serve` is intentionally left running: Docker tears it down
# when the layer completes. (Do NOT `pkill -f "ollama serve"` — the pattern also
# matches this build shell's own command line and would kill the RUN, failing the build.)
RUN curl -fsSL https://ollama.com/install.sh | sh && \
    mkdir -p /models && \
    (ollama serve & ) && \
    timeout 60 sh -c 'until curl -sf http://localhost:11434/api/tags >/dev/null 2>&1; do sleep 1; done' && \
    ollama pull nomic-embed-text

# Embeddings use the local sidecar; chat (OLLAMA_BASE_URL/OLLAMA_API_KEY/OLLAMA_CHAT_MODEL)
# is configured at deploy time to point at Ollama Cloud.
ENV EMBED_BASE_URL=http://localhost:11434/v1

# Copy Python packages from builder
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy application code
COPY . .

# Create non-root user and set permissions (incl. the sidecar's model dir)
RUN useradd -m -u 1000 appuser && \
    chmod +x /app/docker-entrypoint.sh && \
    chown -R appuser:appuser /app /models
USER appuser

# Expose port
EXPOSE 8000

# Health check (longer start period: the embedding sidecar + migrations boot first)
HEALTHCHECK --interval=30s --timeout=5s --start-period=180s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/health || exit 1

# Start the embedding sidecar, run migrations, then the API (see docker-entrypoint.sh)
CMD ["./docker-entrypoint.sh"]
