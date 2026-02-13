"""FastAPI application entry point."""

from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from alembic.config import Config
from alembic import command
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
    
    # Run database migrations on startup - DISABLED (Handled in build step)
    # This prevents startup timeouts on Render
    """
    if settings.ENVIRONMENT == "production":
        import os
        try:
            print("🔄 Running database migrations on startup...")
            # Detect path for alembic.ini
            cwd = os.getcwd()
            original_cwd = cwd
            alembic_ini_path = "alembic.ini"
            
            try:
                # Helper to find alembic.ini
                if not os.path.exists(alembic_ini_path):
                    if os.path.exists("backend/alembic.ini"):
                        alembic_ini_path = "backend/alembic.ini"
                        os.chdir("backend")
                    elif os.path.exists("../alembic.ini"):
                        alembic_ini_path = "../alembic.ini"
                        os.chdir("..")
                
                if os.path.exists(alembic_ini_path):
                    alembic_cfg = Config(alembic_ini_path)
                    # command.upgrade(alembic_cfg, "head") # Disabled to prevent hang
                    print("✅ Skipped startup migration (handled in build)")
                else:
                    print(f"⚠️ Could not find alembic.ini in {cwd}, skipping auto-migration.")
            finally:
                os.chdir(original_cwd)
                
        except Exception as e:
            print(f"❌ Database migration check failed on startup: {e}")
            # Don't fail startup for this
            pass
    """
    
    # Start Scheduler
    from app.services.scheduler import start_scheduler
    try:
        start_scheduler()
    except Exception as e:
        print(f"⚠️ Failed to start scheduler: {e}")

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


@app.get("/api/health/migrate")
def manual_migrate(secret: str):
    """Run database migrations manually."""
    if secret != "supersecretfix":
        raise HTTPException(status_code=403, detail="Forbidden")
    
    import os
    try:
        # Check current directory
        cwd = os.getcwd()
        print(f"Running migrations from: {cwd}")
        
        # Try to find alembic.ini
        alembic_ini_path = "alembic.ini"
        if not os.path.exists(alembic_ini_path):
            # Try specific paths seen in Render
            if os.path.exists("backend/alembic.ini"):
                alembic_ini_path = "backend/alembic.ini"
                os.chdir("backend") # Change to backend dir for alembic to work correctly
            elif os.path.exists("../alembic.ini"):
                alembic_ini_path = "../alembic.ini"
                os.chdir("..")
            else:
                return {"error": f"alembic.ini not found in {cwd}"}

        alembic_cfg = Config(alembic_ini_path)
        command.upgrade(alembic_cfg, "head")
        return {"message": "Migrations executed successfully", "config_path": alembic_ini_path}
    except Exception as e:
        import traceback
        return {"error": str(e), "traceback": traceback.format_exc()}


@app.get("/api/debug-pdf")
async def debug_pdf_diagnostic():
    """Diagnostic endpoint to debug PDF generation issues (Public)."""
    results = {}
    
    # 1. Check Import
    try:
        import reportlab
        results["reportlab_version"] = reportlab.__version__
        results["import_status"] = "Success"
    except ImportError as e:
        return {"status": "error", "error": f"ImportError: {e}", "stage": "import"}
    except Exception as e:
        return {"status": "error", "error": f"Unexpected Error during import: {e}", "stage": "import"}

    # 2. Check Service Instantiation
    try:
        from app.services.pdf_service import pdf_service
        results["service_status"] = "Loaded"
    except Exception as e:
        return {"status": "error", "error": f"Service Load Error: {e}", "stage": "service_load"}
        
    # 3. Check PDF Gen (Dummy)
    try:
        buffer = pdf_service.generate_measurement_pdf(
            customer_name="Test User",
            profile_name="Test Profile",
            measurements={"chest": 40.0, "waist": 32.0},
            fit_preference="regular"
        )
        results["generation_status"] = f"Success, size={buffer.getbuffer().nbytes} bytes"
    except Exception as e:
        import traceback
        return {
            "status": "error", 
            "error": f"Generation Error: {e}", 
            "stage": "generation", 
            "trace": traceback.format_exc()
        }
        
    return results


# Import API routers
from app.api import (
    auth, users, appointments, measurements,
    branches, ml, admin, tailor, orders, invoices, search,
    analytics, fabrics, notifications, uploads, audit, tailor_registration
)

# Register API routers
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
app.include_router(audit.router, prefix="/api/audit", tags=["Audit Logs"])
app.include_router(tailor_registration.router, prefix="/api/tailor-registration", tags=["Tailor Registration"])



# Serve frontend static files (must be last to not override API routes)
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path
import os

# Define the static directory path
# Since render_start.sh cds into 'backend', this is relative to 'backend'
# OR relative to where main.py is? 
# Path(__file__) is backend/app/main.py
# Parent is backend/app
# Parent.parent is backend
# So backend/static is at Path(__file__).parent.parent / "static"

current_dir = Path(__file__).resolve().parent # backend/app
backend_dir = current_dir.parent # backend
static_dir = backend_dir / "static"

print(f"📂 Resolved Static Directory: {static_dir}")

if static_dir.exists() and static_dir.is_dir():
    print(f"✅ Static directory found. Mounting frontend...")
    # Mount / to serve static files
    # html=True allows serving index.html for /
    app.mount("/", StaticFiles(directory=str(static_dir), html=True), name="frontend")
else:
    print(f"❌ Static directory NOT found at {static_dir}")
    print("Listing backend directory:")
    try:
        for item in os.listdir(backend_dir):
            print(f" - {item}")
    except Exception as e:
        print(f"Error listing dir: {e}")

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
