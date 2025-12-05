# Backend Integration Guide

This guide provides comprehensive information for backend developers to integrate with the Medical Management Desktop Client.

## Table of Contents

- [Overview](#overview)
- [Sample Data Reference](#sample-data-reference)
- [API Requirements](#api-requirements)
- [Database Schema](#database-schema)
- [Authentication & Authorization](#authentication--authorization)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [Deployment Considerations](#deployment-considerations)

## Overview

The desktop client expects a REST API backend that handles:
- User authentication and authorization
- Patient management (CRUD operations)
- Appointment scheduling and management
- Medical records management
- Data validation and business logic

## Sample Data Reference

The `src/sampleDummyData/dummyData.ts` file contains sample data structures that the frontend expects. Use this as a reference for:

### User Data Structure
```typescript
interface User {
  id: string;
  username: string;
  password: string; // Hashed in backend
  role: 'receptionist' | 'doctor';
  name: string;
}
```

### Patient Data Structure
```typescript
interface Patient {
  id: string; // 10-digit unique identifier
  name: string;
  dateOfBirth: string; // ISO date format
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  phoneNumber: string;
  guardianPhone: string;
  address: string;
  maritalStatus: 'Single' | 'Married' | 'Divorced' | 'Widowed';
  spouseName?: string;
  caste: string;
  religion: string;
  nationality: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  allergies: string[];
  chronicConditions: string[];
  photo?: string; // Base64 or URL
}
```

### Appointment Data Structure
```typescript
interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string; // ISO date format
  time: string; // HH:MM format
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  type: 'consultation' | 'follow-up' | 'emergency' | 'routine';
  notes?: string;
  duration: number; // in minutes
}
```

### Medical Record Data Structure
```typescript
interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string; // ISO date format
  diagnosis: string;
  symptoms: string[];
  treatment: string;
  medications: Medication[];
  notes: string;
  followUpDate?: string;
  attachments?: string[]; // URLs or file paths
}

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}
```

## API Requirements

### Base Configuration
- **Base URL**: Configurable via environment variables
- **Content Type**: `application/json`
- **Authentication**: Bearer token in Authorization header
- **CORS**: Must be enabled for desktop client origin

### Authentication Endpoints

#### POST /api/auth/login
```json
// Request
{
  "username": "string",
  "password": "string"
}

// Response (Success - 200)
{
  "token": "jwt_token_string",
  "user": {
    "id": "string",
    "username": "string",
    "role": "receptionist" | "doctor",
    "name": "string"
  }
}

// Response (Error - 401)
{
  "error": "Invalid credentials"
}
```

#### POST /api/auth/logout
```json
// Request Headers
Authorization: Bearer <token>

// Response (Success - 200)
{
  "message": "Logged out successfully"
}
```

#### GET /api/auth/verify
```json
// Request Headers
Authorization: Bearer <token>

// Response (Success - 200)
{
  "user": {
    "id": "string",
    "username": "string",
    "role": "receptionist" | "doctor",
    "name": "string"
  }
}

// Response (Error - 401)
{
  "error": "Invalid or expired token"
}
```

### Patient Management Endpoints

#### GET /api/patients
```json
// Request Headers
Authorization: Bearer <token>

// Query Parameters (optional)
?search=string&page=number&limit=number

// Response (Success - 200)
{
  "patients": [Patient[]],
  "total": number,
  "page": number,
  "totalPages": number
}
```

#### GET /api/patients/:id
```json
// Request Headers
Authorization: Bearer <token>

// Response (Success - 200)
Patient

// Response (Error - 404)
{
  "error": "Patient not found"
}
```

#### POST /api/patients
```json
// Request Headers
Authorization: Bearer <token>
Content-Type: application/json

// Request Body
Patient (without id)

// Response (Success - 201)
Patient (with generated id)

// Response (Error - 400)
{
  "error": "Validation error",
  "details": ["field1 is required", "field2 is invalid"]
}
```

#### PUT /api/patients/:id
```json
// Request Headers
Authorization: Bearer <token>
Content-Type: application/json

// Request Body
Patient (with id)

// Response (Success - 200)
Patient

// Response (Error - 404)
{
  "error": "Patient not found"
}
```

#### DELETE /api/patients/:id
```json
// Request Headers
Authorization: Bearer <token>

// Response (Success - 200)
{
  "message": "Patient deleted successfully"
}

// Response (Error - 404)
{
  "error": "Patient not found"
}
```

### Appointment Management Endpoints

#### GET /api/appointments
```json
// Request Headers
Authorization: Bearer <token>

// Query Parameters (optional)
?date=YYYY-MM-DD&doctorId=string&patientId=string&status=string

// Response (Success - 200)
{
  "appointments": [Appointment[]],
  "total": number
}
```

#### GET /api/appointments/:id
```json
// Request Headers
Authorization: Bearer <token>

// Response (Success - 200)
Appointment

// Response (Error - 404)
{
  "error": "Appointment not found"
}
```

#### POST /api/appointments
```json
// Request Headers
Authorization: Bearer <token>
Content-Type: application/json

// Request Body
Appointment (without id)

// Response (Success - 201)
Appointment (with generated id)

// Response (Error - 400)
{
  "error": "Validation error",
  "details": ["Time slot not available"]
}
```

#### PUT /api/appointments/:id
```json
// Request Headers
Authorization: Bearer <token>
Content-Type: application/json

// Request Body
Appointment (with id)

// Response (Success - 200)
Appointment

// Response (Error - 404)
{
  "error": "Appointment not found"
}
```

#### DELETE /api/appointments/:id
```json
// Request Headers
Authorization: Bearer <token>

// Response (Success - 200)
{
  "message": "Appointment cancelled successfully"
}
```

### Medical Records Endpoints

#### GET /api/medical-records
```json
// Request Headers
Authorization: Bearer <token>

// Query Parameters (optional)
?patientId=string&doctorId=string&date=YYYY-MM-DD&page=number&limit=number

// Response (Success - 200)
{
  "records": [MedicalRecord[]],
  "total": number,
  "page": number,
  "totalPages": number
}
```

#### GET /api/medical-records/:id
```json
// Request Headers
Authorization: Bearer <token>

// Response (Success - 200)
MedicalRecord

// Response (Error - 404)
{
  "error": "Medical record not found"
}
```

#### POST /api/medical-records
```json
// Request Headers
Authorization: Bearer <token>
Content-Type: application/json

// Request Body
MedicalRecord (without id)

// Response (Success - 201)
MedicalRecord (with generated id)
```

#### PUT /api/medical-records/:id
```json
// Request Headers
Authorization: Bearer <token>
Content-Type: application/json

// Request Body
MedicalRecord (with id)

// Response (Success - 200)
MedicalRecord

// Response (Error - 404)
{
  "error": "Medical record not found"
}
```

#### DELETE /api/medical-records/:id
```json
// Request Headers
Authorization: Bearer <token>

// Response (Success - 200)
{
  "message": "Medical record deleted successfully"
}
```

## Database Schema

### Recommended Database Tables

#### users
```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('receptionist', 'doctor') NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### patients
```sql
CREATE TABLE patients (
  id VARCHAR(10) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender ENUM('Male', 'Female', 'Other') NOT NULL,
  blood_group VARCHAR(5),
  phone_number VARCHAR(15),
  guardian_phone VARCHAR(15),
  address TEXT,
  marital_status ENUM('Single', 'Married', 'Divorced', 'Widowed'),
  spouse_name VARCHAR(100),
  caste VARCHAR(50),
  religion VARCHAR(50),
  nationality VARCHAR(50),
  emergency_contact_name VARCHAR(100),
  emergency_contact_number VARCHAR(15),
  allergies JSON,
  chronic_conditions JSON,
  photo TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### appointments
```sql
CREATE TABLE appointments (
  id VARCHAR(36) PRIMARY KEY,
  patient_id VARCHAR(10) NOT NULL,
  patient_name VARCHAR(100) NOT NULL,
  doctor_id VARCHAR(36) NOT NULL,
  doctor_name VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  status ENUM('scheduled', 'completed', 'cancelled', 'no-show') DEFAULT 'scheduled',
  type ENUM('consultation', 'follow-up', 'emergency', 'routine') DEFAULT 'consultation',
  notes TEXT,
  duration INT DEFAULT 30,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### medical_records
```sql
CREATE TABLE medical_records (
  id VARCHAR(36) PRIMARY KEY,
  patient_id VARCHAR(10) NOT NULL,
  patient_name VARCHAR(100) NOT NULL,
  doctor_id VARCHAR(36) NOT NULL,
  doctor_name VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  diagnosis TEXT NOT NULL,
  symptoms JSON,
  treatment TEXT,
  medications JSON,
  notes TEXT,
  follow_up_date DATE,
  attachments JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Indexes for Performance
```sql
-- Patient search optimization
CREATE INDEX idx_patients_name ON patients(name);
CREATE INDEX idx_patients_phone ON patients(phone_number);

-- Appointment queries
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id, date);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);

-- Medical records queries
CREATE INDEX idx_medical_records_patient ON medical_records(patient_id, date);
CREATE INDEX idx_medical_records_doctor ON medical_records(doctor_id, date);
```

## Authentication & Authorization

### JWT Token Requirements
- **Algorithm**: HS256 or RS256
- **Expiration**: 8 hours (configurable)
- **Payload**: Must include user id, username, and role
- **Refresh**: Implement refresh token mechanism for better UX

### Role-Based Access Control

#### Receptionist Permissions
- Full CRUD access to patients
- Full CRUD access to appointments
- Read-only access to medical records
- Cannot delete medical records

#### Doctor Permissions
- Read access to all patients
- Update access to patient medical information
- Full CRUD access to appointments (own appointments)
- Full CRUD access to medical records

### Security Headers
```javascript
// Required security headers
{
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains"
}
```

## Error Handling

### Standard Error Response Format
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": ["Additional error details"],
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### HTTP Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (authentication required)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **409**: Conflict (duplicate data)
- **422**: Unprocessable Entity (business logic errors)
- **500**: Internal Server Error

### Common Error Scenarios

#### Validation Errors
```json
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": [
    "Name is required",
    "Phone number must be valid",
    "Date of birth cannot be in the future"
  ]
}
```

#### Authentication Errors
```json
{
  "error": "Authentication required",
  "code": "AUTH_REQUIRED"
}
```

#### Authorization Errors
```json
{
  "error": "Insufficient permissions",
  "code": "INSUFFICIENT_PERMISSIONS"
}
```

## Testing

### Unit Testing Requirements
- Test all API endpoints
- Test authentication and authorization
- Test data validation
- Test error handling
- Minimum 80% code coverage

### Integration Testing
- Test complete user workflows
- Test database transactions
- Test API response formats
- Test error scenarios

### Sample Test Cases

#### Authentication Tests
```javascript
describe('Authentication', () => {
  test('should login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testuser',
        password: 'password123'
      });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user).toHaveProperty('role');
  });

  test('should reject invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testuser',
        password: 'wrongpassword'
      });
    
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
  });
});
```

#### Patient Management Tests
```javascript
describe('Patient Management', () => {
  test('should create new patient', async () => {
    const patientData = {
      name: 'John Doe',
      dateOfBirth: '1990-01-01',
      gender: 'Male',
      phoneNumber: '1234567890'
    };

    const response = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${token}`)
      .send(patientData);
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe(patientData.name);
  });
});
```

## Deployment Considerations

### Environment Variables
```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=medical_management
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=8h

# Server Configuration
PORT=3000
NODE_ENV=production

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# File Upload Configuration
MAX_FILE_SIZE=10MB
UPLOAD_PATH=/uploads
```

### Production Checklist
- [ ] Enable HTTPS/TLS
- [ ] Configure proper CORS origins
- [ ] Set up database connection pooling
- [ ] Implement rate limiting
- [ ] Set up logging and monitoring
- [ ] Configure backup strategies
- [ ] Implement health check endpoints
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Configure load balancing if needed
- [ ] Set up CI/CD pipeline

### Health Check Endpoint
```javascript
// GET /api/health
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "1.0.0",
  "database": "connected",
  "uptime": 3600
}
```

### Performance Recommendations
- Implement database connection pooling
- Use Redis for session management
- Implement API response caching where appropriate
- Use database indexes for frequently queried fields
- Implement pagination for large datasets
- Use compression middleware (gzip)
- Optimize database queries with proper joins
- Implement request rate limiting

### Monitoring and Logging
- Log all API requests and responses
- Monitor database performance
- Track authentication failures
- Monitor error rates and response times
- Set up alerts for critical failures
- Implement audit logging for sensitive operations

---

## Quick Start for Backend Developers

1. **Set up your development environment**
   - Install Node.js/Python/Java (your preferred backend technology)
   - Set up your database (PostgreSQL/MySQL recommended)
   - Configure environment variables

2. **Implement authentication first**
   - Create user table and authentication endpoints
   - Implement JWT token generation and validation
   - Test login/logout functionality

3. **Implement core entities**
   - Create database tables for patients, appointments, medical records
   - Implement CRUD operations for each entity
   - Add proper validation and error handling

4. **Test integration**
   - Use the provided sample data to test your endpoints
   - Verify response formats match the expected structure
   - Test with the desktop client

5. **Deploy and monitor**
   - Set up production environment
   - Configure monitoring and logging
   - Implement backup and recovery procedures

For questions or support, refer to the API documentation or contact the frontend development team.