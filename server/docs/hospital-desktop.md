# Hospital Desktop Application

## Overview
**Electron + React** desktop application for hospital staff (receptionists and doctors) to manage patient records, scan NFC cards, schedule appointments, and conduct consultations.

> **Location:** `client/`
> **📖 [Full Desktop Client Documentation →](./client-architecture.md)**

## Features
- NFC/RFID card scanning for instant patient lookup
- Patient registration and profile management
- Appointment scheduling and management
- Doctor consultation interface (split-panel view)
- Voice input for doctor diagnosis notes (Web Speech API)
- Push notification delivery via Firebase FCM
- PDF-based prescription viewing

## Technology Stack
| Layer | Technology |
|-------|------------|
| Shell | Electron 28 |
| UI Framework | React 18 + TypeScript |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS 3 + Shadcn UI (Radix UI) |
| Server State | TanStack Query (React Query) |
| Client State | React Context |
| Routing | React Router 6 (HashRouter) |
| Forms | react-hook-form + Zod |
| Hardware | SerialPort (NFC/RFID reader via Arduino/CH340) |
| Notifications | Sonner (toast messages) |
| Packaging | electron-builder |

## How Electron is Used

Electron gives the web app two capabilities that browsers cannot provide:

1. **Hardware Access (NFC Serial Port):** The `electron/main.js` file directly manages the NFC card reader via Node.js's `serialport` package. It:
   - Lists available COM/serial ports on startup.
   - Auto-detects Arduino/CH340 chips (common NFC reader microcontrollers).
   - Connects and parses incoming data as hex card UIDs.
   - Sends card UIDs to the React renderer via **IPC (`mainWindow.webContents.send`)**.

2. **Native Window:** A proper desktop window with minimum size, custom title, and packaged installers (NSIS for Windows, DMG for Mac, AppImage for Linux).

## IPC Bridge (Preload Script)

Electron's `contextIsolation` is enabled for security. The `electron/preload.js` exposes only specific IPC functions to React via `contextBridge`:

```javascript
// electron/preload.js
// Exposed to React renderer as window.electronAPI
contextBridge.exposeInMainWorld('electronAPI', {
  listPorts:         ()          => ipcRenderer.invoke('nfc:list-ports'),
  connectNFC:        (portPath)  => ipcRenderer.invoke('nfc:connect', portPath),
  disconnectNFC:     ()          => ipcRenderer.invoke('nfc:disconnect'),
  onNFCCardDetected: (callback)  => ipcRenderer.on('nfc:card-detected', callback),
  onNFCConnected:    (callback)  => ipcRenderer.on('nfc:connected', callback),
  onNFCError:        (callback)  => ipcRenderer.on('nfc:error', callback),
});
```

## Electron Security Settings

```javascript
// electron/main.js
const win = new BrowserWindow({
  webPreferences: {
    nodeIntegration: false,     // React renderer cannot access Node APIs
    contextIsolation: true,     // Only contextBridge API exposed to renderer
    enableRemoteModule: false,  // Deprecated remote module disabled
    preload: path.join(__dirname, 'preload.js'),
  },
});
```

## Pages & Routes

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

## Main Modules

### Patient Management
- Search and view patient records by name, patient number, or NFC UID
- Register new patients with optional NFC card linking
- Update patient information
- View full medical history, allergies, and chronic conditions

### NFC Card Operations
```typescript
// React hook — calls Electron IPC to interact with the NFC reader
const { connectNFC, onCardDetected } = useNFCReader();

// When a card is scanned, the UID is used to look up the patient
const handleCardScan = async (uid: string) => {
  const patient = await api.patients.getByAnyId(uid);
  navigate(`/patient-details/${patient.patient_id}`);
};
```

### Consultation Interface
The `Consultation` page is a split-panel view:
- **Left panel**: Patient's full visit history (past diagnoses, prescriptions, notes)
- **Right panel**: Current consultation form (diagnosis, notes, advice, medications, next visit date)

Doctors can use **Voice Input** (Web Speech API) to dictate diagnosis notes directly into the text field.

### Appointment Management
- Create appointments with doctor, patient, department, date/time, and reason
- View today's and tomorrow's scheduled appointments (Doctor Dashboard)
- Update appointment status (scheduled → completed / cancelled)

## API Integration

All API calls use **TanStack Query** (`@tanstack/react-query`) for automatic caching, background refetching, and loading/error states:

```typescript
// Example: Fetching today's appointments for a doctor
const { data: appointments, isLoading } = useQuery({
  queryKey: ['appointments', 'today', doctorId],
  queryFn: () => api.appointments.getTodayByDoctor(doctorId),
});
```

The API base URL is configured via `client/.env`:
```env
VITE_API_BASE_URL=http://localhost:4000/api
```

## Form Validation

All forms use **react-hook-form** with **Zod resolvers**. Errors are shown inline per-field before any API request is made:

```typescript
// Example: Patient registration form schema (Zod)
const registerPatientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  dateOfBirth: z.string(),
  gender: z.enum(['Male', 'Female', 'Other']),
  bloodGroup: z.string(),
  phoneNumber: z.string().min(10, 'Enter a valid phone number'),
  nfcCardUid: z.string().optional(),
});
```

## Installation Requirements
- Windows 10/11 (primary), macOS, or Linux
- Node.js 18+ and pnpm 9+ (for development)
- Arduino + PN532 NFC/RFID module connected via USB (for NFC features)
- Network connectivity to the Node.js backend server

## Running the Desktop App

```bash
# Start server + Electron app together (recommended)
pnpm electron

# Start Electron app only (requires server running separately)
pnpm --filter client electron:dev
```

## Building the Electron Installer

```bash
# Build + package Electron installer (NSIS for Windows, DMG for macOS)
pnpm --filter client electron:build
```

Output is placed in `client/dist/`.