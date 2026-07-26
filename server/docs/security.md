# Security Documentation

## Overview
Comprehensive security implementation for the **MediLocker — NFC Based Smart Patient Health Card System**, ensuring safe handling of patient healthcare data.

## Security Architecture

### Defense in Depth
- **Application Layer**: Input validation (Zod), authentication (JWT), authorization (RBAC)
- **Network Layer**: TLS/HTTPS enforcement via NGINX reverse proxy, CORS policy
- **Data Layer**: Password hashing (bcryptjs), secure token storage, Prisma parameterized queries
- **Infrastructure Layer**: Secure hosting, audit logging (`access_logs` table), monitoring

## Authentication & Authorization

### JWT Token Security (TypeScript / Express)
```typescript
// auth.service.ts
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export function createAccessToken(payload: { userId: string; role: string }): string {
  return jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: '15m' });
}

export function createRefreshToken(payload: { userId: string }): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

export function verifyAccessToken(token: string) {
  try {
    return jwt.verify(token, JWT_ACCESS_SECRET);
  } catch {
    throw new Error('Invalid or expired token');
  }
}
```

### Auth Middleware (Express)
```typescript
// auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded as { userId: string; role: string };
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}
```

### Role-Based Access Control (RBAC)
```typescript
// Role definitions — enforced in controllers
type UserRole = 'patient' | 'hospital_staff' | 'admin';

// Role-specific middleware factory
export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role as UserRole)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
}
```

| Role | Access |
|------|--------|
| `hospital_staff` (Receptionist) | Register patients, schedule appointments, search patients, NFC lookup |
| `hospital_staff` (Doctor) | View their appointments, create visits, write prescriptions |
| `patient` | Read their own records, appointments, notifications, and bills |
| `admin` | Full system access |

## Password Security

```typescript
// Hashing on registration (bcryptjs, 10 salt rounds)
import bcryptjs from 'bcryptjs';

const SALT_ROUNDS = 10;

export async function hashPassword(plain: string): Promise<string> {
  return bcryptjs.hash(plain, SALT_ROUNDS);
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcryptjs.compare(plain, hash);
}
```

Plain-text passwords are **never stored**. All passwords are hashed with bcryptjs before writing to the `users` table.

## Data Encryption

### Mobile Token Storage (Flutter)
In the Flutter app, the JWT access token is stored using **flutter_secure_storage**, which uses the platform keychain (iOS) or Android keystore — inaccessible to other apps.

```dart
// Secure storage — not shared with other apps
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

final _storage = FlutterSecureStorage();

Future<void> saveToken(String token) async {
  await _storage.write(key: 'access_token', value: token);
}

Future<String?> getToken() async {
  return await _storage.read(key: 'access_token');
}
```

### Database Security
- **Prisma ORM** uses fully parameterized queries — SQL injection is prevented at the framework level.
- No raw SQL strings are constructed with user input.
- Sensitive fields like `password_hash` are never returned in API responses (excluded in service layer).

## Network Security

### CORS Configuration (Express)
```typescript
// app.ts
import cors from 'cors';

app.use(cors({
  origin: process.env.FRONTEND_URL, // e.g. http://localhost:5173
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

### Security Headers (via NGINX in production)
```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Content-Type-Options nosniff;
add_header X-Frame-Options DENY;
add_header X-XSS-Protection "1; mode=block";
```

## Input Validation & Sanitization

All request bodies are validated against **Zod schemas** via a middleware before reaching any controller:

```typescript
// validate.middleware.ts
import { ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: result.error.flatten().fieldErrors,
      });
    }
    req.body = result.data;
    next();
  };
}
```

## Electron Desktop App Security

```javascript
// electron/main.js
const win = new BrowserWindow({
  webPreferences: {
    nodeIntegration: false,      // React renderer cannot access Node APIs
    contextIsolation: true,      // preload script uses contextBridge
    enableRemoteModule: false,   // deprecated remote module disabled
    preload: path.join(__dirname, 'preload.js'),
  },
});
```

The `contextBridge` in `preload.js` exposes only a minimal, typed API surface to the React renderer (`window.electronAPI`) — no raw Node.js or Electron APIs are exposed.

## NFC Card Security

The NFC card (RFID) only stores the **card UID** (a hardware identifier). No patient data is written to the card itself. The UID is stored in `patients.nfc_card_uid` and used purely as a database lookup key.

When a card is scanned:
1. The Arduino reads the UID from the card via serial port.
2. The Electron app sends the UID to the Express API (`GET /api/patients/:nfcCardUid`).
3. The server looks up the patient by UID and returns the patient record.
4. **No sensitive data is stored on the physical card.**

## Audit Logging

All significant user actions are recorded in the `access_logs` table via Prisma:

```typescript
// Example: log a login event
await prisma.accessLog.create({
  data: {
    user_id: userId,
    action: 'LOGIN',
    ip_address: req.ip,
    user_agent: req.headers['user-agent'],
  },
});
```

The `access_logs` table tracks: who did what, when, and from which IP address.

## Refresh Token Rotation

Refresh tokens are stored server-side in the `refresh_tokens` table. On logout, the token is immediately deleted — preventing reuse even if it was intercepted.

```typescript
// On logout
await prisma.refreshToken.delete({ where: { token: refreshToken } });
```

## Security Testing

### Recommended Practices
- Test all endpoints with Postman for unauthorized access (without/wrong token)
- Verify role enforcement: attempt doctor-only endpoints as a patient
- Check that password is never returned in any API response
- Confirm Zod validation rejects malformed bodies on all `POST`/`PUT` endpoints

### Security Metrics to Monitor
- Authentication failure rates (failed logins)
- Invalid token usage attempts
- Unexpected 403 responses (potential unauthorized access probes)
- FCM token delivery failure rates