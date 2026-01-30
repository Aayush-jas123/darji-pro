# Simple setup - No fancy characters
Write-Host "Darji Pro Backend - Setup Starting..." -ForegroundColor Cyan
Write-Host ""

# Activate venv
Write-Host "Step 1: Activating virtual environment..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1

Write-Host ""
Write-Host "Step 2: Installing dependencies..." -ForegroundColor Yellow
Write-Host "This will take 2-3 minutes, please wait..." -ForegroundColor Gray
pip install --upgrade pip --quiet
pip install -r requirements.txt --quiet

Write-Host "Dependencies installed!" -ForegroundColor Green

Write-Host ""
Write-Host "Step 3: Running database migrations..." -ForegroundColor Yellow
alembic upgrade head

Write-Host ""
Write-Host "Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Starting server..." -ForegroundColor Cyan
Write-Host "Server will be at: http://localhost:8000" -ForegroundColor Cyan
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""

uvicorn app.main:app --reload
