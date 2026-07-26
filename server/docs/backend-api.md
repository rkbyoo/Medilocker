# Backend API Documentation

## Overview
Node.js + Express backend service providing RESTful APIs for the **MediLocker — NFC Based Smart Patient Health Card System**.

## Technology Stack
- **Runtime**: Node.js 20 + TypeScript
- **Framework**: Express.js 4
- **Database**: PostgreSQL 14+ (via Prisma ORM v7)
- **Authentication**: JWT (`jsonwebtoken`) + `bcryptjs`
- **Validation**: Zod
- **Push Notifications**: Firebase Admin SDK (FCM)
- **SMS**: Twilio
- **ORM**: Prisma v7

## API Architecture

### Base URL
```
Production: https://<your-server-domain>/api
Development: http://localhost:4000/api
```

### Authentication
All protected endpoints require JWT Bearer token:
```http
Authorization: Bearer <access_token>
```

## Core Modules

The server follows a **feature-based module pattern**. Each feature is self-contained with its own controller, service, routes, and model:

```
server/src/app/modules/
├── auth/          → Login, register, refresh token, logout
├── patient/       → Patient CRUD, NFC lookup, search
├── appointment/   → Scheduling, status updates, doctor schedule views
├── visit/         → Medical encounters, diagnoses, prescriptions
├── notification/  → FCM push notifications, device token management
├── bill/          → Billing, bill sections, payment status
└── user/          → Hospital staff user management
```

### Key Design Patterns
- **Controller → Service → Prisma**: Every route handler delegates business logic to a service function, which talks to the database via Prisma. Controllers only handle HTTP request/response parsing.
- **Zod Validation Middleware**: All incoming request bodies are validated against strict Zod schemas before reaching the controller.
- **JWT Middleware**: A reusable `auth.middleware.ts` extracts and verifies the JWT from the `Authorization` header. It injects the decoded user into `req.user` for downstream use.
- **Centralized Error Handling**: An `error.middleware.ts` catches all unhandled errors and formats them into consistent JSON error responses.

### Authentication API

```typescript
// POST /api/auth/login
// Validates credentials (bcryptjs password check)
// Returns: { accessToken (15min), refreshToken (7d) }

// POST /api/auth/refresh
// Validates the refreshToken from DB
// Returns: new { accessToken }
```

The refresh token is stored in the `refresh_tokens` table for server-side invalidation on logout.

### Patient Management API

```typescript
// POST /api/patients         → Register a new patient
// GET  /api/patients/:id     → Get patient by ID, patient number, or NFC UID
// PUT  /api/patients/:id     → Update patient info
// GET  /api/patients?q=...   → Search by name, patient number, or NFC UID
```

### Appointment API

```typescript
// POST  /api/appointments                          → Create an appointment
// GET   /api/appointments                          → List appointments (with filters)
// GET   /api/appointments/:id                      → Get appointment detail
// GET   /api/appointments/doctor/:id/today         → Doctor's appointments for today
// GET   /api/appointments/doctor/:id/tomorrow      → Doctor's appointments for tomorrow
// PUT   /api/appointments/:id                      → Update appointment
// PATCH /api/appointments/:id/cancel               → Cancel an appointment
```

### Visit (Consultation) API

```typescript
// POST /api/visits                → Create a visit (consultation record + prescription)
// GET  /api/visits/:id            → Get visit details
// GET  /api/visits?patient_id=    → Get all visits for a patient
// PUT  /api/visits/:id            → Update a visit
```

### Notification API

```typescript
// POST  /api/notifications/device-token   → Register a device's FCM token
// GET   /api/notifications                → Get patient's notification list
// PATCH /api/notifications/:id/read       → Mark a notification as read
```

## Data Models

### User Model (TypeScript)
```typescript
interface User {
  user_id: string;      // UUID
  full_name: string;
  email: string;
  phone?: string;
  password_hash: string;
  role: 'patient' | 'hospital_staff' | 'admin';
  created_at: Date;
  updated_at: Date;
}
```

### Patient Model (TypeScript)
```typescript
interface Patient {
  patient_id: string;        // UUID
  user_id: string;           // FK → users
  patient_number: string;    // Auto-generated 10-digit unique number
  nfc_card_uid?: string;     // Optional, linked to physical NFC card
  date_of_birth: Date;
  gender: string;
  blood_group: string;
  phone_number: string;
  address?: string;
  created_at: Date;
}
```

### Prescription Model (TypeScript)
```typescript
interface Prescription {
  prescription_id: string;   // UUID
  visit_id: string;          // FK → visits
  doctor_id: string;         // FK → hospital_users
  medications: Medication[];
  created_at: Date;
}

interface Medication {
  medication_id: string;
  prescription_id: string;
  drug_name: string;
  dosage: string;
  frequency: string;
  duration: string;
}
```

## Security Features
- JWT-based authentication (access + refresh tokens)
- Role-based access control (RBAC)
- Input validation with **Zod**
- SQL injection prevention via **Prisma ORM** (parameterized queries)
- Password hashing with **bcryptjs** (10 salt rounds)
- CORS configuration via `cors` package
- HTTPS enforcement (via reverse proxy in production)

## Error Handling

All errors follow a consistent JSON response format:

```typescript
// Standard error response
{
  "success": false,
  "message": "Validation failed",
  "errors": { ... }  // optional field-level details
}
```

HTTP status codes:
- `400` — Bad Request / Validation Error
- `401` — Unauthorized (missing or invalid token)
- `403` — Forbidden (insufficient role)
- `404` — Resource Not Found
- `500` — Internal Server Error

## Performance Features
- Database connection pooling via `pg` + Prisma
- Async/await for non-blocking I/O throughout Express route handlers
- Indexed columns for frequent lookups (`nfc_card_uid`, `patient_number`, `email`)

## Monitoring and Logging
- Console logging via Node.js built-in utilities
- Request logging middleware
- Firebase Admin SDK for push notification delivery tracking
- Access logs stored in the `access_logs` table for audit trails

> 📖 A Postman collection is available at `server/postman_collection.json` for testing all endpoints.