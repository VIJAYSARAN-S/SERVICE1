import qrcode
import os
import json

# WARNING: Local file storage is ephemeral on Render.
# For production, use cloud storage (S3/GCS/Vercel Blob).

def generate_qr_file(application_id: str, service_type: str, record_hash: str, timestamp: str):
    qr_folder = "qr_codes"
    os.makedirs(qr_folder, exist_ok=True)

    payload = {
        "application_id": application_id,
        "service_type": service_type,
        "record_hash": record_hash,
        "timestamp": timestamp
    }

    file_path = os.path.join(qr_folder, f"{application_id}.png")
    img = qrcode.make(json.dumps(payload))
    img.save(file_path)
    return file_path

def generate_simple_qr(data: str, filename: str):
    qr_folder = "qr_codes"
    os.makedirs(qr_folder, exist_ok=True)
    
    file_path = os.path.join(qr_folder, f"{filename}.png")
    img = qrcode.make(data)
    img.save(file_path)
    return file_path