import os
import sys
import subprocess
from pathlib import Path
from alembic.config import Config
from alembic import command

def run_migrations():
    print("🚀 Starting Deployment Script...")
    
    # robustly determine backend directory
    current_file = Path(__file__).resolve()
    backend_dir = current_file.parent
    root_dir = backend_dir.parent
    
    print(f"📂 Script Location: {current_file}")
    print(f"📂 Backend Directory: {backend_dir}")
    print(f"📂 Root Directory: {root_dir}")
    
    # Change into backend directory ensuring context is correct
    os.chdir(backend_dir)
    print(f"✅ Changed working directory to: {os.getcwd()}")
    
    # Verify alembic.ini
    alembic_cfg_path = backend_dir / "alembic.ini"
    if not alembic_cfg_path.exists():
        print(f"❌ ERROR: alembic.ini not found at {alembic_cfg_path}")
        print("Contents of backend directory:")
        for item in os.listdir(backend_dir):
            print(f" - {item}")
        sys.exit(1)
    else:
        print(f"✅ Found alembic.ini at {alembic_cfg_path}")

    # Verify database URL
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        print("❌ CRITICAL: DATABASE_URL environment variable is not set!")
        sys.exit(1)
    else:
        print("✅ DATABASE_URL is set (masked)")
        
    try:
        # Run DB Fix (Fix State)
        print("\n--- Running DB State Fix ---")
        # We can import it directly since we are in backend dir
        sys.path.append(str(backend_dir))
        try:
            from fix_db_state import fix_state
            fix_state()
            print("✅ DB State Fix completed")
        except ImportError as e:
            print(f"⚠️ Could not import fix_db_state: {e}")
        except Exception as e:
            print(f"⚠️ DB State Fix failed (continuing): {e}")

        # Run Alembic Migrations
        print("\n--- Running Alembic Migrations ---")
        alembic_cfg = Config(str(alembic_cfg_path))
        # Important: set main option 'script_location' to absolute path
        # script_location in ini is usually 'alembic' (relative)
        # If we are in backend dir, it should resolve to backend/alembic
        # We don't overwrite it, assuming chdir works.
        
        command.upgrade(alembic_cfg, "head")
        print("✅ Database migrations applied successfully!")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        # We might want to exit here, or continue if it's a non-critical error
        # usually migration failure is critical
        sys.exit(1)

    # Start Uvicorn
    print("\n--- Starting Uvicorn Server ---")
    port = os.environ.get("PORT", "10000")
    
    # Using subprocess to replace current process is cleaner for signals, but call is fine
    # cmd = f"uvicorn app.main:app --host 0.0.0.0 --port {port}"
    # os.system(cmd)
    
    # Better: Use exec to replace process
    os.environ["PORT"] = port
    
    # We need to make sure 'app' module is importable.
    # We are in 'backend/'. 'app' is in 'backend/app'.
    # So 'import app.main' works.
    
    command = [
        "uvicorn",
        "app.main:app",
        "--host", "0.0.0.0",
        "--port", port
    ]
    
    print(f"Executing: {' '.join(command)}")
    # Flush stdout before replacing process
    sys.stdout.flush()
    
    # Replace current process with uvicorn
    if sys.platform == 'win32':
        subprocess.run(command)
    else:
        os.execvp("uvicorn", command)

if __name__ == "__main__":
    run_migrations()
