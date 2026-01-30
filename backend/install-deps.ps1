# Installation script for dependencies
Write-Host "📦 Installing Python dependencies..." -ForegroundColor Cyan

# Check if we're in a virtual environment
if (-not $env:VIRTUAL_ENV) {
    Write-Host "⚠️  Not in a virtual environment. Creating one..." -ForegroundColor Yellow
    python -m venv venv
    Write-Host "✅ Virtual environment created" -ForegroundColor Green
    Write-Host "Please run: .\venv\Scripts\Activate.ps1" -ForegroundColor Yellow
    Write-Host "Then run this script again" -ForegroundColor Yellow
    exit
}

Write-Host "Installing packages from requirements.txt..." -ForegroundColor Cyan
pip install --upgrade pip
pip install -r requirements.txt

Write-Host ""
Write-Host "✅ Installation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Ensure PostgreSQL is running"
Write-Host "2. Create database: createdb darji_pro"
Write-Host "3. Run migrations: alembic upgrade head"
Write-Host "4. Start server: uvicorn app.main:app --reload"
