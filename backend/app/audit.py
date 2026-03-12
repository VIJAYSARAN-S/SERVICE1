from app.models import AuditLog

def create_audit_log(db, event: str, details: str = ""):
    log = AuditLog(event=event, details=details)
    db.add(log)
    db.commit()
    db.refresh(log)
    return log