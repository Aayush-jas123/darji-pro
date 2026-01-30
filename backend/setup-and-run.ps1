# Complete setup and run script for Darji Pro
Write-Host "🚀 Darji Pro - Complete Setup & Run" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check Python
Write-Host "1️⃣ Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "   ✅ $pythonVersion" -ForegroundColor Green
}
catch {
    Write-Host "   ❌ Python not found. Please install Python 3.11+" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 2: Create/Activate Virtual Environment
Write-Host "2️⃣ Setting up virtual environment..." -ForegroundColor Yellow
if (-not (Test-Path "venv")) {
    Write-Host "   Creating virtual environment..." -ForegroundColor Gray
    python -m venv venv
    Write-Host "   ✅ Virtual environment created" -ForegroundColor Green
}
else {
    Write-Host "   ✅ Virtual environment already exists" -ForegroundColor Green
}

Write-Host "   Activating virtual environment..." -ForegroundColor Gray
& .\venv\Scripts\Activate.ps1

Write-Host ""

# Step 3: Install Dependencies
Write-Host "3️⃣ Installing Python dependencies..." -ForegroundColor Yellow
Write-Host "   This may take a few minutes..." -ForegroundColor Gray
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt
Write-Host "   ✅ Dependencies installed" -ForegroundColor Green

Write-Host ""

# Step 4: Check Database Connection
Write-Host "4️⃣ Checking database configuration..." -ForegroundColor Yellow
try {
    $dbCheck = python -c "from app.core.config import settings; print('OK')" 2>&1
    if ($dbCheck -match "OK") {
        Write-Host "   ✅ Configuration loaded successfully" -ForegroundColor Green
        Write-Host "   📊 Using Neon PostgreSQL Cloud Database" -ForegroundColor Cyan
    }
}
catch {
    Write-Host "   ⚠️  Configuration check failed, but continuing..." -ForegroundColor Yellow
}

Write-Host ""

# Step 5: Run Migrations
Write-Host "5️⃣ Running database migrations..." -ForegroundColor Yellow
Write-Host "   Creating/updating database tables..." -ForegroundColor Gray
try {
    alembic upgrade head 2>&1 | Out-Null
    Write-Host "   ✅ Database migrations complete" -ForegroundColor Green
}
catch {
    Write-Host "   ⚠️  Migration warning (may be normal for first run)" -ForegroundColor Yellow
}

Write-Host ""

# Step 6: Seed Database (Optional)
Write-Host "6️⃣ Seed database with test data? (y/n)" -ForegroundColor Yellow
$seed = Read-Host "   "
if ($seed -eq 'y' -or $seed -eq 'Y') {
    Write-Host "   Seeding database..." -ForegroundColor Gray
    python -m app.db.seed
    Write-Host "   ✅ Test data created" -ForegroundColor Green
}
else {
    Write-Host "   ⏭️  Skipped seeding" -ForegroundColor Gray
}

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Starting FastAPI server..." -ForegroundColor Cyan
Write-Host ""
Write-Host "📍 Server will be available at:" -ForegroundColor White
Write-Host "   • API: http://localhost:8000" -ForegroundColor Cyan
Write-Host "   • Swagger Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "   • ReDoc: http://localhost:8000/redoc" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
