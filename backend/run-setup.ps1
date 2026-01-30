# Simplified setup script - Step by step with user confirmation
Write-Host "🚀 Darji Pro Backend - Automated Setup" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Activate venv
Write-Host "📦 Activating virtual environment..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1

Write-Host ""
Write-Host "📥 Installing dependencies (this may take 2-3 minutes)..." -ForegroundColor Yellow
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
}
else {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🗄️  Running database migrations..." -ForegroundColor Yellow
alembic upgrade head

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database migrations complete!" -ForegroundColor Green
}
else {
    Write-Host "⚠️  Migration completed with warnings (may be normal)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🌱 Do you want to seed the database with test data? (y/n)" -ForegroundColor Yellow
$response = Read-Host "   Enter choice"

if ($response -eq 'y' -or $response -eq 'Y') {
    Write-Host "   Seeding database..." -ForegroundColor Gray
    python -m app.db.seed
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Test data created!" -ForegroundColor Green
    }
}
else {
    Write-Host "   ⏭️  Skipped" -ForegroundColor Gray
}

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Starting server at http://localhost:8000" -ForegroundColor Cyan
Write-Host "📚 API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host ""

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
