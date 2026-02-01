"""
Direct database setup using Python and psycopg2
Run this if Neon SQL Editor is not working
"""

import psycopg2
from psycopg2 import sql
import sys

# Database connection string
DATABASE_URL = "postgresql://neondb_owner:npg_4xwjp1crSLXq@ep-misty-paper-a1jnw19y-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

def run_setup():
    print("=" * 50)
    print("DARJI PRO - Database Setup")
    print("=" * 50)
    print()
    
    try:
        # Read SQL file
        print("📄 Reading SQL setup file...")
        with open('SIMPLE_DATABASE_SETUP.sql', 'r', encoding='utf-8') as f:
            sql_script = f.read()
        
        print("✓ SQL file loaded")
        print()
        
        # Connect to database
        print("🔌 Connecting to Neon database...")
        conn = psycopg2.connect(DATABASE_URL)
        conn.autocommit = True
        cursor = conn.cursor()
        
        print("✓ Connected successfully")
        print()
        
        # Execute SQL script
        print("⚙️  Executing SQL setup script...")
        print("-" * 50)
        
        cursor.execute(sql_script)
        
        print("-" * 50)
        print("✓ SQL executed successfully")
        print()
        
        # Verify tables created
        print("🔍 Verifying tables...")
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        """)
        
        tables = cursor.fetchall()
        print(f"✓ Found {len(tables)} tables:")
        for table in tables:
            print(f"  - {table[0]}")
        
        print()
        print("=" * 50)
        print("✅ DATABASE SETUP COMPLETE!")
        print("=" * 50)
        print()
        print("You can now test registration at:")
        print("https://darji-pro.onrender.com/register")
        
        cursor.close()
        conn.close()
        
        return True
        
    except FileNotFoundError:
        print("❌ Error: SIMPLE_DATABASE_SETUP.sql not found!")
        print("Make sure you're running this from the project root directory.")
        return False
        
    except psycopg2.Error as e:
        print(f"❌ Database Error: {e}")
        print()
        print("Possible issues:")
        print("1. Database is sleeping - wait 30 seconds and try again")
        print("2. Connection string is incorrect")
        print("3. Network/firewall blocking connection")
        return False
        
    except Exception as e:
        print(f"❌ Unexpected Error: {e}")
        return False

if __name__ == "__main__":
    print()
    success = run_setup()
    print()
    
    if not success:
        sys.exit(1)
    
    input("Press Enter to exit...")
