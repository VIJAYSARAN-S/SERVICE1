import sqlite3
import os

db_path = os.path.abspath('egov_v2.db')
print(f"Inspecting DB at: {db_path}")
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("SELECT id, email, role, full_name FROM users")
users = cursor.fetchall()
print("--- Users in DB ---")
for u in users:
    print(u)

conn.close()
