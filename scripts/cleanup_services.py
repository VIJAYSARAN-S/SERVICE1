from app.database import SessionLocal
from app import models

def cleanup_data():
    db = SessionLocal()
    try:
        # Get application IDs for the services to be removed
        services_to_remove = ["death_certificate", "trade_license"]
        
        applications = db.query(models.Application).filter(models.Application.service_type.in_(services_to_remove)).all()
        app_ids = [app.application_id for app in applications]
        
        if not app_ids:
            print("No matching applications found to delete.")
            return

        print(f"Found {len(app_ids)} applications to delete: {app_ids}")

        # Delete related integrity ledger entries
        ledger_count = db.query(models.IntegrityLedger).filter(models.IntegrityLedger.application_id.in_(app_ids)).delete(synchronize_session=False)
        print(f"Deleted {ledger_count} integrity ledger entries.")

        # Delete the applications
        app_count = db.query(models.Application).filter(models.Application.application_id.in_(app_ids)).delete(synchronize_session=False)
        print(f"Deleted {app_count} applications.")

        db.commit()
    except Exception as e:
        print(f"Error during cleanup: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    cleanup_data()
