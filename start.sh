#!/bin/bash
# Render start script for backend

set -e

echo "🚀 Starting Darji Pro API..."
cd backend

# Run migrations
echo "📊 Running database migrations..."
alembic upgrade head || echo "⚠️ Migrations skipped (may need manual setup)"

# Seed database (optional - comment out after first run)
# python -m app.db.seed

# Start the server
echo "🌐 Starting Uvicorn server..."
uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
