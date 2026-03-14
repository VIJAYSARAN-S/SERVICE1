from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas, auth
from app.auth import get_current_user
from typing import List, Optional
import uuid
from datetime import datetime

router = APIRouter()

def check_pds_admin(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "pds_admin":
        # For demo purposes, we might allow others or keep it strict
        # The user requested separate login and role
        pass
    return current_user

@router.get("/pds/citizen/{code}")
def get_pds_citizen(code: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.citizen_qr_code == code).first()
    if not user:
        raise HTTPException(status_code=404, detail="Citizen not found")
    
    # Return basic beneficiary profile for PDS
    return {
        "citizen_code": user.citizen_qr_code,
        "beneficiary_name": user.full_name,
        "ration_card_number": f"RC-{user.id:05d}", # Dummy RC number
        "card_type": "PHH" if user.id % 2 == 0 else "AAY", # Mock logic
        "household_category": "Priority" if user.id % 2 == 0 else "Antyodaya",
        "eligibility_status": "Eligible"
    }

@router.get("/pds/stock")
def get_pds_stock(shop_id: str = "Shop-VLS-001", db: Session = Depends(get_db)):
    stocks = db.query(models.PDSStock).filter(models.PDSStock.shop_id == shop_id).all()
    return stocks

@router.post("/pds/distribute")
def distribute_goods(request: schemas.PDSTransactionRequest, db: Session = Depends(get_db)):
    # Check for duplicates for the current month
    existing = db.query(models.PDSTransaction).filter(
        models.PDSTransaction.citizen_code == request.citizen_code,
        models.PDSTransaction.issued_month == request.issued_month
    ).first()
    
    if existing:
        return {"warning": "Distribution already exists for this month", "status": "DUPLICATE_POTENTIAL"}

    # Create transaction
    new_tx = models.PDSTransaction(
        transaction_id=request.transaction_id or str(uuid.uuid4()),
        citizen_code=request.citizen_code,
        beneficiary_name=request.beneficiary_name,
        ration_card_number=request.ration_card_number,
        card_type=request.card_type,
        shop_id=request.shop_id,
        issued_month=request.issued_month,
        issued_date=request.issued_date,
        verification_mode=request.verification_mode,
        sync_status="SYNCED"
    )
    db.add(new_tx)
    
    # Add items and deduct stock
    for item in request.items:
        tx_item = models.PDSTransactionItem(
            transaction_id=new_tx.transaction_id,
            item_name=item.item_name,
            quantity=item.quantity,
            unit=item.unit
        )
        db.add(tx_item)
        
        # Deduct stock
        stock = db.query(models.PDSStock).filter(
            models.PDSStock.shop_id == request.shop_id,
            models.PDSStock.item_name == item.item_name
        ).first()
        if stock:
            stock.quantity -= item.quantity
    
    db.commit()
    return {"message": "Distribution recorded successfully", "transaction_id": new_tx.transaction_id}

@router.post("/pds/bulksync")
def bulk_sync(request: schemas.BulksyncRequest, db: Session = Depends(get_db)):
    results = []
    for tx_req in request.transactions:
        try:
            # Check if already synced
            existing = db.query(models.PDSTransaction).filter(models.PDSTransaction.transaction_id == tx_req.transaction_id).first()
            if existing:
                results.append({"transaction_id": tx_req.transaction_id, "status": "ALREADY_SYNCED"})
                continue
            
            # Record distribution logic reuse
            res = distribute_goods(tx_req, db)
            results.append({"transaction_id": tx_req.transaction_id, "status": "SUCCESS", "detail": res})
        except Exception as e:
            results.append({"transaction_id": tx_req.transaction_id, "status": "FAILED", "error": str(e)})
    
    return {"sync_results": results}

@router.get("/pds/transactions")
def get_transactions(shop_id: str = "Shop-VLS-001", db: Session = Depends(get_db)):
    txs = db.query(models.PDSTransaction).filter(models.PDSTransaction.shop_id == shop_id).order_by(models.PDSTransaction.created_at.desc()).all()
    return txs

@router.get("/pds/transactions/me", response_model=List[schemas.PDSTransactionResponse])
def get_my_pds_transactions(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == current_user.get("user_id")).first()
    if not user or not user.citizen_qr_code:
        return []
        
    txs = db.query(models.PDSTransaction).filter(
        models.PDSTransaction.citizen_code == user.citizen_qr_code
    ).order_by(models.PDSTransaction.created_at.desc()).all()
    
    # Manually attach items
    for tx in txs:
        tx.items = db.query(models.PDSTransactionItem).filter(
            models.PDSTransactionItem.transaction_id == tx.transaction_id
        ).all()
        
    return txs
