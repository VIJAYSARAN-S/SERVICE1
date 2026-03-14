import sqlite3
import os

def migrate():
    db_path = "egov.db"
    if not os.path.exists(db_path):
        print(f"Database {db_path} not found.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    print("Creating PDS tables...")

    # Create pds_transactions table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS pds_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transaction_id TEXT UNIQUE NOT NULL,
        citizen_code TEXT NOT NULL,
        beneficiary_name TEXT NOT NULL,
        ration_card_number TEXT NOT NULL,
        card_type TEXT NOT NULL,
        shop_id TEXT NOT NULL,
        issued_month TEXT NOT NULL,
        issued_date TEXT NOT NULL,
        verification_mode TEXT NOT NULL,
        sync_status TEXT DEFAULT 'SYNCED',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        synced_at DATETIME
    )
    ''')

    # Create pds_transaction_items table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS pds_transaction_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transaction_id TEXT NOT NULL,
        item_name TEXT NOT NULL,
        quantity REAL NOT NULL,
        unit TEXT NOT NULL,
        FOREIGN KEY (transaction_id) REFERENCES pds_transactions (transaction_id)
    )
    ''')

    # Create pds_stock table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS pds_stock (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        shop_id TEXT NOT NULL,
        item_name TEXT NOT NULL,
        quantity REAL DEFAULT 0.0,
        unit TEXT NOT NULL
    )
    ''')

    # Initialize some dummy stock if empty
    cursor.execute("SELECT COUNT(*) FROM pds_stock")
    if cursor.fetchone()[0] == 0:
        print("Initializing dummy stock for Shop-VLS-001...")
        stocks = [
            ('Shop-VLS-001', 'Rice', 500.0, 'kg'),
            ('Shop-VLS-001', 'Wheat', 300.0, 'kg'),
            ('Shop-VLS-001', 'Sugar', 100.0, 'kg'),
            ('Shop-VLS-001', 'Kerosene', 50.0, 'litre'),
            ('Shop-VLS-001', 'Pulses', 150.0, 'kg'),
            ('Shop-VLS-001', 'Edible Oil', 80.0, 'litre')
        ]
        cursor.executemany("INSERT INTO pds_stock (shop_id, item_name, quantity, unit) VALUES (?, ?, ?, ?)", stocks)

    conn.commit()
    conn.close()
    print("Migration completed successfully.")

if __name__ == "__main__":
    migrate()
