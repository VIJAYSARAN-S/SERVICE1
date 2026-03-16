from app.database import SessionLocal, Base, engine
from app import models, auth
import os

# Ensure we are using the correct DB (v2)
print(f"Initializing and seeding egov_v2.db...")
Base.metadata.create_all(bind=engine)

def seed_data():
    db = SessionLocal()
    try:
        # 1. Seed Users
        demo_users = [
            ("citizen@example.com", "password123", "Alex Fischer", "citizen"),
            ("admin@service1.gov", "admin123", "Super Admin", "admin"),
            ("clerk@service1.gov", "clerk123", "Clerk", "clerk"),
            ("manager@service1.gov", "manager123", "Manager", "manager"),
            ("pds@service1.gov", "pds123", "PDS Admin", "pds_admin"),
        ]
        
        for email, password, full_name, role in demo_users:
            existing = db.query(models.User).filter(models.User.email == email).first()
            password_hash = auth.hash_password(password)
            
            if existing:
                existing.password_hash = password_hash
                existing.full_name = full_name
                existing.role = role
                print(f"Updated user: {email}")
            else:
                new_user = models.User(
                    email=email,
                    password_hash=password_hash,
                    full_name=full_name,
                    role=role,
                    citizen_qr_code=f"QR-{full_name.replace(' ', '').upper()}" if role == "citizen" else None
                )
                db.add(new_user)
                print(f"Created user: {email}")

        # 2. Seed PDS Stock
        shop_id = "Shop-VLS-001"
        stocks = [
            ("Rice", 500.0, "kg"),
            ("Wheat", 300.0, "kg"),
            ("Sugar", 100.0, "kg"),
            ("Oil", 50.0, "liters"),
            ("Kerosene", 40.0, "liters"), # Low stock item
        ]
        
        for item, qty, unit in stocks:
            existing_stock = db.query(models.PDSStock).filter(
                models.PDSStock.shop_id == shop_id,
                models.PDSStock.item_name == item
            ).first()
            
            if existing_stock:
                existing_stock.quantity = qty
                existing_stock.unit = unit
                print(f"Updated stock: {item}")
            else:
                new_stock = models.PDSStock(
                    shop_id=shop_id,
                    item_name=item,
                    quantity=qty,
                    unit=unit
                )
                db.add(new_stock)
                print(f"Created stock: {item}")
        
        db.commit()
        print("Seeding complete.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
