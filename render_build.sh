#!/usr/bin/env bash
# Reference: https://docs.render.com/deploy-an-image

# Exit on error
set -o errexit

echo "--- Installing Backend Dependencies ---"
pip install -r backend/requirements-render.txt

echo "--- Installing Frontend Dependencies ---"
cd frontend/customer
npm install

echo "--- Building Frontend ---"
# Ensure we build for export
npm run build

echo "--- Moving Static Files ---"
# Go back to root
cd ../..

# Create directory for static files in backend
# backend/static will hold the frontend files
mkdir -p backend/static

# Copy build output (out folder) to backend/static
# We use cp -r to copy the *contents* of out into static
cp -r frontend/customer/out/* backend/static/

echo "--- Build Complete ---"
echo "Static files are now in backend/static"
ls -la backend/static
