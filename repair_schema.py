import sqlite3
import os

db_path = os.path.join("backend", "egov.db")

if not os.path.exists(db_path):
    print(f"Error: Database not found at {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

def add_column_if_missing(table, column, col_type):
    try:
        cursor.execute(f"ALTER TABLE {table} ADD COLUMN {column} {col_type}")
        print(f"Added column '{column}' to table '{table}'.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print(f"Column '{column}' already exists in table '{table}'.")
        else:
            print(f"Error adding column '{column}': {e}")

print("Repairing 'users' table schema...")
add_column_if_missing("users", "profile_photo", "TEXT")
add_column_if_missing("users", "citizen_qr_code", "TEXT")
add_column_if_missing("users", "created_at", "DATETIME DEFAULT CURRENT_TIMESTAMP")

conn.commit()
conn.close()
print("Schema repair completed.")
