# 🚀 Darji Pro - Quick Reference

## Server Status: ✅ RUNNING

### Current Running Services
- **Backend API**: http://localhost:8000 ✅
- **Health Status**: HEALTHY ✅
- **Database**: Neon Cloud PostgreSQL ✅

---

## 🌐 Quick Access URLs

| Service | URL | Status |
|---------|-----|--------|
| API Base | http://localhost:8000 | ✅ Running |
| Swagger Docs | http://localhost:8000/docs | ✅ Available |
| ReDoc | http://localhost:8000/redoc | ✅ Available |
| Health Check | http://localhost:8000/health | ✅ Healthy |

---

## 🎯 Quick Commands

### Start Backend (if stopped)
```powershell
cd backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```

### Stop Backend
Press `Ctrl+C` in the terminal

### Test API
```powershell
curl http://localhost:8000/health
```

### Seed Test Data
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python -m app.db.seed
```

---

## 📋 First Steps

1. **Explore API**: Visit http://localhost:8000/docs
2. **Register User**: Use POST `/api/auth/register`
3. **Login**: Use POST `/api/auth/login/json`
4. **Test Endpoints**: Try the interactive Swagger UI

---

## 🔑 Example API Calls

### Register a New User
```json
POST http://localhost:8000/api/auth/register
{
  "email": "test@example.com",
  "password": "password123",
  "full_name": "Test User",
  "role": "customer"
}
```

### Login
```json
POST http://localhost:8000/api/auth/login/json
{
  "email": "test@example.com",
  "password": "password123"
}
```

### Get Current User (requires token)
```
GET http://localhost:8000/api/auth/me
Authorization: Bearer <your-access-token>
```

---

## 📊 Database Info

- **Provider**: Neon Cloud
- **Database**: neondb
- **Tables**: 8 tables created
- **Connection**: SSL/TLS encrypted
- **Status**: Connected ✅

---

## ⚠️ Pending Tasks

- [ ] Install Node.js for frontend
- [ ] Run `npm install` in `frontend/customer`
- [ ] Start frontend with `npm run dev`

---

## 📚 Documentation

- [Setup Complete Guide](file:///C:/Users/asus/.gemini/antigravity/brain/c3f358a0-12a1-4b1c-a9b1-a87e086f59b7/setup-complete.md)
- [Project README](file:///d:/project/darji%20pro/README.md)
- [GitHub Repository](https://github.com/Aayush-jas123/darji-pro)

---

**Status**: Backend fully operational ✅ | Frontend needs Node.js ⚠️
