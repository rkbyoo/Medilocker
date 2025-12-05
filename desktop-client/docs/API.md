# API Documentation

This document describes the REST API endpoints that the desktop client expects from the backend server.

## Base Configuration

- **Base URL**: `http://localhost:3000/api` (configurable via `VITE_API_BASE_URL`)
- **Content Type**: `application/json`
- **Authentication**: Bearer token in Authorization header

## Authentication Endpoints

### POST /auth/login
Authenticate user and receive access token.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "user": {
    "id": "string",
    "username": "string",
    "role": "receptionist" | "doctor",
    "name": "string"
  },
  "token": "string",
  "refreshToken": "string"
}
```

### POST /auth/logout
Invalidate current session.

**Headers:** `Authorization: Bearer <token>`

**Response:** `204 No Content`

### POST /auth/refresh
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "string"
}
```

**Response:**
```json
{
  "user": {
    "id": "string",
    "username": "string",
    "role": "receptionist" | "doctor",
    "name": "string"
  },
  "token": "string",
  "refreshToken": "string"
}
```

### GET /auth/me
Get current user information.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": "string",
  "username": "string",
  "role": "receptionist" | "doctor",
  "name": "string"
}
```

## Patient Endpoints

### GET /patients
Get all patients with pagination.

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)
- `sortBy` (string, optional): Sort field (name, id, dateOfBirth)
- `sortOrder` (string, optional): Sort order (asc, desc)

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "dateOfBirth": "string",
      "gender": "Male" | "Female" | "Other",
      "bloodGroup": "string",
      "phoneNumber": "string",
      "guardianPhone": "string",
      "address": "string",
      "maritalStatus": "Single" | "Married" | "Divorced" | "Widowed",
      "spouseName": "string",
      "caste": "string",
      "religion": "string",
      "nationality": "string",
      "emergencyContactName": "string",
      "emergencyContactNumber": "string",
      "allergies": ["string"],
      "chronicConditions": ["string"],
      "photo": "string"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### GET /patients/:id
Get patient by ID.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": "string",
  "name": "string",
  "dateOfBirth": "string",
  "gender": "Male" | "Female" | "Other",
  "bloodGroup": "string",
  "phoneNumber": "string",
  "guardianPhone": "string",
  "address": "string",
  "maritalStatus": "Single" | "Married" | "Divorced" | "Widowed",
  "spouseName": "string",
  "caste": "string",
  "religion": "string",
  "nationality": "string",
  "emergencyContactName": "string",
  "emergencyContactNumber": "string",
  "allergies": ["string"],
  "chronicConditions": ["string"],
  "photo": "string"
}
```

### POST /patients
Create new patient.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "string",
  "dateOfBirth": "string",
  "gender": "Male" | "Female" | "Other",
  "bloodGroup": "string",
  "phoneNumber": "string",
  "guardianPhone": "string",
  "address": "string",
  "maritalStatus": "Single" | "Married" | "Divorced" | "Widowed",
  "spouseName": "string",
  "caste": "string",
  "religion": "string",
  "nationality": "string",
  "emergencyContactName": "string",
  "emergencyContactNumber": "string",
  "allergies": ["string"],
  "chronicConditions": ["string"],
  "photo": "string"
}
```

**Response:** Same as GET /patients/:id

### PUT /patients/:id
Update patient.

**Headers:** `Authorization: Bearer <token>`

**Request Body:** Partial patient object

**Response:** Updated patient object

### DELETE /patients/:id
Delete patient.

**Headers:** `Authorization: Bearer <token>`

**Response:** `204 No Content`

### GET /patients/search
Search patients.

**Query Parameters:**
- `q` (string): Search query
- `page` (number, optional): Page number
- `limit` (number, optional): Items per page
- `sortBy` (string, optional): Sort field
- `sortOrder` (string, optional): Sort order

**Headers:** `Authorization: Bearer <token>`

**Response:** Same as GET /patients

## Appointment Endpoints

### GET /appointments
Get all appointments with pagination.

**Query Parameters:**
- `page` (number, optional): Page number
- `limit` (number, optional): Items per page
- `status` (string, optional): Filter by status
- `date` (string, optional): Filter by date (YYYY-MM-DD)
- `doctorId` (string, optional): Filter by doctor
- `patientId` (string, optional): Filter by patient

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "data": [
    {
      "id": "string",
      "patientId": "string",
      "patientName": "string",
      "doctorId": "string",
      "doctorName": "string",
      "department": "string",
      "reason": "string",
      "dateTime": "string",
      "status": "scheduled" | "completed" | "cancelled"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### GET /appointments/:id
Get appointment by ID.

**Headers:** `Authorization: Bearer <token>`

**Response:** Single appointment object

### POST /appointments
Create new appointment.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "patientId": "string",
  "patientName": "string",
  "doctorId": "string",
  "doctorName": "string",
  "department": "string",
  "reason": "string",
  "dateTime": "string"
}
```

