def calculate_risk(device_id: str, device_match: bool):
    score = 0
    
    # Feature 6 & Feature 1 - Suspicious Device/ID Detection
    suspicious_patterns = ["unknown", "attacker", "demo-attack", "linux-bot"]
    is_suspicious = any(pattern in device_id.lower() for pattern in suspicious_patterns)
    
    if is_suspicious or device_id == "demo-attack":
        # Feature 6 - Demo Attack Mode
        score = 95 if device_id == "demo-attack" else 90
        return score, "HIGH", "LOGIN_BLOCKED"

    if not device_match:
        score += 40

    if score <= 30:
        return score, "LOW", "ALLOW"
    elif score <= 70:
        return score, "MEDIUM", "OTP_REQUIRED"
    else:
        return score, "HIGH", "BLOCK"