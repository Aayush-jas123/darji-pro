# ============================================
# ALTERNATIVE: Trigger Render Redeploy
# This will run Alembic migrations automatically
# ============================================

## Option 1: Manual Redeploy via Render Dashboard

1. Go to: https://dashboard.render.com
2. Find your "darji-pro" service
3. Click "Manual Deploy" → "Deploy latest commit"
4. Wait for build to complete (~5 minutes)
5. Check logs for "Running Database Migrations..."
6. Should see: "alembic upgrade head" running

## Option 2: Trigger via Git Push

Since we've already pushed all the code with migrations,
a redeploy should automatically run the migrations.

To force a redeploy:
```bash
git commit --allow-empty -m "trigger redeploy"
git push origin main
```

## Option 3: Use Render Shell (Advanced)

1. Go to Render Dashboard
2. Click on your service
3. Click "Shell" tab
4. Run these commands:

```bash
cd backend
alembic upgrade head
```

## Option 4: Check if migrations already ran

The issue might be that migrations ran but failed silently.
Check Render logs for:
- "Running Database Migrations..."
- Any errors from Alembic
- Database connection errors

## What to look for in Render logs:

✅ Good:
```
Running Database Migrations...
INFO  [alembic.runtime.migration] Running upgrade  -> 001_initial
INFO  [alembic.runtime.migration] Running upgrade 001_initial -> 002_orders_invoices
```

❌ Bad:
```
ERROR: could not connect to database
ERROR: relation "users" does not exist
```

---

## RECOMMENDED: Manual Redeploy

The easiest solution is to trigger a manual redeploy on Render.
This will run the build script which includes `alembic upgrade head`.

1. Go to Render Dashboard
2. Click "Manual Deploy"
3. Select "Deploy latest commit"
4. Wait 5 minutes
5. Test registration

This should work because we've already fixed all the code issues!
