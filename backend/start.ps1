# Quick start script for Darji Pro backend
Write-Host "🚀 Starting Darji Pro Backend..." -ForegroundColor Cyan
Write-Host ""

# Check if virtual environment exists
if (-not (Test-Path "venv")) {
    Write-Host "❌ Virtual environment not found!" -ForegroundColor Red
    Write-Host "Please run: python -m venv venv" -ForegroundColor Yellow
    exit 1
}

# Activate virtual environment
Write-Host "📦 Activating virtual environment..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1

# Check if dependencies are installed
Write-Host "🔍 Checking dependencies..." -ForegroundColor Yellow
$fastapi = pip list | Select-String "fastapi"
if (-not $fastapi) {
    Write-Host "⚠️  Dependencies not installed. Installing now..." -ForegroundColor Yellow
    pip install -r requirements.txt
}

Write-Host ""
Write-Host "✅ Environment ready!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Starting server at http://localhost:8000" -ForegroundColor Cyan
Write-Host "📚 API docs will be at http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
