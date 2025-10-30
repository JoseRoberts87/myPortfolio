#!/bin/bash
set -e

echo "Running Alembic migrations..."
alembic upgrade head

echo "Starting application..."
exec gunicorn app.main:app \
     --workers 2 \
     --worker-class uvicorn.workers.UvicornWorker \
     --bind 0.0.0.0:${PORT:-8000} \
     --access-logfile - \
     --error-logfile - \
     --log-level info
