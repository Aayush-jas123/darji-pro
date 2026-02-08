#!/bin/bash
set -e

# Wait for database to be ready (optional but good practice)
# echo "Waiting for database..."
# sleep 5

echo "Running database migrations..."
alembic upgrade head

echo "Starting application..."
uvicorn app.main:app --host 0.0.0.0 --port $PORT
