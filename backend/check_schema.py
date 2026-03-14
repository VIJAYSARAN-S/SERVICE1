import sqlite3
conn = sqlite3.connect("egov.db")
cursor = conn.cursor()
cursor.execute("PRAGMA table_info(applications)")
for row in cursor.fetchall():
    print(row)
conn.close()
