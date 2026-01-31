# Darji Pro Quick Setup Script
Write-Host "Setting up Darji Pro Backend..." -ForegroundColor Cyan
Write-Host ""

# Check Python
Write-Host "Checking Python..." -ForegroundColor Yellow
python --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "Python not found! Please install Python 3.11+" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Create virtual environment
Write-Host "Setting up virtual environment..." -ForegroundColor Yellow
if (-not (Test-Path "venv")) {
    python -m venv venv
    Write-Host "Virtual environment created" -ForegroundColor Green
}
else {
    Write-Host "Virtual environment already exists" -ForegroundColor Green
}
Write-Host ""

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1
Write-Host ""

# Upgrade pip
Write-Host "Upgrading pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip --quiet
Write-Host ""

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Gray
pip install -r requirements.txt
Write-Host "Dependencies installed" -ForegroundColor Green
Write-Host ""

# Create .env file if it doesn't exist
Write-Host "Checking environment configuration..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Copy-Item "../.env.example" ".env"
    Write-Host ".env file created from example" -ForegroundColor Green
    Write-Host "Please update .env with your database credentials" -ForegroundColor Yellow
}
else {
    Write-Host ".env file already exists" -ForegroundColor Green
}
Write-Host ""

Write-Host "Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Update .env file with your database URL" -ForegroundColor White
Write-Host "2. Run: alembic upgrade head" -ForegroundColor White
Write-Host "3. Run: uvicorn app.main:app --reload" -ForegroundColor White
Write-Host ""
