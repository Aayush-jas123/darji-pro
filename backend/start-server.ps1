# Darji Pro - Start Backend Server
# Run this script after completing database setup

Write-Host "🚀 Starting Darji Pro Backend Server..." -ForegroundColor Cyan
Write-Host ""

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1

Write-Host ""
Write-Host "Starting FastAPI server..." -ForegroundColor Green
Write-Host ""
Write-Host "📍 Server will be available at:" -ForegroundColor White
Write-Host "   • API: http://localhost:8000" -ForegroundColor Cyan
Write-Host "   • Swagger Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "   • ReDoc: http://localhost:8000/redoc" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
