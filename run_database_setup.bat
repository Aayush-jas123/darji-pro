@echo off
echo ========================================
echo DARJI PRO - Database Setup via psql
echo ========================================
echo.

REM Your Neon connection string
set DATABASE_URL=postgresql://neondb_owner:npg_4xwjp1crSLXq@ep-misty-paper-a1jnw19y-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require

echo Connecting to Neon database...
echo.

REM Run the SQL file
psql "%DATABASE_URL%" -f SIMPLE_DATABASE_SETUP.sql

echo.
echo ========================================
echo Done! Check output above for any errors.
echo ========================================
pause
