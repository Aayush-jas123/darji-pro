#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "🚀 Starting Render Build..."

echo "📦 Installing Backend Dependencies..."
cd backend
pip install -r requirements-render.txt

echo "🗄️ Running Database Migrations..."
alembic upgrade head

echo "🎨 Building Frontend..."
cd ../frontend/customer
npm install
npm run build

# Create out directory if it doesn't exist (for compatibility)
mkdir -p out
# Copy .next/standalone to out if it exists
if [ -d ".next/standalone" ]; then
    cp -r .next/standalone/* out/ 2>/dev/null || true
fi
# Copy .next/static to out if it exists
if [ -d ".next/static" ]; then
    cp -r .next/static out/_next/static 2>/dev/null || true
fi

echo "✅ Build Complete!"
