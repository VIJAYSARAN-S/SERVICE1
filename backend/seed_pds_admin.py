from app.database import SessionLocal
from app import models
from app.auth import hash_password

def create_pds_admin():
    db = SessionLocal()
    # Check if pdsadmin exists
    admin = db.query(models.User).filter(models.User.email == "pdsadmin@example.com").first()
    if not admin:
        print("Creating pdsadmin@example.com...")
        new_admin = models.User(
            full_name="Ration Shop Operator",
            email="pdsadmin@example.com",
            password_hash=hash_password("password123"),
            role="pds_admin"
        )
        db.add(new_admin)
        db.commit()
        print("PDS Admin created successfully.")
    else:
        print("PDS Admin already exists.")
    
    # Also ensure a test citizen has a QR code
    citizen = db.query(models.User).filter(models.User.email == "citizen@example.com").first()
    if citizen:
        # Assign fixed code for easy testing
        citizen.citizen_qr_code = "CS-KIOSK-A1B2C3"
        db.commit()
        print(f"Assigned {citizen.citizen_qr_code} to citizen@example.com.")
    
    db.close()

if __name__ == "__main__":
    create_pds_admin()
