import sqlite3

db_path = "egov_v2.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("SELECT email, role FROM users")
users = cursor.fetchall()
print("--- Login Details (Emails & Roles) ---")
for email, role in users:
    print(f"Email: {email} | Role: {role}")

conn.close()
