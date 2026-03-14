import sqlite3
import os

db_path = os.path.join("backend", "egov.db")
if not os.path.exists(db_path):
    print(f"Database not found at {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("Users table:")
cursor.execute("SELECT id, full_name, role, citizen_qr_code FROM users")
for row in cursor.fetchall():
    print(f"ID: {row[0]} | Name: {row[1]} | Role: {row[2]} | QR: {repr(row[3])} | Length: {len(row[3]) if row[3] else 0}")

print("\nPDS Transactions:")
cursor.execute("SELECT * FROM pds_transactions")
for row in cursor.fetchall():
    print(row)

conn.close()
