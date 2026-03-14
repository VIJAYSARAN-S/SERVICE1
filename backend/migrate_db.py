import sqlite3
import os

def migrate():
    db_path = "egov.db"
    if not os.path.exists(db_path):
        print("Database not found. Skipping manual migration (create_all will handle it).")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Add profile_photo to users if missing
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN profile_photo TEXT")
        print("Added profile_photo to users table.")
    except sqlite3.OperationalError:
        print("profile_photo already exists in users table.")

    # Add extra_data to applications if missing
    try:
        cursor.execute("ALTER TABLE applications ADD COLUMN extra_data TEXT")
        print("Added extra_data to applications table.")
    except sqlite3.OperationalError:
        print("extra_data already exists in applications table.")

    conn.commit()
    conn.close()
    print("Migration completed.")

if __name__ == "__main__":
    migrate()
