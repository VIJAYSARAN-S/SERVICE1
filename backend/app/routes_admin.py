from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.auth import get_current_user
from typing import List

router = APIRouter(prefix="/admin", tags=["Admin Services"])

def get_admin_user(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized. Admin role required.")
    return current_user

@router.get("/applications")
def list_applications(
    db: Session = Depends(get_db),
    admin_user: dict = Depends(get_admin_user)
):
    apps = db.query(models.Application).all()
    return {"applications": apps}

@router.get("/login-logs")
def list_login_logs(
    db: Session = Depends(get_db),
    admin_user: dict = Depends(get_admin_user)
):
    logs = db.query(models.LoginLog).all()
    return {"login_logs": logs}

@router.get("/audit-logs")
def list_audit_logs(
    db: Session = Depends(get_db),
    admin_user: dict = Depends(get_admin_user)
):
    logs = db.query(models.AuditLog).all()
    return {"audit_logs": logs}
