import sqlite3
import os

db_path = r'd:\C1\backend\egov.db'

if not os.path.exists(db_path):
    print(f"Error: Database file not found at {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get list of tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()

print(f"--- Database Tables in {db_path} ---")
for table_name in tables:
    name = table_name[0]
    if name == 'sqlite_sequence': continue
    print(f"\nTable: {name}")
    
    # Get column names
    cursor.execute(f"PRAGMA table_info({name})")
    cols = [col[1] for col in cursor.fetchall()]
    print(f"Columns: {', '.join(cols)}")
    
    # Get data
    cursor.execute(f"SELECT * FROM {name} LIMIT 10")
    rows = cursor.fetchall()
    if rows:
        for row in rows:
            print(f"  {row}")
    else:
        print("  (Empty)")

conn.close()
