import sqlite3
import os

db_path = r'd:\C1\backend\egov.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("SELECT id, email, role FROM users")
users = cursor.fetchall()
print("--- Users in DB ---")
for u in users:
    print(u)

conn.close()
