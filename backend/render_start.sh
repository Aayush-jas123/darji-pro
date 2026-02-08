#!/bin/bash
set -e

# We need to be in the backend directory for imports and alembic to work
# Use dirname to robustly find the backend directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo "Script directory: $DIR"

# If we are not in 'backend' directory (e.g. at root), cd into it.
# Check if 'backend' exists in current dir, or if we are already inside it.
if [ -d "backend" ]; then
    echo "Found 'backend' directory, entering..."
    cd backend
elif [[ "$DIR" == */backend ]]; then
    echo "Already in backend directory or script is in backend."
    # If we are already in backend, we might not need to cd, 
    # but let's cd to DIR to be safe if we were called from root
    cd "$DIR"
else
    echo "Warning: Could not determine backend directory structure. Current: $(pwd)"
fi

echo "Current Directory: $(pwd)"
ls -la

echo "Checking for alembic.ini..."
if [ -f "alembic.ini" ]; then
    echo "Found alembic.ini"
else
    echo "ERROR: alembic.ini NOT found in $(pwd)"
    echo "Listing parent directory:"
    ls -la ..
fi

# Wait for database to be ready (optional but good practice)
# echo "Waiting for database..."
# sleep 5

echo "Current migration status (before fix):"
alembic -c alembic.ini current || echo "Alembic current failed (ignoring)"

echo "Fixing DB state..."
python fix_db_state.py

echo "Running database migrations..."
alembic -c alembic.ini upgrade head

echo "Starting application..."
uvicorn app.main:app --host 0.0.0.0 --port $PORT
