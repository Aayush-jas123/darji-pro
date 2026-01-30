# Step-by-step setup instructions

Write-Host "📋 Darji Pro Backend - Setup Instructions" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Follow these steps to get started:" -ForegroundColor White
Write-Host ""

Write-Host "STEP 1: Create Virtual Environment" -ForegroundColor Yellow
Write-Host "  Run: python -m venv venv" -ForegroundColor Gray
Write-Host ""

Write-Host "STEP 2: Activate Virtual Environment" -ForegroundColor Yellow
Write-Host "  Run: .\venv\Scripts\Activate.ps1" -ForegroundColor Gray
Write-Host ""

Write-Host "STEP 3: Install Dependencies" -ForegroundColor Yellow
Write-Host "  Run: pip install -r requirements.txt" -ForegroundColor Gray
Write-Host ""

Write-Host "STEP 4: Run Database Migrations" -ForegroundColor Yellow
Write-Host "  Run: alembic upgrade head" -ForegroundColor Gray
Write-Host ""

Write-Host "STEP 5: (Optional) Seed Test Data" -ForegroundColor Yellow
Write-Host "  Run: python -m app.db.seed" -ForegroundColor Gray
Write-Host ""

Write-Host "STEP 6: Start the Server" -ForegroundColor Yellow
Write-Host "  Run: uvicorn app.main:app --reload" -ForegroundColor Gray
Write-Host ""

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "OR use the automated script:" -ForegroundColor White
Write-Host "  Run: .\setup-and-run.ps1" -ForegroundColor Cyan
Write-Host ""

Write-Host "Database: Neon PostgreSQL (Cloud) ✅" -ForegroundColor Green
Write-Host ""
