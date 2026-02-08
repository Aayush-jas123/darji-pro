#!/bin/bash
set -e

# Wait for database to be ready (optional but good practice)
# echo "Waiting for database..."
# sleep 5

echo "Current migration status (before fix):"
alembic current

echo "Fixing DB state..."
python fix_db_state.py

echo "Running database migrations..."
alembic upgrade head

echo "Starting application..."
uvicorn app.main:app --host 0.0.0.0 --port $PORT
