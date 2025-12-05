# Authentication Module

## Overview
The authentication module provides secure JWT-based authentication and authorization for the JECSmart Patient Health Card System.

## Features
- JWT access and refresh token management
- Role-based access control (RBAC)
- Secure password hashing with bcrypt
- Session management and logout
- Access logging for audit trails

## User Roles
- **patient**: Healthcare patients with NFC cards
- **doctor**: Medical professionals
- **admin**: System administrators
- **hospital_staff**: Hospital staff members

## API Endpoints

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "password123",
  "role": "patient"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refresh_token": "your_refresh_token_here"
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer your_access_token_here
```

### Logout
```http
POST /api/auth/logout
Content-Type: application/json

{
  "refresh_token": "your_refresh_token_here"
}
```

## Security Features
- Password hashing with bcrypt (10 rounds)
- JWT tokens with configurable expiry
- Refresh token rotation
- Input validation and sanitization
- Access logging for security audits

## Token Management
- **Access Token**: Short-lived (15 minutes) for API access
- **Refresh Token**: Long-lived (7 days) for token renewal
- Automatic token refresh on expiry
- Secure token storage recommendations