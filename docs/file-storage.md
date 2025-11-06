# File Storage Documentation

## Overview
Secure cloud storage solution for medical files, reports, scans, and documents using AWS S3 or Azure Blob Storage.

## Features
- Secure file upload and download
- Medical image storage (DICOM, JPEG, PNG)
- PDF document management
- File versioning and backup
- Access control and permissions
- Encryption at rest and in transit

## Supported File Types

### Medical Images
- **DICOM**: Medical imaging standard
- **JPEG/PNG**: X-rays, scans, photos
- **TIFF**: High-resolution medical images
- **PDF**: Radiology reports, scan results

### Documents
- **PDF**: Medical reports, prescriptions
- **DOC/DOCX**: Medical documents
- **TXT**: Text-based reports
- **CSV**: Lab results, data exports

### File Size Limits
- Maximum file size: 100MB per file
- Batch upload: Up to 10 files simultaneously
- Total storage per patient: 1GB (expandable)

## Storage Architecture

### AWS S3 Configuration
```json
{
  "bucket_name": "jecsmart-medical-files",
  "region": "us-east-1",
  "storage_class": "STANDARD_IA",
  "encryption": "AES256",
  "versioning": true,
  "lifecycle_policy": {
    "transition_to_glacier": "90_days",
    "delete_after": "7_years"
  }
}
```

### Folder Structure
```
jecsmart-medical-files/
├── patients/
│   ├── {patient_id}/
│   │   ├── medical_records/
│   │   │   ├── {record_id}/
│   │   │   │   ├── images/
│   │   │   │   ├── documents/
│   │   │   │   └── reports/
│   │   ├── prescriptions/
│   │   ├── lab_results/
│   │   └── imaging/
├── hospitals/
│   ├── {hospital_id}/
│   │   ├── templates/
│   │   └── reports/
└── system/
    ├── backups/
    └── logs/
```

## API Endpoints

### File Upload
```http
POST /api/files/upload
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

{
  "file": <binary_data>,
  "patient_id": "uuid",
  "record_id": "uuid",
  "file_type": "medical_image",
  "description": "Chest X-ray"
}
```

### File Download
```http
GET /api/files/{file_id}
Authorization: Bearer <access_token>

Response: Binary file data with appropriate headers
```

### File Metadata
```http
GET /api/files/{file_id}/metadata
Authorization: Bearer <access_token>

Response:
{
  "file_id": "uuid",
  "file_name": "chest_xray.jpg",
  "file_size": 2048576,
  "mime_type": "image/jpeg",
  "upload_date": "2024-01-15T10:30:00Z",
  "uploaded_by": "Dr. Smith",
  "patient_id": "uuid",
  "record_id": "uuid"
}
```

### File List
```http
GET /api/patients/{patient_id}/files
Authorization: Bearer <access_token>

Response:
{
  "files": [
    {
      "file_id": "uuid",
      "file_name": "lab_report.pdf",
      "file_type": "document",
      "upload_date": "2024-01-15T10:30:00Z",
      "file_size": 1024000
    }
  ],
  "total_count": 25,
  "total_size": 52428800
}
```

## Security Features

### Access Control
```python
class FileAccessControl:
    def can_access_file(self, user: User, file: MedicalFile) -> bool:
        # Patient can access their own files
        if user.role == "patient" and file.patient_id == user.patient_id:
            return True
        
        # Doctor can access files of their patients
        if user.role == "doctor" and self.is_doctor_patient(user.doctor_id, file.patient_id):
            return True
        
        # Admin can access all files
        if user.role == "admin":
            return True
        
        return False
```

### Encryption
- **At Rest**: AES-256 encryption
- **In Transit**: TLS 1.3 encryption
- **Key Management**: AWS KMS or Azure Key Vault
- **File Integrity**: SHA-256 checksums

### Audit Trail
```sql
CREATE TABLE file_access_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID NOT NULL,
    user_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'upload', 'download', 'view', 'delete'
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN NOT NULL
);
```

## File Processing

### Image Processing
```python
from PIL import Image
import pydicom

class MedicalImageProcessor:
    def process_dicom(self, file_path: str) -> dict:
        """Process DICOM medical images"""
        dataset = pydicom.dcmread(file_path)
        return {
            "patient_name": dataset.PatientName,
            "study_date": dataset.StudyDate,
            "modality": dataset.Modality,
            "image_data": dataset.pixel_array
        }
    
    def generate_thumbnail(self, image_path: str) -> str:
        """Generate thumbnail for quick preview"""
        with Image.open(image_path) as img:
            img.thumbnail((200, 200))
            thumbnail_path = f"{image_path}_thumb.jpg"
            img.save(thumbnail_path)
            return thumbnail_path
```

### Document Processing
```python
import PyPDF2
from docx import Document

class DocumentProcessor:
    def extract_pdf_text(self, pdf_path: str) -> str:
        """Extract text from PDF documents"""
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            text = ""
            for page in reader.pages:
                text += page.extract_text()
            return text
    
    def process_word_document(self, docx_path: str) -> str:
        """Extract text from Word documents"""
        doc = Document(docx_path)
        return "\n".join([paragraph.text for paragraph in doc.paragraphs])
```

## Backup and Recovery

### Backup Strategy
- **Real-time replication**: Cross-region backup
- **Daily snapshots**: Point-in-time recovery
- **Weekly full backups**: Long-term storage
- **Retention policy**: 7 years for medical records

### Disaster Recovery
```python
class DisasterRecovery:
    def backup_to_secondary_region(self, file_id: str):
        """Replicate file to backup region"""
        pass
    
    def restore_from_backup(self, file_id: str, restore_point: datetime):
        """Restore file from backup"""
        pass
    
    def verify_backup_integrity(self, file_id: str) -> bool:
        """Verify backup file integrity"""
        pass
```

## Performance Optimization

### CDN Integration
- CloudFront (AWS) or Azure CDN
- Global edge locations
- Cached file delivery
- Reduced latency

### Compression
- Automatic compression for documents
- Lossless compression for medical images
- Progressive JPEG for web viewing
- ZIP archives for bulk downloads

## Compliance

### HIPAA Compliance
- Encrypted storage and transmission
- Access logging and audit trails
- Data retention policies
- Secure deletion procedures

### Medical Device Regulations
- DICOM compliance for medical images
- FDA guidelines for medical software
- ISO 27001 security standards
- SOC 2 Type II certification

## Monitoring and Alerts

### Storage Metrics
- Storage usage per patient
- Upload/download rates
- Error rates and failures
- Performance metrics

### Alerts
- Storage quota exceeded
- Failed uploads/downloads
- Security violations
- System performance issues