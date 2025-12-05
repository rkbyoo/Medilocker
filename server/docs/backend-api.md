# Backend API Documentation

## Overview
FastAPI-based backend service providing RESTful APIs for the JECSmart Patient Health Card System.

## Technology Stack
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL
- **File Storage**: AWS S3 / Azure Blob Storage
- **Authentication**: JWT/OAuth2
- **Documentation**: OpenAPI/Swagger
- **Deployment**: Docker + Kubernetes

## API Architecture

### Base URL
```
Production: https://api.jecsmart.com
Development: http://localhost:8000
```

### Authentication
All protected endpoints require JWT Bearer token:
```http
Authorization: Bearer <access_token>
```

## Core Modules

### Authentication API
```python
@router.post("/auth/register")
async def register_user(user_data: UserCreate) -> UserResponse:
    """Register a new user"""
    
@router.post("/auth/login")
async def login(credentials: LoginRequest) -> TokenResponse:
    """Authenticate user and return tokens"""
    
@router.post("/auth/refresh")
async def refresh_token(refresh_data: RefreshRequest) -> TokenResponse:
    """Refresh access token"""
```

### Patient Management API
```python
@router.get("/patients/{patient_id}")
async def get_patient(patient_id: str) -> PatientResponse:
    """Get patient details"""
    
@router.put("/patients/{patient_id}")
async def update_patient(patient_id: str, data: PatientUpdate) -> PatientResponse:
    """Update patient information"""
    
@router.get("/patients/{patient_id}/medical-history")
async def get_medical_history(patient_id: str) -> List[MedicalRecord]:
    """Get patient medical history"""
```

### Prescription API
```python
@router.post("/prescriptions")
async def create_prescription(prescription: PrescriptionCreate) -> PrescriptionResponse:
    """Create new prescription"""
    
@router.get("/prescriptions/{prescription_id}")
async def get_prescription(prescription_id: str) -> PrescriptionResponse:
    """Get prescription details"""
    
@router.get("/patients/{patient_id}/prescriptions")
async def get_patient_prescriptions(patient_id: str) -> List[PrescriptionResponse]:
    """Get all prescriptions for a patient"""
```

### Medical Records API
```python
@router.post("/medical-records")
async def create_medical_record(record: MedicalRecordCreate) -> MedicalRecordResponse:
    """Create new medical record"""
    
@router.get("/medical-records/{record_id}")
async def get_medical_record(record_id: str) -> MedicalRecordResponse:
    """Get medical record details"""
    
@router.post("/medical-records/{record_id}/attachments")
async def upload_attachment(record_id: str, file: UploadFile) -> AttachmentResponse:
    """Upload medical record attachment"""
```

## Data Models

### User Model
```python
class User(BaseModel):
    user_id: UUID
    full_name: str
    email: EmailStr
    phone: Optional[str]
    role: UserRole
    created_at: datetime
    updated_at: datetime
```

### Patient Model
```python
class Patient(BaseModel):
    patient_id: UUID
    user_id: UUID
    date_of_birth: date
    blood_group: str
    emergency_contact: str
    allergies: List[str]
    chronic_conditions: List[str]
    insurance_info: Optional[InsuranceInfo]
```

### Prescription Model
```python
class Prescription(BaseModel):
    prescription_id: UUID
    patient_id: UUID
    doctor_id: UUID
    medications: List[Medication]
    diagnosis: str
    instructions: str
    created_at: datetime
    valid_until: date
```

## File Storage Integration

### Upload Medical Files
```python
@router.post("/files/upload")
async def upload_file(
    file: UploadFile,
    patient_id: str,
    file_type: FileType
) -> FileUploadResponse:
    """Upload medical files to S3/Blob storage"""
```

### Download Medical Files
```python
@router.get("/files/{file_id}")
async def download_file(file_id: str) -> FileResponse:
    """Download medical files with secure access"""
```

## Database Schema

### Core Tables
- `users` - User authentication and basic info
- `patients` - Patient-specific medical data
- `doctors` - Doctor profiles and specializations
- `prescriptions` - Prescription records
- `medical_records` - Medical history and reports
- `appointments` - Appointment scheduling
- `files` - File metadata and storage references

## Security Features
- JWT-based authentication
- Role-based access control (RBAC)
- Input validation with Pydantic
- SQL injection prevention
- Rate limiting
- CORS configuration
- HTTPS enforcement

## API Documentation
- Interactive Swagger UI: `/docs`
- ReDoc documentation: `/redoc`
- OpenAPI JSON: `/openapi.json`

## Error Handling
```python
class APIException(Exception):
    def __init__(self, status_code: int, detail: str):
        self.status_code = status_code
        self.detail = detail

# Standard error responses
{
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "Invalid input data",
        "details": {...}
    }
}
```

## Performance Features
- Database connection pooling
- Redis caching for frequent queries
- Async/await for non-blocking operations
- Background tasks for heavy operations
- Database query optimization

## Monitoring and Logging
- Structured logging with correlation IDs
- Health check endpoints
- Metrics collection (Prometheus)
- Error tracking (Sentry)
- Performance monitoring