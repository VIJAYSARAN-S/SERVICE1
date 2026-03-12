import sqlite3
import os

def migrate():
    db_path = 'egov.db'
    if not os.path.exists(db_path):
        print("Database not found.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Get existing columns
        cursor.execute("PRAGMA table_info(users)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'failed_attempts' not in columns:
            print("Adding failed_attempts column...")
            cursor.execute("ALTER TABLE users ADD COLUMN failed_attempts INTEGER DEFAULT 0")
        
        if 'lock_until' not in columns:
            print("Adding lock_until column...")
            cursor.execute("ALTER TABLE users ADD COLUMN lock_until DATETIME")
            
        conn.commit()
        print("Migration successful.")
    except Exception as e:
        print(f"Migration failed: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
