# User Management Module

## Overview
Manages user profiles, roles, and permissions across the JECSmart system.

## Features
- User profile management
- Role-based permissions
- Cross-hospital user access
- Profile synchronization between devices

## User Types

### Patients
- Personal medical data access
- NFC card management
- Mobile app access
- Cross-hospital portability

### Doctors
- Patient data access (authorized)
- Prescription management
- Medical report creation
- Desktop app access

### Hospital Staff
- Patient registration
- Card programming
- Data entry and updates
- Limited patient data access

### System Administrators
- Full system access
- User management
- System configuration
- Audit log access

## API Endpoints

### Get User Profile
```http
GET /api/users/profile
Authorization: Bearer your_access_token_here
```

### Update User Profile
```http
PUT /api/users/profile
Authorization: Bearer your_access_token_here
Content-Type: application/json

{
  "full_name": "Updated Name",
  "phone": "+1234567890"
}
```

### Get User by ID (Admin only)
```http
GET /api/users/{user_id}
Authorization: Bearer admin_access_token_here
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('patient', 'doctor', 'admin', 'hospital_staff')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Role Permissions

| Action | Patient | Doctor | Hospital Staff | Admin |
|--------|---------|--------|----------------|-------|
| View own profile | ✅ | ✅ | ✅ | ✅ |
| Update own profile | ✅ | ✅ | ✅ | ✅ |
| View patient data | Own only | Authorized | Limited | All |
| Create prescriptions | ❌ | ✅ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ❌ | ✅ |
| System configuration | ❌ | ❌ | ❌ | ✅ |