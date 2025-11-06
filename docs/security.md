# Security Documentation

## Overview
Comprehensive security implementation for the JECSmart Patient Health Card System ensuring HIPAA compliance and data protection.

## Security Architecture

### Defense in Depth
- **Application Layer**: Input validation, authentication, authorization
- **Network Layer**: TLS encryption, VPN access, firewall rules
- **Data Layer**: Encryption at rest, database security, backup encryption
- **Infrastructure Layer**: Secure hosting, monitoring, incident response

## Authentication & Authorization

### JWT Token Security
```python
class JWTSecurity:
    def __init__(self):
        self.access_token_expire = timedelta(minutes=15)
        self.refresh_token_expire = timedelta(days=7)
        self.algorithm = "HS256"
    
    def create_access_token(self, data: dict) -> str:
        to_encode = data.copy()
        expire = datetime.utcnow() + self.access_token_expire
        to_encode.update({"exp": expire, "type": "access"})
        return jwt.encode(to_encode, SECRET_KEY, algorithm=self.algorithm)
    
    def verify_token(self, token: str) -> dict:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[self.algorithm])
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(401, "Token expired")
        except jwt.JWTError:
            raise HTTPException(401, "Invalid token")
```

### Role-Based Access Control (RBAC)
```python
class RolePermissions:
    PERMISSIONS = {
        "patient": [
            "read:own_profile",
            "update:own_profile",
            "read:own_medical_records",
            "read:own_prescriptions"
        ],
        "doctor": [
            "read:patient_profiles",
            "update:patient_records",
            "create:prescriptions",
            "read:medical_records",
            "create:medical_records"
        ],
        "hospital_staff": [
            "read:patient_profiles",
            "update:patient_basic_info",
            "create:appointments",
            "read:appointments"
        ],
        "admin": [
            "read:all",
            "write:all",
            "delete:all",
            "manage:users",
            "manage:system"
        ]
    }
    
    def has_permission(self, user_role: str, permission: str) -> bool:
        return permission in self.PERMISSIONS.get(user_role, [])
```

## Data Encryption

### Encryption at Rest
```python
from cryptography.fernet import Fernet
import base64

class DataEncryption:
    def __init__(self, key: bytes):
        self.cipher_suite = Fernet(key)
    
    def encrypt_sensitive_data(self, data: str) -> str:
        """Encrypt sensitive patient data"""
        encrypted_data = self.cipher_suite.encrypt(data.encode())
        return base64.b64encode(encrypted_data).decode()
    
    def decrypt_sensitive_data(self, encrypted_data: str) -> str:
        """Decrypt sensitive patient data"""
        encrypted_bytes = base64.b64decode(encrypted_data.encode())
        decrypted_data = self.cipher_suite.decrypt(encrypted_bytes)
        return decrypted_data.decode()
```

### Database Encryption
```sql
-- Enable transparent data encryption
ALTER DATABASE jecsmart_db SET encryption = 'AES256';

-- Encrypt sensitive columns
CREATE TABLE patients (
    patient_id UUID PRIMARY KEY,
    -- Encrypted fields
    ssn_encrypted BYTEA, -- Social Security Number
    medical_history_encrypted BYTEA,
    -- Regular fields
    full_name VARCHAR(150),
    email VARCHAR(150)
);
```

### File Encryption
```python
class FileEncryption:
    def encrypt_file(self, file_path: str, key: bytes) -> str:
        """Encrypt medical files before storage"""
        with open(file_path, 'rb') as file:
            file_data = file.read()
        
        cipher_suite = Fernet(key)
        encrypted_data = cipher_suite.encrypt(file_data)
        
        encrypted_path = f"{file_path}.encrypted"
        with open(encrypted_path, 'wb') as encrypted_file:
            encrypted_file.write(encrypted_data)
        
        return encrypted_path
```

## Network Security

### TLS Configuration
```python
# FastAPI TLS configuration
import ssl

ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
ssl_context.load_cert_chain('cert.pem', 'key.pem')
ssl_context.minimum_version = ssl.TLSVersion.TLSv1_3

# Run with HTTPS
uvicorn.run(
    app,
    host="0.0.0.0",
    port=443,
    ssl_context=ssl_context
)
```

### API Security Headers
```python
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

# Security headers middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = "default-src 'self'"
    return response

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://app.jecsmart.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)
```

## Input Validation & Sanitization

### Request Validation
```python
from pydantic import BaseModel, validator, EmailStr
import re

class UserRegistration(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str]
    password: str
    
    @validator('full_name')
    def validate_name(cls, v):
        if not re.match(r'^[a-zA-Z\s]+$', v):
            raise ValueError('Name must contain only letters and spaces')
        if len(v) < 2 or len(v) > 150:
            raise ValueError('Name must be between 2 and 150 characters')
        return v
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain digit')
        return v
```

