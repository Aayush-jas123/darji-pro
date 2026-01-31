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

echo "✅ Build Complete!"
