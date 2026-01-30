# Quick Start Guide

## Prerequisites

- Python 3.11+
- PostgreSQL 15+
- Redis (optional for full features)

## Setup Steps

### 1. Install Python Dependencies

```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment

The `.env` file is already created in `backend/.env` with default values:
- Database: `postgresql+asyncpg://postgres:postgres@localhost:5432/darji_pro`
- Redis: `redis://localhost:6379/0`
- Secret Key: Change this in production!

### 3. Set Up Database

**Option A: Using Docker (Recommended)**
```powershell
docker-compose up -d postgres redis
```

**Option B: Local PostgreSQL**
```powershell
# Create database
createdb darji_pro

# Or using psql
psql -U postgres -c "CREATE DATABASE darji_pro;"
```

### 4. Run Database Migrations

```powershell
cd backend
alembic upgrade head
```

### 5. Start the Server

```powershell
cd backend
uvicorn app.main:app --reload
```

The API will be available at:
- **API**: http://localhost:8000
- **Swagger Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Quick Test

### 1. Check Health
```powershell
curl http://localhost:8000/health
```

### 2. Register a User
```powershell
curl -X POST http://localhost:8000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Test User",
    "role": "customer"
  }'
```

### 3. Login
```powershell
curl -X POST http://localhost:8000/api/auth/login/json `
  -H "Content-Type: application/json" `
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Using Docker (Full Stack)

```powershell
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop all services
docker-compose down
```

## Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running
- Check DATABASE_URL in `.env`
- Verify database exists: `psql -U postgres -l`

### Import Errors
- Activate virtual environment: `.\venv\Scripts\activate`
- Reinstall dependencies: `pip install -r requirements.txt`

### Port Already in Use
- Change API_PORT in `.env`
- Or kill process: `netstat -ano | findstr :8000`

## Next Steps

1. Explore API at http://localhost:8000/docs
2. Create test data using the API
3. Build frontend applications
4. Implement ML recommendation engine
5. Add notification services
