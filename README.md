# Hospital Management System

A comprehensive hospital management system with NFC card integration, featuring a desktop client application for hospital staff (receptionists and doctors) and a robust backend API server.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Project](#running-the-project)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Development](#development)
- [Commands Reference](#commands-reference)

## ✨ Features

### Receptionist Features
- Patient registration with unique 10-digit patient numbers
- Patient search and lookup (by patient number, NFC card, or name)
- Appointment scheduling
- Patient profile management

### Doctor Features
- View today's and tomorrow's appointments
- Patient consultation with voice input support
- Medical history viewing
- Prescription and diagnosis management
- Visit records management

### System Features
- JWT-based authentication
- Role-based access control (Receptionist, Doctor)
- NFC card integration support
- Real-time appointment management
- Medical history tracking
- Appointment status management (Scheduled, Completed, Cancelled)
- Visit records linked to appointments

## 🛠 Tech Stack

### Frontend (Desktop Client)
- **Framework**: React 18 with TypeScript
- **UI Library**: Shadcn UI (Radix UI components)
- **Styling**: Tailwind CSS
- **State Management**: Zustand, React Query
- **Routing**: React Router
- **Desktop**: Electron
- **Build Tool**: Vite
- **Notifications**: Sonner

### Backend (Server)
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM (v7)
- **Authentication**: JWT (Access & Refresh tokens)
- **Validation**: Zod
- **Password Hashing**: bcryptjs

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **pnpm** (v9 or higher) - `npm install -g pnpm`
- **PostgreSQL** (v14 or higher) - or use Neon DB (remote)
- **Git**

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd finalYearProject
```

### 2. Install Dependencies

```bash
pnpm install
```

This installs dependencies for both client and server using pnpm workspaces.

## ⚙️ Configuration

### Backend Configuration

1. Navigate to the `server` directory
2. Create a `.env` file:

```bash
cd server
cp .env.example .env
```

3. Configure the following environment variables in `server/.env`:

```env
# Database (local PostgreSQL or Neon DB)
DATABASE_URL="postgresql://username:password@localhost:5432/hospital_db?schema=public"
# Or for Neon DB:
# DATABASE_URL="postgresql://user:pass@host.neon.tech/db?sslmode=require"

# JWT Secrets
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Server
PORT=4000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### Frontend Configuration

1. Navigate to the `desktop-client` directory
2. Create a `.env` file (if needed):

```env
VITE_API_BASE_URL=http://localhost:4000/api
```

## 🏃 Running the Project

### Quick Start (Recommended)

```bash
# Start both server and client (web mode)
pnpm dev

# Or start server + Electron desktop app
pnpm electron
```

### Individual Services

```bash
# Backend only (port 4000)
pnpm dev:server

# Frontend only (port 5173)
pnpm dev:client

# Electron desktop app (requires server running separately)
pnpm --filter client electron:dev
```

### Database Setup

If using a **new database**, run migrations:

```bash
# Create tables (only for new databases)
pnpm db:migrate

# Generate Prisma client (required on new machines)
pnpm db:generate

# Seed with test data (optional)
pnpm db:seed
```

If connecting to an **existing Neon DB** with tables already created:

```bash
# Just generate the client
pnpm db:generate

# Then start the app
pnpm electron
```

## 📁 Project Structure

```
finalYearProject/
├── package.json            # Root workspace config (pnpm)
├── pnpm-workspace.yaml     # Workspace definition
├── .npmrc                 # pnpm configuration
├── server/                # Backend API server
│   ├── src/
│   │   ├── app/
│   │   │   ├── config/    # Configuration files
│   │   │   ├── constants/ # Constants and enums
│   │   │   ├── middlewares/# Express middlewares
│   │   │   ├── modules/   # Feature modules (auth, patient, etc.)
│   │   │   ├── types/     # TypeScript type definitions
│   │   │   └── utils/     # Utility functions
│   │   └── main.ts        # Application entry point
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   └── migrations/    # Database migrations
│   ├── tests/             # Test scripts
│   └── package.json
│
├── client/                # React + Electron frontend
│   ├── src/
│   │   ├── api/          # API client functions
│   │   ├── components/   # React components
│   │   ├── contexts/     # React contexts
│   │   ├── hooks/        # Custom React hooks
│   │   ├── pages/        # Page components
│   │   ├── router/       # Routing configuration
│   │   └── utils/        # Utility functions
│   ├── electron/         # Electron configuration
│   └── package.json
│
├── commands.md            # Commands reference
├── todo.md                # Project todos and notes
└── README.md             # This file
```

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

### Patient Endpoints

- `POST /api/patients` - Register a new patient
- `GET /api/patients/:id` - Get patient by ID
- `GET /api/patients?q=...` - Search patients

### Appointment Endpoints

- `POST /api/appointments` - Create appointment
- `GET /api/appointments` - Get appointments (with filters)
- `GET /api/appointments/:id` - Get appointment by ID
- `GET /api/appointments/doctor/:doctor_id/today` - Get today's appointments
- `GET /api/appointments/doctor/:doctor_id/tomorrow` - Get tomorrow's appointments
- `PUT /api/appointments/:id` - Update appointment
- `PATCH /api/appointments/:id/cancel` - Cancel appointment

### Visit Endpoints

- `POST /api/visits` - Create visit
- `GET /api/visits/:id` - Get visit by ID
- `GET /api/visits?patient_id=...` - Get patient visits
- `PUT /api/visits/:id` - Update visit

For detailed API documentation, see `server/docs/backend-api.md`

## 🗄️ Database Schema

The database uses PostgreSQL with Prisma ORM. Key entities include:

- **Users** - Hospital staff (receptionists, doctors)
- **Patients** - Patient records with unique 10-digit numbers
- **Appointments** - Scheduled appointments
- **Visits** - Medical visit records linked to appointments
- **Hospitals** - Hospital information
- **Allergies** - Patient allergies
- **ChronicConditions** - Patient chronic conditions

For detailed schema information, see:
- `server/prisma/schema.prisma`
- `server/docs/database-design.md`
- `server/ER.md`

## 💻 Development

### Code Style

- TypeScript strict mode enabled
- ESLint for code linting
- Prettier for code formatting (if configured)

### Adding New Features

1. **Backend**: Create a new module in `server/src/app/modules/`
2. **Frontend**: Create components in `client/src/components/` or pages in `client/src/pages/`
3. **Database**: Update `server/prisma/schema.prisma` and run migrations

### Database Migrations

```bash
# Create a new migration
pnpm db:migrate

# Apply migrations (production)
cd server && npx prisma migrate deploy

# Push schema changes (development only)
cd server && npx prisma db push
```

### Testing

```bash
# Backend tests (if available)
pnpm --filter server test

# Frontend tests (if available)
pnpm --filter client test

# All tests
pnpm test
```

## 📖 Commands Reference

This project uses **pnpm workspaces** for monorepo management.

### Development Commands

```bash
pnpm dev              # Start server + client (web mode)
pnpm electron         # Start server + Electron desktop app
pnpm dev:server       # Backend only (port 4000)
pnpm dev:client       # Frontend only (port 5173)
```

### Build Commands

```bash
pnpm build            # Build both client and server
pnpm build:server     # Build backend only
pnpm build:client     # Build frontend only
```

### Database Commands

```bash
pnpm db:migrate       # Run Prisma migrations
pnpm db:generate      # Generate Prisma client
pnpm db:studio        # Open Prisma Studio
pnpm db:seed          # Seed database with test data
```

### Maintenance Commands

```bash
pnpm lint             # Run ESLint on all packages
pnpm clean            # Remove all node_modules and builds
pnpm clean:install    # Fresh install (clean + install)
```

### Package-Specific Commands

```bash
# Add dependency to server only
pnpm --filter server add express

# Add dev dependency to client only
pnpm --filter client add -D @types/react

# Run command in specific package
pnpm --filter server exec prisma migrate dev
```

For more commands, see [commands.md](./commands.md)

## 🔐 Authentication

The system uses JWT-based authentication with access and refresh tokens:

- **Access Token**: Short-lived (15 minutes), used for API requests
- **Refresh Token**: Long-lived (7 days), used to obtain new access tokens

Tokens are stored in HTTP-only cookies for security.

## 👥 User Roles

- **Receptionist**: Patient registration, appointment scheduling
- **Doctor**: Patient consultation, medical history viewing, prescription management

## 📝 Notes

- Patient numbers are automatically generated as 10-digit sequential IDs
- Appointments can be linked to visits (when consultation is completed)
- Visit creation automatically updates appointment status to "completed"
- NFC card integration is supported for patient identification

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

See [LICENSE](./server/LICENSE) for details.

## 📞 Support

For issues and questions, please open an issue in the repository.

---

**Built with ❤️ for efficient hospital management**

