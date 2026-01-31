# Darji Pro - Run Database Migrations
# Run this script after configuring your database in .env

Write-Host "🗄️ Running Database Migrations..." -ForegroundColor Cyan
Write-Host ""

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1

Write-Host ""
Write-Host "Running Alembic migrations..." -ForegroundColor Yellow
alembic upgrade head

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Database migrations completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. (Optional) Seed test data: python -m app.db.seed" -ForegroundColor White
    Write-Host "2. Start server: .\start-server.ps1" -ForegroundColor White
}
else {
    Write-Host ""
    Write-Host "❌ Migration failed!" -ForegroundColor Red
    Write-Host "Please check your database connection in .env file" -ForegroundColor Yellow
}

Write-Host ""
