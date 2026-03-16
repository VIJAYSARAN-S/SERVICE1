import sqlite3
import os

db_path = 'egov_v2.db'

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN citizen_qr_code VARCHAR")
        print("Successfully added citizen_qr_code column to users table.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print("Column citizen_qr_code already exists.")
        else:
            print(f"Error adding column: {e}")
            
    conn.commit()
    conn.close()
else:
    print(f"Database {db_path} not found.")
