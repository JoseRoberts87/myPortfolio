#!/bin/bash

# Backend run script - shortcuts for common commands

case "$1" in
  "install")
    echo "📦 Installing Python dependencies..."
    python -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    echo "✓ Dependencies installed!"
    ;;

  "db:start")
    echo "🐘 Starting PostgreSQL..."
    docker-compose up -d
    echo "✓ PostgreSQL started on port 5432"
    ;;

  "db:stop")
    echo "🛑 Stopping PostgreSQL..."
    docker-compose down
    echo "✓ PostgreSQL stopped"
    ;;

  "db:reset")
    echo "🔄 Resetting database..."
    docker-compose down -v
    docker-compose up -d
    sleep 3
    python init_db.py
    echo "✓ Database reset complete"
    ;;

  "db:init")
    echo "🗄️  Initializing database tables..."
    python init_db.py
    echo "✓ Database initialized"
    ;;

  "dev")
    echo "🚀 Starting FastAPI development server..."
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
    ;;

  "test")
    echo "🧪 Running tests..."
    pytest
    ;;

  "pipeline")
    echo "🔄 Running data pipeline..."
    curl -X POST "http://localhost:8000/api/v1/pipeline/run?time_filter=day"
    ;;

  *)
    echo "Backend Commands:"
    echo "  ./run.sh install    - Install Python dependencies"
    echo "  ./run.sh db:start   - Start PostgreSQL container"
    echo "  ./run.sh db:stop    - Stop PostgreSQL container"
    echo "  ./run.sh db:reset   - Reset database (WARNING: deletes all data)"
    echo "  ./run.sh db:init    - Initialize database tables"
    echo "  ./run.sh dev        - Start development server"
    echo "  ./run.sh test       - Run tests"
    echo "  ./run.sh pipeline   - Trigger data pipeline"
    ;;
esac
