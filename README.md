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
- **npm** (v9 or higher) or **yarn**
- **PostgreSQL** (v14 or higher)
- **Git**

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd finalYearProject
```

### 2. Install Dependencies

#### Backend Dependencies

```bash
cd server
npm install
```

#### Frontend Dependencies

```bash
cd ../desktop-client
npm install
```

## ⚙️ Configuration

### Backend Configuration

1. Navigate to the `server` directory
2. Create a `.env` file:

```bash
cd server
cp .env.example .env  # If you have an example file
```

3. Configure the following environment variables in `server/.env`:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/hospital_db?schema=public"

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

### Start the Backend Server

```bash
cd server
npm run dev
```

The server will start on `http://localhost:4000`

### Start the Frontend (Development)

#### Option 1: Web Development Mode

```bash
cd desktop-client
npm run dev
```

The app will be available at `http://localhost:5173`

#### Option 2: Electron Desktop App

```bash
cd desktop-client
npm run electron:dev
```

This will start both the Vite dev server and Electron app.

### Database Setup

1. **Create the database**:

```bash
# Using PostgreSQL CLI
createdb hospital_db
```

2. **Run Prisma migrations**:

```bash
cd server
npm run prisma:migrate
```

3. **Generate Prisma Client**:

```bash
npm run prisma:generate
```

4. **Seed the database** (optional):

```bash
npx ts-node tests/seed-database.ts
```

## 📁 Project Structure

```
finalYearProject/
├── server/                 # Backend API server
│   ├── src/
│   │   ├── app/
│   │   │   ├── config/     # Configuration files
│   │   │   ├── constants/  # Constants and enums
│   │   │   ├── middlewares/# Express middlewares
│   │   │   ├── modules/    # Feature modules (auth, patient, appointment, etc.)
│   │   │   ├── types/      # TypeScript type definitions
│   │   │   └── utils/      # Utility functions
│   │   └── main.ts         # Application entry point
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── migrations/     # Database migrations
│   ├── tests/              # Test scripts
│   └── package.json
│
├── desktop-client/         # Frontend desktop application
│   ├── src/
│   │   ├── api/           # API client functions
│   │   ├── components/     # React components
│   │   │   ├── common/     # Common/reusable components
│   │   │   └── ui/         # UI components (Shadcn)
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   ├── router/         # Routing configuration
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utility functions
│   ├── electron/           # Electron configuration
│   └── package.json
│
├── commands.md             # Commands reference
├── todo.md                 # Project todos and notes
└── README.md              # This file
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
2. **Frontend**: Create components in `desktop-client/src/components/` or pages in `desktop-client/src/pages/`
3. **Database**: Update `server/prisma/schema.prisma` and run migrations

### Database Migrations

```bash
cd server

# Create a new migration
npm run prisma:migrate

# Apply migrations
npm run prisma:migrate:deploy

# Push schema changes (development only)
npm run prisma:push
```

### Testing

```bash
# Backend tests (if available)
cd server
npm test

# Frontend tests (if available)
cd desktop-client
npm test
```

## 📖 Commands Reference

For a complete list of available commands, see [commands.md](./commands.md)

### Quick Commands

**Backend:**
```bash
cd server
npm run dev              # Start development server
npm run build            # Build for production
npm run prisma:generate  # Generate Prisma client
npm run prisma:studio    # Open Prisma Studio
```

**Frontend:**
```bash
cd desktop-client
npm run dev              # Start Vite dev server
npm run build            # Build for production
npm run electron:dev     # Run Electron app in dev mode
npm run electron:build    # Build Electron app
```

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

