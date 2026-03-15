from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: Optional[str] = "citizen"

class LoginRequest(BaseModel):
    email: str
    password: str
    device_id: Optional[str] = None

class OTPVerifyRequest(BaseModel):
    email: EmailStr
    otp_code: str

class ApplicationRequest(BaseModel):
    applicant_name: str
    dob: str
    father_name: str
    mother_name: str
    gender: str
    place_of_birth: str
    hospital_name: str
    address: str
    phone: str
    # Documents
    doctor_certificate_base64: Optional[str] = None
    parent_aadhaar_base64: Optional[str] = None

class PassportApplicationRequest(BaseModel):
    # Personal Info
    full_name_aadhaar: str
    dob: str
    gender: str
    marital_status: str
    nationality: str
    aadhaar_number: str
    pan_number: Optional[str] = None
    mobile_number: str
    email_address: str
    
    # Address
    permanent_address: str
    city: str
    state: str
    pin_code: str
    
    # Parent Details
    father_name: str
    mother_name: str
    
    # Contact & Type
    emergency_contact: str
    passport_type: str # Normal / Tatkal
    
    # File Base64 (simplified for this demo)
    photo_base64: Optional[str] = None
    signature_base64: Optional[str] = None

class DrivingLicenseRequest(BaseModel):
    # Personal Information
    full_name: str
    dob: str
    gender: str
    blood_group: str
    mobile_number: str
    
    # Identity Verification
    aadhaar_number: str
    pan_number: Optional[str] = None
    
    # Address
    residential_address: str
    city: str
    state: str
    pin_code: str
    
    # Driving Details
    vehicle_type: str # two wheeler / four wheeler / heavy vehicle
    gear_type: str # with gear / without gear
    license_type: str # Learner License Number / permanent license
    
    # Health Declaration
    vision_status: str # has myopia / hypermeteropia / clear eyesight
    is_disabled: str # Yes / No

class VoterIDRequest(BaseModel):
    # Personal Information
    full_name: str
    dob: str
    gender: str
    
    # Identity Verification
    aadhaar_number: str
    mobile_number: str
    photo_base64: Optional[str] = None
    signature_base64: Optional[str] = None
    
    # Address
    residential_address: str
    city: str
    state: str
    pin_code: str
    constituency: Optional[str] = None
    
    # Family Details
    guardian_name: str # Father / Mother / Spouse

class MarriageCertificateRequest(BaseModel):
    # Groom Details
    groom_name: str
    groom_dob: str
    groom_age: int
    groom_occupation: str
    groom_aadhaar: str
    groom_address: str
    # Bride Details
    bride_name: str
    bride_dob: str
    bride_age: int
    bride_occupation: str
    bride_aadhaar: str
    bride_address: str
    # Marriage Details
    marriage_date: str
    marriage_place: str
    marriage_type: str # Hindu / Muslim / Christian / Special Marriage Act
    registration_district: str
    # Witness Details
    witness1_name: str
    witness1_address: str
    witness2_name: str
    witness2_address: str

class IncomeCertificateRequest(BaseModel):
    # Personal Info
    full_name: str
    dob: str
    gender: str
    aadhaar_number: str
    mobile_number: str
    # Address
    residential_address: str
    district: str
    state: str
    pin_code: str
    # Family Information
    father_name: str
    mother_name: str
    family_members_count: int
    # Income Details
    occupation: str
    annual_income: float
    employer_name: str
    purpose: str # Scholarship/Government Scheme/Education/Other

class CommunityCertificateRequest(BaseModel):
    # Personal Info
    full_name: str
    dob: str
    gender: str
    aadhaar_number: str
    mobile_number: str
    # Address
    residential_address: str
    district: str
    state: str
    pin_code: str
    # Family Details
    father_name: str
    mother_name: str
    father_community: str
    father_caste: str
    mother_community: str
    mother_caste: str
    # Community Information
    requested_category: str # SC/ST/OBC/General
    # Verification
    parent_certificate_base64: str

class BuildingPermitRequest(BaseModel):
    # Applicant Information
    applicant_name: str
    aadhaar_number: str
    mobile_number: str
    email: EmailStr
    # Property Details
    land_owner_name: str
    property_address: str
    survey_number: str
    land_area: str
    # Building Details
    building_type: str # Residential / Commercial
    floors_count: int
    built_up_area: str
    plan_approval_id: str
    # Contractor Details
    builder_name: str
    license_number: str
    # Supporting Info
    ownership_proof_base64: Optional[str] = None
    construction_start_date: str

class DecisionRequest(BaseModel):
    remark: Optional[str] = None

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordUpdateRequest(BaseModel):
    email: EmailStr
    otp_code: str
    new_password: str

# PDS Schemas
class PDSItemBase(BaseModel):
    item_name: str
    quantity: float
    unit: str

class PDSTransactionRequest(BaseModel):
    transaction_id: str
    citizen_code: str
    beneficiary_name: str
    ration_card_number: str
    card_type: str
    shop_id: str
    issued_month: str
    issued_date: str
    verification_mode: str
    items: list[PDSItemBase]
    sync_status: Optional[str] = "SYNCED"

class BulksyncRequest(BaseModel):
    transactions: list[PDSTransactionRequest]

class PDSItemResponse(PDSItemBase):
    id: int
    transaction_id: str

    class Config:
        from_attributes = True

class PDSTransactionResponse(BaseModel):
    transaction_id: str
    citizen_code: str
    beneficiary_name: str
    ration_card_number: str
    card_type: str
    shop_id: str
    issued_month: str
    issued_date: str
    verification_mode: str
    sync_status: str
    created_at: datetime
    items: List[PDSItemResponse]

    class Config:
        from_attributes = True
class PDSSummaryResponse(BaseModel):
    issued_today: int
    queue_status: str
    total_stock_items: int
    low_stock_items: int

    class Config:
        from_attributes = True
