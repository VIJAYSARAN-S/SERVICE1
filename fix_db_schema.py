import sqlite3
import os

db_path = r'd:\C1\backend\egov.db'

if not os.path.exists(db_path):
    print(f"Error: Database file not found at {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    print("Adding 'profile_photo' column to 'users' table...")
    cursor.execute("ALTER TABLE users ADD COLUMN profile_photo TEXT")
    conn.commit()
    print("Column added successfully.")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e).lower():
        print("Column 'profile_photo' already exists.")
    else:
        print(f"Error: {e}")

conn.close()
