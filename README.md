# Final Year Project - JECSmart Patient Health Card System

A secure NFC-enabled health card linked with a cloud backend that stores patient medical history, prescriptions, reports, and scans. Provides offline access via card and cross-hospital portability with desktop & mobile apps.

## 🧑‍💻 Members
- **Nitish Kumar Das**
- **Rakib Hussain** 
- **Tushar Haloi**
- **Sarlongki Teron**

## ✨ Features

### 💾 Smart NFC Card
- Stores essential patient data offline

### ☁️ Cloud Sync  
- Prescriptions, reports, bills & scans stored online

### 🖥️ Hospital Desktop App
- Read/write card data & sync with backend

### 📱 Patient Mobile App
- View and manage personal medical data

### 🔒 Secure Authentication
- JWT/OAuth2 with role-based access

### 🌍 Cross-Hospital Access
- Works across hospitals with NFC readers

### 📊 Central Backend
- FastAPI + PostgreSQL + S3 for structured & unstructured data management

### 🛡️ Data Privacy
- Encrypted storage

### Additional Features
- 💵 Payment Gateway
- 📈 User Statistics and Analytics

## 🏗️ Architecture (HLD)

```mermaid
flowchart TD
    subgraph Patient["Patient"]
        A1["Smart Health Card (NFC)"]
        A2["Android App"]
    end
    
    subgraph Hospital["Hospital"]
        B1["Desktop App (C#)"]
        B2["NFC Reader"]
    end
    
    subgraph Cloud["Cloud"]
        C1["FastAPI Backend (Python)"]
        C2["PostgreSQL - Patient Data"]
        C3["S3 / Blob Storage - Scans & Images"]
        C4["Auth Service - JWT/OAuth2"]
    end
    
    B1 --> C4
    A2 --> C4
    B1 -- JWT Token --> C1
    A2 -- JWT Token --> C1
    C1 --> C2 & C3
    A1 <--> B2
    B2 --> B1
```

## 💻 Tech Stack

### 💳 Smart Card
- NFC-enabled health cards for offline data storage

### 🔌 Card Reader
- NFC Reader/Writer (USB/Bluetooth)

### 🖥️ Desktop App
- C# (.NET) for hospital-side access

### 📱 Mobile App
- Android (Flutter) for patient access

### ⚡ Backend API
- Python FastAPI

### 🗄️ Database
- PostgreSQL (structured patient data)

### 🗂️ File Storage
- S3/Blob Storage (scans, reports, bills)

### 🔒 Authentication
- OAuth2 / JWT (secure token-based access)

## 📚 Documentation

Comprehensive module-wise documentation is available in the [docs](./docs/) directory:

- [📖 Documentation Overview](./docs/README.md)
- [🔐 Authentication Module](./docs/auth.md) - JWT-based authentication and authorization
- [👥 User Management](./docs/user-management.md) - User profiles and role management  
- [💳 NFC Card Module](./docs/nfc-card.md) - Smart health card operations
- [🖥️ Hospital Desktop App](./docs/hospital-desktop.md) - C# desktop application for hospitals
- [📱 Patient Mobile App](./docs/patient-mobile.md) - Flutter mobile app for patients
- [⚡ Backend API](./docs/backend-api.md) - FastAPI backend services
- [🗄️ Database Schema](./docs/database.md) - PostgreSQL database structure
- [🗂️ File Storage](./docs/file-storage.md) - S3/Blob storage for medical files
- [🛡️ Security](./docs/security.md) - Security implementation and best practices
- [🚀 Deployment](./docs/deployment.md) - Production deployment guide

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