import os
import sys
from sqlalchemy import create_engine, inspect, text
from alembic.config import Config
from alembic import command

def fix_state():
    # Get database URL from environment
    database_url = os.environ.get("DATABASE_URL")
    if not database_url:
        print("DATABASE_URL not set")
        sys.exit(1)
    
    # Ensure correct protocol for SQLAlchemy (Sync)
    if "+asyncpg" in database_url:
        database_url = database_url.replace("+asyncpg", "")
        
    # Ensure sslmode=require for Neon if missing (and not local)
    if "sslmode" not in database_url and "localhost" not in database_url and "127.0.0.1" not in database_url:
        separator = "&" if "?" in database_url else "?"
        database_url = f"{database_url}{separator}sslmode=require"

    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)

    # Inspect database
    try:
        engine = create_engine(database_url)
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        print(f"Current tables in DB: {tables}")
    except Exception as e:
        print(f"Error inspecting database: {e}")
        return

    # Check Alembic version
    current_ver = None
    if 'alembic_version' in tables:
        try:
            with engine.connect() as conn:
                result = conn.execute(text("SELECT version_num FROM alembic_version"))
                current_ver = result.scalar()
                print(f"Current Alembic version: {current_ver}")
        except Exception as e:
            print(f"Error reading alembic_version: {e}")

    # Set up Alembic config
    alembic_cfg = Config("alembic.ini")

    # Decision logic
    if 'orders' in tables:
        # If orders table exists, we are at least at 002
        if current_ver != '002_orders_invoices' and current_ver != '003_tailor_registration':
            print("Found 'orders' table. Stamping 002_orders_invoices...")
            command.stamp(alembic_cfg, "002_orders_invoices")
        else:
             print("Schema seems consistent with migration history (002+).")

    elif 'users' in tables:
        # If users table exists but not orders, we are at 001
        if current_ver != '001_initial':
            print("Found 'users' table (no orders). Stamping 001_initial...")
            command.stamp(alembic_cfg, "001_initial")
        else:
             print("Schema seems consistent with migration history (001).")
    
    else:
        print("No 'users' table found. Assuming fresh database.")

if __name__ == "__main__":
    fix_state()
