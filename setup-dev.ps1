# Darji Pro - Development Setup Script (Windows)

Write-Host "🚀 Setting up Darji Pro Development Environment..." -ForegroundColor Green

# Check Python version
Write-Host "📌 Checking Python version..." -ForegroundColor Cyan
python --version

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Python is not installed. Please install Python 3.11+" -ForegroundColor Red
    exit 1
}

# Create virtual environment
Write-Host "📦 Creating virtual environment..." -ForegroundColor Cyan
Set-Location backend
python -m venv venv

# Activate virtual environment
Write-Host "🔧 Activating virtual environment..." -ForegroundColor Cyan
.\venv\Scripts\Activate.ps1

# Install dependencies
Write-Host "📥 Installing Python dependencies..." -ForegroundColor Cyan
python -m pip install --upgrade pip
pip install -r requirements.txt

# Copy environment file
Write-Host "⚙️ Setting up environment variables..." -ForegroundColor Cyan
if (-Not (Test-Path ..\.env)) {
    Copy-Item ..\.env.example ..\.env
    Write-Host "✅ Created .env file. Please update with your configuration." -ForegroundColor Green
} else {
    Write-Host "ℹ️ .env file already exists" -ForegroundColor Yellow
}

# Database setup instructions
Write-Host ""
Write-Host "📊 Database Setup:" -ForegroundColor Magenta
Write-Host "1. Make sure PostgreSQL is running"
Write-Host "2. Create database: createdb darji_pro"
Write-Host "3. Run migrations: alembic upgrade head"
Write-Host ""

# Redis setup instructions
Write-Host "🔴 Redis Setup:" -ForegroundColor Red
Write-Host "Make sure Redis is running on localhost:6379"
Write-Host ""

Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Next steps:" -ForegroundColor Yellow
Write-Host "1. Update .env with your configuration"
Write-Host "2. Start PostgreSQL and Redis"
Write-Host "3. Run: alembic upgrade head"
Write-Host "4. Run: uvicorn app.main:app --reload"
Write-Host ""
Write-Host "📚 Documentation: http://localhost:8000/docs" -ForegroundColor Cyan
