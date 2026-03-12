import hashlib
import json
import uuid

def generate_record_hash(data: dict) -> str:
    normalized = json.dumps(data, sort_keys=True)
    return hashlib.sha256(normalized.encode()).hexdigest()

def generate_block_ref() -> str:
    return f"BLK-{uuid.uuid4().hex[:10].upper()}"