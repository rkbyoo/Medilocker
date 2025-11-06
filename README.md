# NFC Healthcare Management System - Backend

A production-grade authentication and authorization backend for an NFC-based healthcare management system where hospitals, doctors, staff, and patients interact securely.

## 🏗️ Architecture

This backend follows a modular architecture with clear separation of concerns:

- **Modules**: Feature-based organization (auth, user)
- **Middlewares**: Authentication, validation, error handling
- **Utils**: Reusable utilities (JWT, bcrypt, logging, response)
- **Config**: Environment and database configuration
- **Types**: TypeScript type definitions

## 🚀 Features

- **Authentication**: JWT-based auth with access and refresh tokens
- **Authorization**: Role-based access control (RBAC)
- **Security**: bcrypt password hashing, secure token management
- **Logging**: Comprehensive access logging for audit trails
- **Validation**: Request validation using Zod
- **Database**: PostgreSQL with connection pooling

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database (Neon)
- npm or yarn

## 🛠️ Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your actual values
```

4. Run database migrations:
```bash
# Connect to your PostgreSQL database and run:
psql "your_database_url" -f migrations/001_create_tables.sql
```

5. Start the development server:
```bash
npm run dev
```

## 🔧 Environment Variables

```env
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
PORT=4000
NODE_ENV=development
```

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/refresh` | Refresh access token | No |
| POST | `/api/auth/logout` | User logout | No |
| GET | `/api/auth/me` | Get current user profile | Yes |

### Users

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users/profile` | Get user profile | Yes |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |

## 🔐 Authentication Flow

1. **Register**: Create new user account with hashed password
2. **Login**: Validate credentials and return JWT tokens
3. **Access**: Use access token for protected routes
4. **Refresh**: Use refresh token to get new access token
5. **Logout**: Invalidate refresh token

## 👥 User Roles

- `patient`: Healthcare patients with NFC cards
- `doctor`: Medical professionals
- `admin`: System administrators
- `hospital_staff`: Hospital staff members

## 🗄️ Database Schema

### Users Table
- `user_id` (UUID, Primary Key)
- `full_name` (VARCHAR(150))
- `email` (VARCHAR(150), Unique)
- `phone` (VARCHAR(20), Optional)
- `password_hash` (TEXT)
- `role` (VARCHAR(20))
- `created_at`, `updated_at` (TIMESTAMP)

### Refresh Tokens Table
- `token_id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `refresh_token` (TEXT)
- `expires_at` (TIMESTAMP)
- `created_at` (TIMESTAMP)

### Access Logs Table
- `log_id` (BIGSERIAL, Primary Key)
- `user_id` (UUID, Foreign Key)
- `action` (VARCHAR(200))
- `timestamp` (TIMESTAMP)
- `ip_address` (VARCHAR(50))
- `user_agent` (TEXT)
- `success` (BOOLEAN)

## 🧪 Testing

Use the provided Postman collection to test all endpoints:

### Register User
```bash
POST /api/auth/register
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "password123",
  "role": "patient"
}
```

### Login
```bash
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Refresh Token
```bash
POST /api/auth/refresh
{
  "refresh_token": "your_refresh_token_here"
}
```

### Get Profile
```bash
GET /api/auth/me
Authorization: Bearer your_access_token_here
```

## 🔒 Security Features

- Password hashing with bcrypt (10 rounds)
- JWT tokens with configurable expiry
- Refresh token rotation
- Access logging for audit trails
- Input validation and sanitization
- Role-based access control

## 📊 Monitoring

All authentication actions are logged in the `access_logs` table:
- Registration attempts
- Login success/failure
- Token refresh
- Profile access
- Logout events

## 🚀 Production Deployment

1. Set strong JWT secrets
2. Use environment-specific database URLs
3. Enable HTTPS
4. Set up proper logging
5. Configure rate limiting
6. Set up monitoring and alerts

## 📝 License

This project is part of a Final Year Project for NFC-based Healthcare Management System.