### SQL Injection Prevention
```python
# Use parameterized queries
async def get_patient_by_id(patient_id: str) -> Patient:
    query = """
        SELECT * FROM patients 
        WHERE patient_id = $1 AND is_active = true
    """
    result = await database.fetch_one(query, patient_id)
    return Patient(**result) if result else None
```

## NFC Card Security

### Card Authentication
```python
class NFCCardSecurity:
    def authenticate_card(self, card_data: bytes, signature: bytes) -> bool:
        """Verify card authenticity using digital signature"""
        public_key = self.get_card_public_key()
        try:
            public_key.verify(signature, card_data, padding.PKCS1v15(), hashes.SHA256())
            return True
        except InvalidSignature:
            return False
    
    def encrypt_card_data(self, patient_data: dict) -> bytes:
        """Encrypt data before writing to NFC card"""
        json_data = json.dumps(patient_data)
        return self.cipher_suite.encrypt(json_data.encode())
```

### Card Access Control
```python
class CardAccessControl:
    def verify_reader_authorization(self, reader_id: str, hospital_id: str) -> bool:
        """Verify NFC reader is authorized for hospital"""
        query = """
            SELECT COUNT(*) FROM authorized_readers 
            WHERE reader_id = $1 AND hospital_id = $2 AND is_active = true
        """
        result = await database.fetch_val(query, reader_id, hospital_id)
        return result > 0
```

## Audit Logging

### Security Event Logging
```python
class SecurityLogger:
    def log_authentication_attempt(self, email: str, success: bool, ip_address: str):
        """Log authentication attempts"""
        log_entry = {
            "event_type": "authentication",
            "email": email,
            "success": success,
            "ip_address": ip_address,
            "timestamp": datetime.utcnow(),
            "user_agent": request.headers.get("User-Agent")
        }
        self.write_security_log(log_entry)
    
    def log_data_access(self, user_id: str, resource_type: str, resource_id: str):
        """Log data access events"""
        log_entry = {
            "event_type": "data_access",
            "user_id": user_id,
            "resource_type": resource_type,
            "resource_id": resource_id,
            "timestamp": datetime.utcnow()
        }
        self.write_security_log(log_entry)
```

### Audit Trail Database
```sql
CREATE TABLE security_audit_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL,
    user_id UUID,
    resource_type VARCHAR(50),
    resource_id UUID,
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN,
    error_message TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_security_logs_timestamp ON security_audit_logs(timestamp);
CREATE INDEX idx_security_logs_user_id ON security_audit_logs(user_id);
CREATE INDEX idx_security_logs_event_type ON security_audit_logs(event_type);
```

## Incident Response

### Security Monitoring
```python
class SecurityMonitor:
    def detect_suspicious_activity(self, user_id: str):
        """Detect suspicious user activity"""
        # Multiple failed login attempts
        failed_logins = self.count_failed_logins(user_id, hours=1)
        if failed_logins > 5:
            self.trigger_account_lockout(user_id)
        
        # Unusual access patterns
        if self.detect_unusual_access_pattern(user_id):
            self.alert_security_team(user_id)
    
    def trigger_security_alert(self, alert_type: str, details: dict):
        """Trigger security incident alert"""
        alert = {
            "type": alert_type,
            "severity": "HIGH",
            "details": details,
            "timestamp": datetime.utcnow()
        }
        self.send_alert_to_security_team(alert)
```

## Compliance

### HIPAA Compliance Checklist
- ✅ Data encryption at rest and in transit
- ✅ Access controls and user authentication
- ✅ Audit logging and monitoring
- ✅ Data backup and recovery procedures
- ✅ Employee training and access management
- ✅ Business associate agreements
- ✅ Risk assessment and management
- ✅ Incident response procedures

### Data Privacy Controls
```python
class PrivacyControls:
    def anonymize_patient_data(self, patient_data: dict) -> dict:
        """Anonymize patient data for research/analytics"""
        anonymized = patient_data.copy()
        anonymized['patient_id'] = self.generate_anonymous_id()
        anonymized.pop('full_name', None)
        anonymized.pop('email', None)
        anonymized.pop('phone', None)
        return anonymized
    
    def handle_data_deletion_request(self, patient_id: str):
        """Handle patient data deletion request (Right to be forgotten)"""
        # Mark data for deletion
        # Maintain audit trail
        # Notify relevant systems
        pass
```

## Security Testing

### Penetration Testing
- Regular security assessments
- Vulnerability scanning
- Code security reviews
- Third-party security audits

### Security Metrics
- Authentication success/failure rates
- Data access patterns
- Security incident frequency
- Compliance audit results