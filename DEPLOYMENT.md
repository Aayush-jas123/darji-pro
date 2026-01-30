# 🚀 Deploying Darji Pro to Render

Complete guide to deploy your FastAPI backend and Next.js frontend to Render.

---

## 📋 Prerequisites

1. **GitHub Repository**: ✅ Already done (https://github.com/Aayush-jas123/darji-pro)
2. **Render Account**: Sign up at https://render.com (free tier available)
3. **Database**: Neon PostgreSQL (already configured) or use Render's PostgreSQL

---

## 🎯 Deployment Options

### Option 1: Using render.yaml (Recommended - Infrastructure as Code)

This deploys everything automatically from your GitHub repo.

#### Step 1: Connect to Render

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub account
4. Select repository: `Aayush-jas123/darji-pro`
5. Render will detect `render.yaml` automatically
6. Click **"Apply"**

#### Step 2: Configure Environment Variables

Render will create:
- ✅ Web Service: `darji-pro-api`
- ✅ PostgreSQL Database: `darji-pro-db`
- ✅ Auto-generated `SECRET_KEY`

Additional variables to set (if needed):
- `FRONTEND_URL` - Your frontend URL (add after frontend deployment)

#### Step 3: Deploy

- Render will automatically build and deploy
- First deployment takes 5-10 minutes
- You'll get a URL like: `https://darji-pro-api.onrender.com`

---

### Option 2: Manual Deployment (Step-by-Step)

If you prefer manual control:

#### Backend API Deployment

1. **Create New Web Service**
   - Go to https://dashboard.render.com
   - Click **"New +"** → **"Web Service"**
   - Connect GitHub: `Aayush-jas123/darji-pro`
   - Branch: `main`

2. **Configure Service**
   ```
   Name: darji-pro-api
   Region: Singapore (or closest to you)
   Branch: main
   Root Directory: backend
   Runtime: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   Plan: Free
   ```

3. **Environment Variables**
   Click **"Advanced"** → **"Add Environment Variable"**:
   
   ```bash
   # Required
   DATABASE_URL=<your-neon-postgres-url>
   SECRET_KEY=<generate-random-string>
   
   # Optional
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   REFRESH_TOKEN_EXPIRE_DAYS=7
   CORS_ORIGINS=*
   LOG_LEVEL=INFO
   ```

4. **Deploy**
   - Click **"Create Web Service"**
   - Wait for build to complete
   - Your API will be at: `https://darji-pro-api.onrender.com`

#### PostgreSQL Database (Optional - if not using Neon)

1. **Create Database**
   - Click **"New +"** → **"PostgreSQL"**
   - Name: `darji-pro-db`
   - Plan: Free
   - Click **"Create Database"**

2. **Get Connection String**
   - Copy **Internal Database URL**
   - Add to backend environment variables as `DATABASE_URL`

---

## 🌐 Frontend Deployment (Next.js)

### Deploy Customer Frontend

1. **Create New Static Site**
   - Click **"New +"** → **"Static Site"**
   - Connect GitHub: `Aayush-jas123/darji-pro`
   - Branch: `main`

2. **Configure**
   ```
   Name: darji-pro-customer
   Root Directory: frontend/customer
   Build Command: npm install && npm run build
   Publish Directory: .next
   ```

3. **Environment Variables**
   ```bash
   NEXT_PUBLIC_API_URL=https://darji-pro-api.onrender.com
   ```

4. **Deploy**
   - Click **"Create Static Site"**
   - Frontend will be at: `https://darji-pro-customer.onrender.com`

---

## 🔧 Post-Deployment Setup

### 1. Run Database Migrations

**Option A: Via Render Shell**
```bash
# In Render dashboard, go to your web service
# Click "Shell" tab
cd backend
alembic upgrade head
python -m app.db.seed  # Optional: seed test data
```

**Option B: Automatic (already in start.sh)**
The start script runs migrations automatically on each deployment.

### 2. Update CORS Origins

In backend environment variables:
```bash
CORS_ORIGINS=https://darji-pro-customer.onrender.com,http://localhost:3000
```

### 3. Test Your Deployment

- **API Health**: https://darji-pro-api.onrender.com/health
- **API Docs**: https://darji-pro-api.onrender.com/docs
- **Frontend**: https://darji-pro-customer.onrender.com

---

## 📊 Monitoring & Logs

### View Logs
1. Go to your service in Render dashboard
2. Click **"Logs"** tab
3. Monitor real-time application logs

### Health Checks
- Render automatically monitors `/health` endpoint
- Service restarts if health check fails

---

## 🔄 Continuous Deployment

### Auto-Deploy on Git Push

Render automatically deploys when you push to GitHub:

```bash
# Make changes locally
git add .
git commit -m "Update feature"
git push origin main

# Render automatically:
# 1. Detects push
# 2. Runs build
# 3. Deploys new version
# 4. Zero-downtime deployment
```

### Manual Deploy

In Render dashboard:
1. Go to your service
2. Click **"Manual Deploy"** → **"Deploy latest commit"**

---

## 💰 Pricing (Free Tier Limits)

### Free Plan Includes:
- ✅ 750 hours/month (enough for 1 service)
- ✅ Automatic HTTPS
- ✅ Custom domains
- ✅ Continuous deployment
- ⚠️ Services spin down after 15 min inactivity
- ⚠️ Cold start: ~30 seconds

### Upgrade Options:
- **Starter ($7/month)**: No spin down, always on
- **Standard ($25/month)**: More resources, faster builds

---

## 🐛 Troubleshooting

### Build Fails

**Error**: `Module not found`
```bash
# Solution: Check requirements.txt includes all dependencies
pip freeze > backend/requirements.txt
git add backend/requirements.txt
git commit -m "Update dependencies"
git push
```

### Database Connection Error

**Error**: `could not connect to database`
```bash
# Solution: Verify DATABASE_URL format
# Should be: postgresql://user:pass@host:5432/dbname
# For asyncpg: postgresql+asyncpg://user:pass@host:5432/dbname
```

### Service Won't Start

**Error**: `Application failed to start`
```bash
# Check logs in Render dashboard
# Common issues:
# 1. Wrong start command
# 2. Missing environment variables
# 3. Port binding (use $PORT variable)
```

### CORS Errors

**Error**: `CORS policy blocked`
```bash
# Add frontend URL to CORS_ORIGINS
CORS_ORIGINS=https://your-frontend.onrender.com
```

---

## 🔐 Security Checklist

- ✅ Use environment variables for secrets
- ✅ Enable HTTPS (automatic on Render)
- ✅ Set strong `SECRET_KEY`
- ✅ Configure CORS properly
- ✅ Use PostgreSQL SSL (Neon has this by default)
- ✅ Keep dependencies updated

---

## 📈 Performance Tips

### 1. Keep Service Warm (Free Tier)
Use a service like UptimeRobot to ping your API every 5 minutes:
```
https://darji-pro-api.onrender.com/health
```

### 2. Optimize Build Time
- Use `.dockerignore` to exclude unnecessary files
- Cache dependencies when possible

### 3. Database Optimization
- Use connection pooling (already configured)
- Add indexes to frequently queried fields
- Monitor query performance

---

## 🎯 Quick Deployment Checklist

- [ ] Sign up for Render account
- [ ] Connect GitHub repository
- [ ] Create web service (backend)
- [ ] Add environment variables
- [ ] Deploy backend
- [ ] Test API endpoints
- [ ] Create static site (frontend)
- [ ] Deploy frontend
- [ ] Run database migrations
- [ ] Update CORS settings
- [ ] Test full application
- [ ] Set up monitoring

---

## 🌟 Your Deployed URLs

After deployment, you'll have:

- **Backend API**: `https://darji-pro-api.onrender.com`
- **API Docs**: `https://darji-pro-api.onrender.com/docs`
- **Frontend**: `https://darji-pro-customer.onrender.com`
- **Database**: Managed by Render or Neon

---

## 🆘 Need Help?

- **Render Docs**: https://render.com/docs
- **Render Community**: https://community.render.com
- **FastAPI Deployment**: https://fastapi.tiangolo.com/deployment/

---

**Ready to deploy? Follow Option 1 (render.yaml) for the easiest deployment! 🚀**
