#  MediLocker (NFC Based Smart Patient Health Card System)

> A full-stack, multi-platform healthcare management system featuring an **Electron desktop app** for hospital staff, a **Flutter mobile app** for patients, and a **Node.js central server** — all connected to a shared PostgreSQL database.

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [System Architecture](#-system-architecture)
3. [Project Flow — End to End](#-project-flow--end-to-end)
4. [Component Deep Dives](#-component-deep-dives)
   - [Central Server (Backend)](#1-central-server-backend)
   - [Desktop Application (Electron)](#2-desktop-application-electron)
   - [Mobile Application (Flutter — MediLocker)](#3-mobile-application-flutter--medilocker)
5. [Database Schema](#-database-schema)
6. [Third-Party Integrations](#-third-party-integrations)
7. [Security Model](#-security-model)
8. [Tech Stack Summary](#-tech-stack-summary)
9. [Prerequisites](#-prerequisites)
10. [Installation & Setup](#-installation--setup)
11. [Configuration](#-configuration)
12. [Running the Project](#-running-the-project)
13. [API Reference](#-api-reference)
14. [Project Structure](#-project-structure)
15. [Commands Reference](#-commands-reference)
16. [Documentation Index](#-detailed-documentation-index)

---

## 🌐 Project Overview

**MediLocker** is a **final year project** — an NFC-based smart patient health card system that digitizes the complete patient journey in a hospital — from a patient walking in at reception, getting an appointment, undergoing a consultation, receiving a prescription, to reviewing their visit history from their phone.

The system is built as a **monorepo** containing three distinct but interconnected applications:

| Component | Technology | Audience | Purpose |
|---|---|---|---|
| **Central Server** | Node.js + Express + PostgreSQL | Internal | The single source of truth for all data. Exposes a REST API, handles FCM push notifications, and Twilio OTP. |
| **Desktop App** | Electron + React | Doctors & Hospital Staff (Receptionists) | NFC card check-in, patient registration, appointment scheduling, and doctor consultations. |
| **Mobile App (MediLocker)** | Flutter + Dart | Patients | Access clinical records, consultation history, prescriptions, appointment records, and receive real-time medical push notifications. |

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      HOSPITAL NETWORK                           │
│                                                                 │
│   ┌─────────────────────────┐                                   │
│   │   ELECTRON DESKTOP APP  │  ← Hospital Staff (LAN/Local)    │
│   │  (React + TypeScript)   │                                   │
│   └────────────┬────────────┘                                   │
│                │  REST API (HTTP/JSON)                          │
│                ▼                                                 │
│   ┌─────────────────────────┐     ┌───────────────────────┐     │
│   │    CENTRAL SERVER       │────▶│   PostgreSQL Database  │    │
│   │  (Node.js + Express)    │     │   (via Prisma ORM)    │     │
│   └────────────┬────────────┘     └───────────────────────┘     │
│                │  Push (FCM) / SMS (Twilio)                      │
│                ▼                                                 │
│   ┌─────────────────────────┐                                   │
│   │  FLUTTER MOBILE APP     │  ← Patients (Internet)           │
│   │     (MediLocker)        │                                   │
│   └─────────────────────────┘                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Key architectural decisions:**
- **Monorepo (pnpm workspaces):** The server and desktop client share the same repository root for easier co-development, shared tooling, and single-command startup.
- **REST over HTTP:** Simple, stateless JSON APIs. Easy to debug, test with Postman, and consumed by both Electron and Flutter without any special protocol.
- **Electron wraps React:** The desktop UI is a standard React + Vite web app. Electron provides the native window and hardware access (NFC serial port). This lets the team use standard web tooling while still getting native capabilities.
- **Provider pattern in Flutter:** Simple, pragmatic state management for the mobile app without the overhead of BLoC or Riverpod.

---

## 🔄 Project Flow — End to End

Here is the complete lifecycle of a patient interaction with the system:

### Step 1: Patient Registration (Receptionist → Desktop App)
1. A new patient arrives at the hospital reception.
2. The receptionist opens the **Desktop App** and navigates to "Register New Patient."
3. They fill out the patient's demographic information (name, DOB, gender, blood group, contact, allergies, chronic conditions).
4. Optionally, an **NFC card** is scanned. The Electron main process reads the card's UID from the serial port and associates it with the patient profile.
5. The server creates the patient record and auto-generates a unique **10-digit Patient Number**.
6. The receptionist hands the patient their card (with NFC UID) and patient number.

### Step 2: Patient Account & Mobile App Access
1. During registration, a user account (`UserRole: patient`) is created on the server with their phone number.
2. The patient downloads the **MediLocker Flutter app** and logs in using **OTP (One-Time Password)**.
3. Twilio sends an OTP SMS to the patient's registered phone number. On the **free tier**, only Twilio-verified/registered phone numbers can receive OTPs.
4. After OTP verification, the server issues a JWT session token stored securely on the device.
5. Upon first login, the app registers the device's **FCM token** with the server so the patient can receive push notifications.

### Step 3: Appointment Scheduling (Receptionist → Desktop App)
1. The receptionist schedules an appointment, selecting the doctor, department, date/time, and reason.
2. On the server, the appointment is saved with `status: scheduled`.
3. The server's **Notification Service** triggers a **Firebase Cloud Messaging (FCM)** push notification: *"Your appointment with Dr. X is confirmed for [date]."*
4. The patient sees this notification on their MediLocker app in real time.

### Step 4: Patient Check-In (NFC / RFID Card Scan)
1. When the patient arrives on the appointment day, the receptionist can scan their **NFC/RFID card**.
2. The hardware is an **Arduino** microcontroller with a **PN532 NFC/RFID sensor module** connected via USB. The Arduino reads the card's UID and sends it over the serial port.
3. The Desktop App (via Electron IPC) reads the UID from the serial port, instantly looks up the patient in the database, and opens their profile — no manual searching needed.

### Step 5: Consultation (Doctor → Desktop App)
1. The doctor logs into the Desktop App and opens their **Doctor Dashboard**.
2. The dashboard shows today's and tomorrow's scheduled appointments.
3. The doctor selects a patient and starts a consultation. The **Consultation page** is a split-panel view showing:
   - The patient's past visit history (left panel)
   - The current consultation form (right panel)
4. The doctor can use **Voice Input** (Web Speech API) to dictate the diagnosis directly into the text field.
5. The doctor fills in: diagnosis, notes, advice, medications (drug name, dosage, frequency, duration), and next visit date.
6. On saving, the server:
   - Creates a `Visit` record linked to the appointment.
   - Creates a `Prescription` with associated `Medication` entries.
   - Updates the `Appointment` status to `completed`.
   - Sends a push notification to the patient: *"Your visit is complete. Your prescription is now available."*

### Step 6: Patient Reviews Records (Flutter Mobile App)
1. The patient opens MediLocker and sees a push notification and a badge on the notifications tab.
2. In the **Clinical Records** screen, they can view the full visit summary: diagnosis, doctor's notes, and advice.
3. They can see their **previous consultations by the doctor** — a complete history of every visit, sorted by date.
4. In the **Prescriptions** section of each consultation, all medications (drug name, dosage, frequency, duration) are listed and viewable.
5. In the **Appointments** screen, their appointment is now marked as "Completed."
6. The prescription is viewable and can be downloaded as a **PDF** directly in the app — making it easy to show at a pharmacy.
7. Bills generated during the visit are visible in the **Bills** screen with itemized sections.

---

## 🧩 Component Deep Dives

### 1. Central Server (Backend)

> **Location:** `server/`
> **📖 [Full Backend Documentation →](./server/docs/backend-api.md)** | **[Database Design →](./server/docs/database-design.md)**

The server is the backbone of the entire system. Every piece of data flows through it.

**Tech Stack:** Node.js, TypeScript, Express.js, Prisma ORM v7, PostgreSQL, Zod, JWT, bcryptjs, Firebase Admin SDK, Twilio

#### Module Structure
The server follows a **feature-based module pattern**. Each feature (e.g., `patient`, `appointment`) is self-contained with its own controller, service, routes, and model:

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

#### Key Design Patterns
- **Controller → Service → Prisma:** Every route handler delegates business logic to a service function, which talks to the database via Prisma. Controllers only handle HTTP request/response parsing.
- **Zod Validation Middleware:** All incoming request bodies are validated against strict Zod schemas before reaching the controller. Malformed requests are rejected immediately.
- **JWT Middleware:** A reusable `auth.middleware.ts` extracts and verifies the JWT from the `Authorization` header. It injects the decoded user into `req.user` for downstream use.
- **Centralized Error Handling:** An `error.middleware.ts` catches all unhandled errors and formats them into consistent JSON error responses.

#### Authentication Flow
```
POST /api/auth/login
  → Validates credentials (bcryptjs password check)
  → Returns: { accessToken (15min), refreshToken (7d) }

POST /api/auth/refresh
  → Validates the refreshToken from DB
  → Returns: new { accessToken }
```
The refresh token is stored in the `refresh_tokens` table for server-side invalidation on logout.

#### Highlighted Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Authenticate user (staff or patient) |
| `POST` | `/api/patients` | Register a new patient |
| `GET` | `/api/patients?q=...` | Search patients by name, number, or NFC UID |
| `GET` | `/api/appointments/doctor/:id/today` | Get today's appointments for a doctor |
| `POST` | `/api/visits` | Record a consultation (creates Visit + Prescription) |
| `POST` | `/api/notifications/device-token` | Register mobile device FCM token |

---

### 2. Desktop Application (Electron)

> **Location:** `client/`
> **📖 [Full Desktop Client Documentation →](./client/docs/client-architecture.md)**

The desktop app is a **React 18 + TypeScript** single-page application running inside an **Electron** shell. It is the primary tool for hospital staff.

**Tech Stack:** Electron 28, React 18, TypeScript, Vite, Tailwind CSS, Shadcn UI (Radix UI), TanStack Query, React Router, Sonner, Zod, react-hook-form, SerialPort

#### How Electron is Used
Electron gives the web app two capabilities that browsers cannot provide:

1. **Hardware Access (NFC Serial Port):** The `electron/main.js` file directly manages the NFC card reader via Node.js's `serialport` package. It:
   - Lists available COM/serial ports on startup.
   - Auto-detects Arduino/CH340 chips (common NFC reader microcontrollers).
   - Connects and parses incoming data as hex card UIDs.
   - Sends card UIDs to the React renderer via **IPC (`mainWindow.webContents.send`)**.

2. **Native Window:** A proper desktop window with a minimum size, custom title, and packaged installers (NSIS for Windows, DMG for Mac, AppImage for Linux).

#### IPC Bridge (Preload Script)
Electron's `contextIsolation` is enabled for security. The `electron/preload.js` exposes only specific IPC functions to React via `contextBridge`:

```javascript
// Exposed to React renderer as window.electronAPI
contextBridge.exposeInMainWorld('electronAPI', {
  listPorts:        ()         => ipcRenderer.invoke('nfc:list-ports'),
  connectNFC:       (portPath) => ipcRenderer.invoke('nfc:connect', portPath),
  disconnectNFC:    ()         => ipcRenderer.invoke('nfc:disconnect'),
  onNFCCardDetected:(callback) => ipcRenderer.on('nfc:card-detected', callback),
  onNFCConnected:   (callback) => ipcRenderer.on('nfc:connected', callback),
  onNFCError:       (callback) => ipcRenderer.on('nfc:error', callback),
});
```

#### Pages & Routes

| Route | Page | Role | Description |
|-------|------|------|-------------|
| `/` | `Login` | All | Login form with role-based redirect |
| `/receptionist` | `ReceptionistDashboard` | Receptionist | Dashboard with quick action buttons |
| `/receptionist/register-patient` | `RegisterPatient` | Receptionist | Multi-section patient registration form |
| `/receptionist/existing-patient` | `ExistingPatient` | Receptionist | Search patients + NFC scan lookup |
| `/patient-details/:patientId` | `PatientDetails` | Receptionist | Full patient profile view |
| `/doctor` | `DoctorDashboard` | Doctor | Today's / tomorrow's appointment list |
| `/doctor/consultation/:patientId` | `Consultation` | Doctor | Split-panel consultation + prescription form |
| `/doctor/visit/:visitId` | `ViewVisit` | Doctor | Completed visit details viewer |

#### Notable Features
- **Voice Input in Consultation:** The `useSpeechRecognition` custom hook wraps the browser's Web Speech API. Doctors can click the microphone button and dictate their diagnosis notes, which are appended to the text field in real time. Interim results are shown while the doctor is still speaking.
- **React Query for Server State:** All API calls use `@tanstack/react-query`, providing automatic caching, background refetching, and loading/error states without manual `useEffect` logic.
- **Form Validation with Zod:** All forms (`RegisterPatient`, `Consultation`) use `react-hook-form` with Zod resolvers. Errors are shown inline per-field before any API request is made.

---

### 3. Mobile Application (Flutter — MediLocker)

> **Location:** `app-client/`
> **📖 [Full Mobile App Documentation →](./app-client/docs/mobile-architecture.md)**

MediLocker is the **patient-facing mobile app** built in Flutter. Patients use it to access their digital health records, view upcoming appointments, read prescriptions, receive real-time notifications, and generate a QR code for quick hospital check-in.

**Tech Stack:** Flutter, Dart, Provider, GoRouter, Dio, SharedPreferences, FlutterSecureStorage, LocalAuth, Firebase Messaging (FCM), QR Flutter, Syncfusion PDF Viewer

#### Core Architecture
The app follows a clean **Provider + Service** pattern:

```
lib/
├── core/
│   ├── config/      → API endpoints, environment config
│   ├── constants/   → App colors, text styles
│   ├── models/      → Dart data models (Patient, Appointment, Visit, etc.)
│   ├── providers/   → State management (AuthProvider, PatientProvider, NotificationProvider)
│   ├── services/    → API calls, push notifications, PDF generation
│   └── widgets/     → Shared UI widgets
└── screens/
    ├── auth/         → Login screen
    ├── home/         → Main tab scaffold
    ├── appointments/ → Appointment list + detail
    ├── records/      → Visit history + record detail
    ├── bills/        → Bill summary + payment status
    ├── notifications/→ Notification inbox
    ├── profile/      → Patient profile + QR code
    └── emergency/    → Emergency contact info
```

#### Startup & Initialization (`main.dart`)
1. Flutter bindings are initialized.
2. **dotenv** loads the `.env` file for the API base URL.
3. **Firebase** is initialized via `Firebase.initializeApp()`.
4. **PushNotificationService** requests notification permissions and retrieves the device's FCM token.
5. The FCM token is sent to the backend and stored in the `device_tokens` table.
6. The app starts and checks `AuthProvider` to route to Login or the Main screen.

#### FCM Push Notification Flow
```
Hospital Action (e.g., appointment scheduled)
    → Server: notification.service.ts saves a Notification record in DB
    → Server: push.service.ts calls Firebase Admin SDK (sendEachForMulticast)
    → Firebase: delivers push to all of the patient's registered devices
    → Flutter: firebase_messaging package receives the message
    → PushNotificationService: broadcasts via StreamController
    → NotificationProvider: updates the UI notification badge count
```
Device tokens are automatically re-registered on refresh and stale tokens are pruned from the backend after a failed send.

#### Key Screens

| Screen | Description |
|--------|-------------|
| **Home** | Summary dashboard with upcoming appointment card and recent record highlights |
| **Appointments** | Full appointment history with status badges (Scheduled, Completed, Cancelled, No-Show) |
| **Records** | Visit history showing diagnosis, doctor's notes, advice, and medications per visit |
| **Bills** | Billing summary with itemized sections (Consultation, Pharmacy, Lab Tests, Imaging) |
| **Profile** | Patient profile with a generated **QR Code** of their patient number for quick hospital check-in |
| **Notifications** | In-app notification inbox with read/unread state |
| **Emergency** | Emergency contact information accessible without full authentication |

---

## 🗄 Database Schema

The database is a **PostgreSQL** relational database managed by **Prisma ORM v7**. It is designed around a clear separation between the administrative layer (scheduling) and the medical records layer (visits).

**📖 [Full Database Design Documentation →](./server/docs/database-design.md)**

### Entity Relationship Overview

```
Hospital ──< HospitalUser >── User
                              │
                    ┌─────────┴──────────┐
                    │                    │
                Patient              (Doctor/Staff)
                    │                    │
                    └────── Appointment ──┘
                                │
                              Visit ──── Prescription ──< Medication
                                │
                           ┌────┴────┐
                           │         │
                        Report    Bill ──< BillSection ──< BillItem

Patient ──< Notification
Patient ──< DeviceToken (FCM)
User    ──< RefreshToken
User    ──< AccessLog (Audit trail)
```

### Key Tables

| Table | Purpose |
|-------|---------|
| `users` | All system users. Role determines access: `patient`, `hospital_staff`, `admin` |
| `hospital_users` | Many-to-many: Users mapped to hospitals with a specific `HospitalRole` (doctor, receptionist, nurse, etc.) |
| `patients` | Patient demographic and medical info. Holds the unique `patient_number` and `nfc_card_uid` |
| `patient_allergies` | Allergies linked to a patient (with severity and notes) |
| `patient_chronic_conditions` | Chronic conditions with diagnosis date |
| `appointments` | Scheduled visits. Linked to a doctor, patient, and hospital. Status: `scheduled → confirmed → completed / cancelled` |
| `visits` | The actual medical encounter (diagnosis, notes, advice, next visit). Created by the doctor during consultation |
| `prescriptions` | One prescription per visit, linked to the prescribing doctor |
| `medications` | Individual drug entries under a prescription (drug name, dosage, frequency, duration) |
| `reports` | Uploaded medical files/reports (stored as file URLs) |
| `bills` | Financial bill tied 1-to-1 with a visit |
| `bill_sections` | Sections within a bill: `consultation`, `pharmacy`, `lab_test`, `imaging`, `other` |
| `bill_items` | Line items within a section (description, quantity, unit price) |
| `notifications` | In-app notification records for patients (appointment alerts, prescription ready, etc.) |
| `device_tokens` | FCM tokens per patient device for push notifications |
| `refresh_tokens` | Server-side JWT refresh token store for secure token rotation |
| `access_logs` | Audit trail: who did what, when, and from which IP address |

---

## 🔌 Third-Party Integrations

### Firebase Cloud Messaging (FCM)
- **Server side (`firebase-admin`):** The server uses the Firebase Admin SDK to send **multicast push notifications** to all of a patient's registered devices simultaneously. It then automatically prunes invalid or expired tokens from the `device_tokens` table.
- **Client side (`firebase_messaging`):** The Flutter app initializes FCM on startup, requests user permission, and registers its device token with the backend. It handles messages in all three app states: **foreground, background, and terminated**.
- **Notification types triggered:**
  - `appointment_scheduled` — when a new appointment is booked
  - `appointment_confirmed` — when an appointment is confirmed
  - `appointment_cancelled` — when an appointment is cancelled
  - `visit_recorded` — when the doctor finishes the consultation
  - `prescription_ready` — when a prescription is available
  - `bill_generated` — when a bill is created

### Twilio
- **Purpose:** SMS notifications for patients who may not have the MediLocker app installed.
- **Usage:** The server's `twilio` package sends SMS alerts (e.g., appointment confirmation to a phone number) as a fallback channel to FCM push notifications.

---

## 🔐 Security Model

### Authentication
- **JWT Access Token** (15-minute expiry): Sent in the `Authorization: Bearer <token>` header for every protected API request.
- **JWT Refresh Token** (7-day expiry): Stored in the `refresh_tokens` table. Used to issue new access tokens without requiring re-login. Immediately invalidated on logout.
- **Password Hashing:** All passwords are hashed with `bcryptjs` (salt rounds: 10) before storage. Plain text passwords are never stored.
- **Mobile Token Storage:** In Flutter, the JWT is stored in `flutter_secure_storage` which uses the platform keychain (iOS) or keystore (Android) — inaccessible to other apps.

### Authorization (Role-Based Access Control)
The `auth.middleware.ts` middleware decodes the JWT on every request and attaches the user's role to `req.user`. Controllers enforce role-specific access:

| Role | Access |
|------|--------|
| `hospital_staff` (Receptionist) | Register patients, schedule appointments, search patients, NFC lookup |
| `hospital_staff` (Doctor) | View their appointments, create visits, write prescriptions |
| `patient` | Read their own records, appointments, notifications, and bills |
| `admin` | Full system access |

### Electron Security
- `nodeIntegration: false` — The React renderer cannot access Node.js APIs directly.
- `contextIsolation: true` — The preload script uses `contextBridge` to expose only a minimal, typed API surface to React.
- `enableRemoteModule: false` — The deprecated remote module is disabled to prevent privilege escalation.

---

## 🛠 Tech Stack Summary

### Central Server
| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20 + TypeScript |
| Framework | Express.js 4 |
| Database | PostgreSQL 14+ |
| ORM | Prisma v7 |
| Auth | JWT (`jsonwebtoken`) + `bcryptjs` |
| Validation | Zod |
| Push Notifications | Firebase Admin SDK (FCM) |
| SMS | Twilio |

### Desktop Application (Electron)
| Layer | Technology |
|-------|-----------|
| Shell | Electron 28 |
| UI Framework | React 18 + TypeScript |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS 3 + Shadcn UI (Radix UI) |
| Server State | TanStack Query |
| Client State | React Context |
| Routing | React Router 6 (HashRouter) |
| Forms | react-hook-form + Zod |
| Hardware | SerialPort (NFC reader via Arduino/CH340) |
| Notifications | Sonner (toast messages) |
| Packaging | electron-builder |

### Mobile Application (Flutter)
| Layer | Technology |
|-------|-----------|
| Framework | Flutter + Dart |
| State | Provider |
| Navigation | GoRouter 13 |
| HTTP Client | Dio 5 |
| Local Storage | SharedPreferences |
| Secure Storage | flutter_secure_storage |
| Push Notifications | firebase_messaging (FCM) |
| PDF | `pdf` + `printing` + Syncfusion PDF Viewer |
| Biometrics | local_auth |
| QR Code | qr_flutter |

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v18 or higher
- **pnpm** v9 or higher — `npm install -g pnpm`
- **PostgreSQL** v14 or higher (local) or a [Neon DB](https://neon.tech) cloud connection string
- **Flutter SDK** 3.10 or higher (only required for mobile app development)
- **Git**

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd finalYearProject
```

### 2. Install Server & Desktop Client Dependencies

```bash
pnpm install
```

This installs dependencies for both `server/` and `client/` simultaneously using pnpm workspaces.

### 3. Install Mobile App Dependencies

```bash
cd app-client
flutter pub get
```

---

## ⚙️ Configuration

### Server (`server/.env`)

Create the file by copying the example:
```bash
cp server/.env.example server/.env
```

Fill in the values:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/hospital_db?schema=public"
# Or Neon DB:
# DATABASE_URL="postgresql://user:pass@host.neon.tech/db?sslmode=require"

# JWT
JWT_ACCESS_SECRET=your_long_random_access_secret_here
JWT_REFRESH_SECRET=your_long_random_refresh_secret_here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Server
PORT=4000
NODE_ENV=development

# CORS (desktop client origin)
FRONTEND_URL=http://localhost:5173

# Twilio (for SMS, optional)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx

# Firebase FCM (for push notifications, optional)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### Desktop Client (`client/.env`)

```env
VITE_API_BASE_URL=http://localhost:4000/api
```

### Mobile App (`app-client/.env`)

```env
API_BASE_URL=http://your-server-ip:4000/api
```

> **Note for local development on a physical Android device:** Use your machine's LAN IP address (e.g., `http://192.168.1.100:4000/api`) instead of `localhost`, because `localhost` on a physical device refers to the device itself, not your development machine.

---

## 🏃 Running the Project

### Quick Start (Server + Desktop App)

```bash
# Start backend (port 4000) + Electron desktop app together
pnpm electron

# Or, start backend + web version (port 5173) for browser testing
pnpm dev
```

### Individual Services

```bash
pnpm dev:server                      # Backend only (port 4000, hot-reload with nodemon)
pnpm dev:client                      # React frontend only (port 5173, Vite HMR)
pnpm --filter client electron:dev    # Electron app (requires server running separately)
```

### Database Setup (First Time)

```bash
# Run migrations to create all tables
pnpm db:migrate

# Generate the Prisma client
pnpm db:generate

# (Optional) Seed with sample data
pnpm db:seed
```

### If Connecting to an Existing Neon DB

```bash
# Tables already exist, just generate the client
pnpm db:generate

# Then start the app
pnpm electron
```

### Mobile App (Flutter)

```bash
cd app-client
flutter run            # Debug build on connected device/emulator
flutter run --release  # Production build
```

---

## 📚 API Reference

All endpoints are prefixed with `/api`. Protected routes require the `Authorization: Bearer <token>` header.

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Register a new user account |
| `POST` | `/auth/login` | Login and receive access + refresh tokens |
| `POST` | `/auth/refresh` | Exchange a refresh token for a new access token |
| `POST` | `/auth/logout` | Invalidate the current refresh token |

### Patients

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/patients` | Register a new patient |
| `GET` | `/patients/:id` | Get patient by ID |
| `PUT` | `/patients/:id` | Update patient info |
| `GET` | `/patients?q=` | Search by name, patient number, or NFC UID |

### Appointments

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/appointments` | Create an appointment |
| `GET` | `/appointments` | List appointments (with filters) |
| `GET` | `/appointments/:id` | Get appointment detail |
| `GET` | `/appointments/doctor/:id/today` | Doctor's appointments for today |
| `GET` | `/appointments/doctor/:id/tomorrow` | Doctor's appointments for tomorrow |
| `PUT` | `/appointments/:id` | Update appointment |
| `PATCH` | `/appointments/:id/cancel` | Cancel an appointment |

### Visits

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/visits` | Create a visit (consultation record + prescription) |
| `GET` | `/visits/:id` | Get visit details |
| `GET` | `/visits?patient_id=` | Get all visits for a patient |
| `PUT` | `/visits/:id` | Update a visit |

### Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/notifications/device-token` | Register a device's FCM token |
| `GET` | `/notifications` | Get patient's notification list |
| `PATCH` | `/notifications/:id/read` | Mark a notification as read |

> A Postman collection is available at `server/postman_collection.json` for testing all endpoints.

---

## 📁 Project Structure

```
finalYearProject/                  ← Monorepo root (pnpm workspaces)
├── package.json                   ← Root workspace scripts
├── pnpm-workspace.yaml            ← Declares "client" and "server" packages
├── README.md                      ← This file
│
├── server/                        ← Central Backend Server
│   ├── src/
│   │   ├── app/
│   │   │   ├── config/            ← Express app setup, DB config, env loader
│   │   │   ├── constants/         ← Shared constants and enums
│   │   │   ├── middlewares/       ← auth.ts, error.ts, validate.ts
│   │   │   ├── modules/           ← Feature modules (auth, patient, etc.)
│   │   │   ├── types/             ← TypeScript interfaces
│   │   │   └── utils/             ← Shared utility functions
│   │   └── main.ts                ← Server entry point
│   ├── prisma/
│   │   ├── schema.prisma          ← Full database schema (all 18 models)
│   │   └── migrations/            ← SQL migration history
│   └── docs/                      ← Backend documentation (see index below)
│
├── client/                        ← Electron + React Desktop App
│   ├── electron/
│   │   ├── main.js                ← Electron main process (NFC serial, window)
│   │   └── preload.js             ← Secure IPC bridge to React renderer
│   ├── src/
│   │   ├── api/                   ← API client functions (per resource)
│   │   ├── components/            ← Reusable Shadcn UI + custom components
│   │   ├── contexts/              ← AuthContext (user session state)
│   │   ├── features/              ← Feature-specific logic (appointments, auth)
│   │   ├── hooks/                 ← useSpeechRecognition, usePatients, etc.
│   │   ├── pages/                 ← Page-level components (routed views)
│   │   ├── router/                ← AppRouter with all defined routes
│   │   ├── types/                 ← TypeScript interfaces
│   │   └── utils/                 ← Utility functions
│   └── docs/
│       └── client-architecture.md ← Desktop app documentation
│
└── app-client/                    ← Flutter Mobile App (MediLocker)
    ├── lib/
    │   ├── main.dart              ← App entry point (Firebase + Provider setup)
    │   ├── core/
    │   │   ├── config/            ← API config, environment
    │   │   ├── constants/         ← App colors, strings
    │   │   ├── models/            ← Dart data models
    │   │   ├── providers/         ← AuthProvider, PatientProvider, NotificationProvider
    │   │   ├── services/          ← ApiService, PushNotificationService, BillPdfService
    │   │   └── widgets/           ← Shared widgets
    │   └── screens/               ← All screens (auth, home, records, etc.)
    ├── pubspec.yaml               ← Flutter dependencies
    └── docs/
        └── mobile-architecture.md ← Mobile app documentation
```

---

## 📖 Commands Reference

### Development

```bash
pnpm dev              # Server + web client (browser mode, port 5173)
pnpm electron         # Server + Electron desktop app
pnpm dev:server       # Backend only (port 4000, hot-reload)
pnpm dev:client       # React Vite frontend only (port 5173)
```

### Build

```bash
pnpm build                           # Build both client and server
pnpm build:server                    # TypeScript compile server
pnpm build:client                    # Vite production build
pnpm --filter client electron:build  # Build + package Electron installer
```

### Database

```bash
pnpm db:migrate       # Run Prisma migrations (creates/updates tables)
pnpm db:generate      # Generate Prisma client (run after schema changes)
pnpm db:studio        # Open Prisma Studio (visual DB browser at port 5555)
pnpm db:seed          # Seed DB with sample hospital data
```

### Maintenance

```bash
pnpm lint             # Run ESLint on all packages
pnpm clean            # Remove all node_modules and build folders
pnpm clean:install    # Clean then fresh install
```

### Package-Specific

```bash
pnpm --filter server add <pkg>        # Add dep to server only
pnpm --filter client add <pkg>        # Add dep to client only
pnpm --filter server exec prisma migrate dev  # Run Prisma command in server
```

---

## 📄 Detailed Documentation Index

| Document | Location | What it covers |
|----------|----------|----------------|
| **Desktop Client Architecture** | [client/docs/client-architecture.md](./client/docs/client-architecture.md) | Electron setup, IPC bridge, React structure, NFC integration, build & packaging |
| **Mobile App Architecture** | [app-client/docs/mobile-architecture.md](./app-client/docs/mobile-architecture.md) | Flutter folder structure, Provider pattern, FCM flow, biometrics, PDF generation |
| **Backend API Reference** | [server/docs/backend-api.md](./server/docs/backend-api.md) | All API endpoints, request/response formats, error codes |
| **Database Design** | [server/docs/database-design.md](./server/docs/database-design.md) | Full schema, ER diagram, table descriptions, data flow, design decisions |
| **Database ER Diagram** | [server/ER.md](./server/ER.md) | Compact entity-relationship diagram |
| **Security Documentation** | [server/docs/security.md](./server/docs/security.md) | JWT auth flow, RBAC permissions, data encryption, Electron security hardening |
| **NFC Implementation** | [server/docs/NFC_IMPLEMENTATION_SUMMARY.md](./server/docs/NFC_IMPLEMENTATION_SUMMARY.md) | How NFC card reading works end-to-end (hardware → Electron → React → API) |
| **Deployment Guide** | [server/docs/deployment.md](./server/docs/deployment.md) | Production deployment instructions for server and mobile app |
| **Commands Reference** | [commands.md](./commands.md) | Extended list of development, build, and maintenance commands |

---

## 📝 Important Notes

- Patient numbers are auto-generated as sequential 10-digit IDs (e.g., `0000000001`).
- Creating a `Visit` record automatically updates the linked `Appointment` status to `completed`.
- The NFC card UID is stored in `patients.nfc_card_uid` and is indexed for instant lookup.
- The Electron app uses `HashRouter` (not `BrowserRouter`) because Electron loads files from the filesystem, not a web server — hash-based URLs work without a server.
- FCM tokens are per-device, not per-user. A patient can have multiple devices registered and all will receive push notifications.
- Stale or invalid FCM tokens are automatically removed from the `device_tokens` table after a failed send attempt.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

---

## 📄 License

See [LICENSE](./server/LICENSE) for details.

---

<div align="center">
  <strong>Built with ❤️ as a Final Year Project</strong><br/>
  <em>MediLocker — NFC Based Smart Patient Health Card System</em>
</div>
