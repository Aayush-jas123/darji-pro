"""FastAPI application entry point."""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.core.config import settings


# Rate limiter
limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    print("🚀 Starting Darji Pro API...")
    print(f"📊 Environment: {settings.ENVIRONMENT}")
    print(f"🔒 Debug Mode: {settings.DEBUG}")
    
    yield
    
    # Shutdown
    print("👋 Shutting down Darji Pro API...")


# Create FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Enterprise-grade smart tailoring platform with AI-powered fit recommendations",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# Add rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=settings.CORS_CREDENTIALS,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Trusted Host Middleware (security)
if settings.ENVIRONMENT == "production":
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["*.darjipro.com", "darjipro.com", "darji-pro.onrender.com"]
    )


@app.get("/")
async def root():
    """Root endpoint. Serves frontend if available, else API info."""
    # Check if we have a resolved frontend path from the startup logic
    # We need to access the frontend_path variable computed below. 
    # Since it's global scope in this module, we can access it if we move this function 
    # OR we can re-compute/check it here. 
    # Better: Use the same logic or just check the mount.
    
    # Actually, if we mount static files at "/", it should handle it.
    # But since this specific route is defined, it takes precedence.
    # So we should return the index.html explicitly.
    
    # Re-use the discovery logic or robustly find index.html
    current = Path(__file__).parent.parent.resolve()
    root = current.parent.resolve()
    possible_paths = [
        root / "frontend" / "customer" / "out" / "index.html",
        Path("/opt/render/project/src/frontend/customer/out/index.html"),
        current.parent / "frontend" / "customer" / "out" / "index.html",
    ]
    
    for path in possible_paths:
        if path.exists():
            return FileResponse(path)

    return {
        "message": "Welcome to Darji Pro API",
        "version": settings.VERSION,
        "docs": "/docs",
        "status": "operational",
        "note": "Frontend not found. Run 'npm run build' in frontend directory."
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "version": settings.VERSION
    }


# Import and include routers
from app.api import auth, users, appointments, measurements, branches, ml, admin, tailor, orders, invoices, search, analytics, setup, fabrics, notifications, uploads, diagnostics, fabric_seed, setup_complete

app.include_router(setup.router, prefix="/api/setup", tags=["Setup"])
app.include_router(setup_complete.router, prefix="/api/setup-complete", tags=["Complete Setup"])
app.include_router(diagnostics.router, prefix="/api/diagnostics", tags=["Diagnostics"])
app.include_router(fabric_seed.router, prefix="/api/fabric-seed", tags=["Fabric Seeding"])
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(appointments.router, prefix="/api/appointments", tags=["Appointments"])
app.include_router(measurements.router, prefix="/api/measurements", tags=["Measurements"])
app.include_router(branches.router, prefix="/api/branches", tags=["Branches"])
app.include_router(ml.router, prefix="/api/ml", tags=["ML & AI Recommendations"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(tailor.router, prefix="/api/tailor", tags=["Tailor"])
app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])
app.include_router(invoices.router, prefix="/api/invoices", tags=["Invoices & Payments"])
app.include_router(search.router, prefix="/api/search", tags=["Search"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics & Reports"])
app.include_router(fabrics.router, prefix="/api/fabrics", tags=["Fabrics"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(uploads.router, prefix="/api/uploads", tags=["File Uploads"])



# Serve frontend static files (must be last to not override API routes)
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path
import os

# Robust path resolution for Render
# On Render, the build command runs in root, but backend runs in backend/
# We need to find where the frontend files actually are.
current_dir = Path(__file__).parent.parent.resolve()
root_dir = current_dir.parent.resolve()

print(f"📂 Current Directory: {os.getcwd()}")
print(f"📂 Resolved Root: {root_dir}")

# Try multiple possible locations for the frontend build
possible_paths = [
    root_dir / "frontend" / "customer" / "out",                # Standard structure
    Path("/opt/render/project/src/frontend/customer/out"),     # Absolute Render path
    current_dir.parent / "frontend" / "customer" / "out",      # Relative parent
]

frontend_path = None
for path in possible_paths:
    if path.exists() and path.is_dir():
        frontend_path = path
        break

if frontend_path:
    print(f"✅ Frontend found at: {frontend_path}")
    app.mount("/", StaticFiles(directory=str(frontend_path), html=True), name="frontend")
else:
    print("❌ Frontend NOT found. Checked paths:")
    for p in possible_paths:
        print(f"   - {p} (Exists: {p.exists()})")
    
    # List directories to help debug
    try:
        print("📂 Directory listing of root:")
        for item in os.listdir(root_dir):
            print(f"  - {item}")
        if (root_dir / "frontend").exists():
            print("📂 Directory listing of frontend:")
            for item in os.listdir(root_dir / "frontend"):
                print(f"  - {item}")
    except Exception as e:
        print(f"Error listing directories: {e}")

@app.get("/debug-paths")
def debug_paths():
    """Diagnostic endpoint to inspect file system on Render"""
    import os
    current = Path.cwd()
    
    # helper to list dir safely
    def list_dir(p):
        try:
            return [x.name for x in p.iterdir()]
        except Exception as e:
            return str(e)

    structure = {
        "cwd": str(current),
        "files_in_cwd": list_dir(current),
    }
    
    # Check levels up
    try:
        root = current.parent
        structure["root"] = str(root)
        structure["files_in_root"] = list_dir(root)
        
        frontend_root = root / "frontend"
        structure["frontend_root_exists"] = frontend_root.exists()
        if frontend_root.exists():
            structure["files_in_frontend"] = list_dir(frontend_root)
            
            customer = frontend_root / "customer"
            if customer.exists():
                structure["files_in_customer"] = list_dir(customer)
                
                out = customer / "out"
                structure["out_exists"] = out.exists()
                if out.exists():
                    structure["files_in_out"] = list_dir(out)
    except Exception as e:
        structure["error"] = str(e)
        
    return structure

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.API_RELOAD,
        log_level=settings.LOG_LEVEL.lower(),
    )
