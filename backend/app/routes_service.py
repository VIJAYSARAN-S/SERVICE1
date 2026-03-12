from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
import uuid

from app.database import get_db
from app import models, schemas
from app.auth import get_current_user
from app.blockchain import generate_record_hash, generate_block_ref
from app.qr_utils import generate_qr_file
from app.audit import create_audit_log

router = APIRouter(prefix="/services", tags=["Citizen Services"])

@router.post("/birth-certificate")
def apply_birth_certificate(
    payload: schemas.ApplicationRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    application_id = f"BC-{uuid.uuid4().hex[:8].upper()}"

    application = models.Application(
        application_id=application_id,
        user_id=current_user["user_id"],
        service_type="birth_certificate",
        applicant_name=payload.applicant_name,
        dob=payload.dob,
        parent_name=payload.parent_name,
        address=payload.address,
        phone=payload.phone,
        status="Pending"
    )

    db.add(application)
    db.commit()
    db.refresh(application)

    record_data = {
        "application_id": application.application_id,
        "applicant_name": application.applicant_name,
        "dob": application.dob,
        "parent_name": application.parent_name,
        "address": application.address,
        "phone": application.phone,
        "status": application.status
    }

    record_hash = generate_record_hash(record_data)
    block_ref = generate_block_ref()

    ledger = models.IntegrityLedger(
        application_id=application.application_id,
        record_hash=record_hash,
        block_ref=block_ref
    )
    db.add(ledger)
    db.commit()

    qr_path = generate_qr_file(
        application_id=application.application_id,
        service_type=application.service_type,
        record_hash=record_hash,
        timestamp=str(datetime.utcnow())
    )

    create_audit_log(
        db,
        "BIRTH_CERTIFICATE_APPLIED",
        f"Application created: {application.application_id}"
    )

    return {
        "message": "Birth certificate application submitted successfully",
        "application_id": application.application_id,
        "status": application.status,
        "blockchain_integrity": {
            "record_hash": record_hash,
            "block_ref": block_ref,
            "integrity_status": "VALID"
        },
        "qr_code_path": qr_path
    }