# PowerShell script to setup database
$connectionString = "postgresql://neondb_owner:npg_4xwjp1crSLXq@ep-misty-paper-a1jnw19y-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DARJI PRO - Database Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if psql is installed
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue

if ($psqlPath) {
    Write-Host "✓ psql found at: $($psqlPath.Source)" -ForegroundColor Green
    Write-Host "Running SQL setup script..." -ForegroundColor Yellow
    Write-Host ""
    
    psql $connectionString -f "SIMPLE_DATABASE_SETUP.sql"
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Setup complete! Check output above." -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
}
else {
    Write-Host "✗ psql not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install PostgreSQL client:" -ForegroundColor Yellow
    Write-Host "1. Download from: https://www.postgresql.org/download/windows/" -ForegroundColor White
    Write-Host "2. Or use Neon SQL Editor in browser" -ForegroundColor White
    Write-Host ""
    Write-Host "Alternative: Copy SIMPLE_DATABASE_SETUP.sql contents" -ForegroundColor Yellow
    Write-Host "and paste into Neon SQL Editor manually." -ForegroundColor Yellow
}

Write-Host ""
Read-Host "Press Enter to exit"