**Response:** Created appointment object

### PUT /appointments/:id
Update appointment.

**Headers:** `Authorization: Bearer <token>`

**Request Body:** Partial appointment object

**Response:** Updated appointment object

### DELETE /appointments/:id
Delete appointment.

**Headers:** `Authorization: Bearer <token>`

**Response:** `204 No Content`

### GET /appointments/doctor/:doctorId
Get appointments by doctor ID.

**Query Parameters:**
- `status` (string, optional): Filter by status
- `date` (string, optional): Filter by date
- `limit` (number, optional): Limit results

**Headers:** `Authorization: Bearer <token>`

**Response:** Array of appointment objects

### GET /appointments/patient/:patientId
Get appointments by patient ID.

**Query Parameters:**
- `status` (string, optional): Filter by status
- `date` (string, optional): Filter by date
- `limit` (number, optional): Limit results

**Headers:** `Authorization: Bearer <token>`

**Response:** Array of appointment objects

### GET /appointments/doctor/:doctorId/today
Get today's appointments for a doctor.

**Headers:** `Authorization: Bearer <token>`

**Response:** Array of appointment objects

## Medical Records Endpoints

### GET /medical-records/patient/:patientId
Get medical records by patient ID.

**Query Parameters:**
- `page` (number, optional): Page number
- `limit` (number, optional): Items per page
- `startDate` (string, optional): Filter from date
- `endDate` (string, optional): Filter to date

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "id": "string",
    "patientId": "string",
    "doctorId": "string",
    "doctorName": "string",
    "date": "string",
    "diagnosis": "string",
    "medications": "string",
    "advice": "string",
    "nextVisit": "string"
  }
]
```

### GET /medical-records/doctor/:doctorId
Get medical records by doctor ID.

**Query Parameters:** Same as patient endpoint

**Headers:** `Authorization: Bearer <token>`

**Response:** Array of medical record objects

### GET /medical-records/:id
Get medical record by ID.

**Headers:** `Authorization: Bearer <token>`

**Response:** Single medical record object

### POST /medical-records
Create new medical record.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "patientId": "string",
  "doctorId": "string",
  "doctorName": "string",
  "diagnosis": "string",
  "medications": "string",
  "advice": "string",
  "nextVisit": "string"
}
```

**Response:** Created medical record object

### PUT /medical-records/:id
Update medical record.

**Headers:** `Authorization: Bearer <token>`

**Request Body:** Partial medical record object

**Response:** Updated medical record object

### DELETE /medical-records/:id
Delete medical record.

**Headers:** `Authorization: Bearer <token>`

**Response:** `204 No Content`

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "error": "string",
  "message": "string",
  "statusCode": 400
}
```

### Common Status Codes

- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

## Authentication

All endpoints except `/auth/login` require authentication. Include the Bearer token in the Authorization header:

```
Authorization: Bearer <your-token-here>
```

Tokens expire after a configured time. Use the refresh token endpoint to get a new access token.

## Rate Limiting

The API may implement rate limiting. Check response headers for rate limit information:

- `X-RateLimit-Limit` - Request limit per time window
- `X-RateLimit-Remaining` - Remaining requests in current window
- `X-RateLimit-Reset` - Time when the rate limit resets

## CORS

The API should be configured to allow requests from the desktop client's origin during development and production.