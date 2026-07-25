# Desktop Client — Architecture & Developer Guide

> **Location:** `client/`
> **Stack:** Electron 28 + React 18 + TypeScript + Vite + Tailwind CSS + Shadcn UI

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [How Electron Works Here](#how-electron-works-here)
3. [Project Structure](#project-structure)
4. [Tech Stack Deep Dive](#tech-stack-deep-dive)
5. [Routing & Pages](#routing--pages)
6. [State Management](#state-management)
7. [API Layer](#api-layer)
8. [NFC Card Integration](#nfc-card-integration)
9. [Voice Input in Consultation](#voice-input-in-consultation)
10. [Form Handling & Validation](#form-handling--validation)
11. [Build & Packaging](#build--packaging)
12. [Environment Variables](#environment-variables)
13. [Development Tips](#development-tips)

---

## Overview

The desktop application is the **primary tool for hospital staff** — receptionists register patients and schedule appointments, doctors conduct consultations and write prescriptions.

It is built as a **standard React + Vite web application**, then wrapped in **Electron** to get:
- A native desktop window (with minimum size, title, icon).
- Access to local hardware (NFC card reader via SerialPort).
- Packaged installers for Windows, Mac, and Linux.

The React code has **no idea it is running inside Electron** — it just talks to `window.electronAPI` (exposed by the preload script) when it needs hardware access, and calls the backend REST API for all data.

---

## How Electron Works Here

Electron runs two processes:

### Main Process (`electron/main.js`)
This is a **Node.js process**. It:
1. Creates and manages the `BrowserWindow` (the visible window).
2. In development, loads the React app from the Vite dev server (`http://localhost:5173`).
3. In production, loads the React app from the built `dist/index.html`.
4. Manages the **NFC serial port** connection (more on this below).
5. Registers **IPC handlers** that the renderer can invoke.

```javascript
// Simplified from electron/main.js
const mainWindow = new BrowserWindow({
  width: 1200, height: 800, minWidth: 800, minHeight: 600,
  webPreferences: {
    nodeIntegration: false,       // Security: no direct Node access from React
    contextIsolation: true,       // Security: isolated JS contexts
    enableRemoteModule: false,    // Security: deprecated remote API disabled
    preload: path.join(__dirname, 'preload.js'),
  }
});
```

### Preload Script (`electron/preload.js`)
This runs in a special context that has access to **both** Node.js APIs and the browser's `window` object. It uses `contextBridge` to safely expose specific functions to the React renderer:

```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // NFC Hardware
  listPorts:         () => ipcRenderer.invoke('nfc:list-ports'),
  connectNFC:        (portPath) => ipcRenderer.invoke('nfc:connect', portPath),
  disconnectNFC:     () => ipcRenderer.invoke('nfc:disconnect'),
  // NFC Events (from main process → renderer)
  onNFCCardDetected: (callback) => ipcRenderer.on('nfc:card-detected', callback),
  onNFCConnected:    (callback) => ipcRenderer.on('nfc:connected', callback),
  onNFCDisconnected: (callback) => ipcRenderer.on('nfc:disconnected', callback),
  onNFCError:        (callback) => ipcRenderer.on('nfc:error', callback),
});
```

In React components, NFC is accessed via:
```typescript
// TypeScript: window.electronAPI is typed as a custom global
window.electronAPI.onNFCCardDetected((event, uid) => {
  // uid is the hex card UID, e.g., "A3F20B1C"
  searchPatientByNFC(uid);
});
```

### Renderer Process (React App)
A standard React SPA. It never knows it is in Electron unless it uses `window.electronAPI`.

---

## Project Structure

```
client/
├── electron/
│   ├── main.js         ← Electron main process (NFC, window management)
│   ├── main.cjs        ← CJS build of main.js (for Vite ES module compat)
│   └── preload.js      ← contextBridge IPC bridge
│
├── src/
│   ├── api/            ← API client functions
│   │   ├── auth.ts     ← Login, register, refresh, logout
│   │   ├── patients.ts ← Patient CRUD + search
│   │   ├── appointments.ts ← Appointment scheduling + management
│   │   ├── visits.ts   ← Consultation records
│   │   ├── medicalRecords.ts
│   │   ├── users.ts
│   │   └── index.ts    ← Re-exports all API functions
│   │
│   ├── components/     ← Reusable UI components
│   │   ├── ui/         ← Shadcn UI components (Button, Card, Dialog, etc.)
│   │   └── common/     ← App-specific shared components (PatientInfoCard, etc.)
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx  ← User session state (current user, login/logout)
│   │
│   ├── features/
│   │   ├── auth/       ← Auth-specific hooks and utilities
│   │   └── appointments/ ← Appointment-specific utilities
│   │
│   ├── hooks/
│   │   ├── usePatients.ts           ← Patient data fetching hooks
│   │   ├── useAppointments.ts       ← Appointment data fetching hooks
│   │   ├── useSpeechRecognition.ts  ← Web Speech API wrapper
│   │   ├── useLocalStorage.ts       ← Persistent local state
│   │   ├── useAsync.ts              ← Generic async state hook
│   │   └── use-toast.ts             ← Toast notification hook
│   │
│   ├── pages/          ← Page-level components (one per route)
│   │   ├── Login-Simple.tsx
│   │   ├── ReceptionistDashboard.tsx
│   │   ├── RegisterPatient.tsx
│   │   ├── ExistingPatient.tsx
│   │   ├── PatientDetails.tsx
│   │   ├── DoctorDashboard.tsx
│   │   ├── Consultation.tsx
│   │   ├── DoctorPatientView.tsx
│   │   ├── ViewVisit.tsx
│   │   └── NotFound.tsx
│   │
│   ├── router/
│   │   └── AppRouter.tsx  ← All route definitions
│   │
│   ├── types/          ← TypeScript interfaces (Patient, Appointment, Visit, etc.)
│   ├── lib/            ← Utility functions (cn helper for Tailwind)
│   └── utils/          ← Other utilities
│
├── public/             ← Static assets (favicon, etc.)
├── index.html          ← Vite entry HTML
├── vite.config.ts      ← Vite build configuration
├── tailwind.config.ts  ← Tailwind configuration with design tokens
├── components.json     ← Shadcn UI configuration
└── package.json
```

---

## Tech Stack Deep Dive

### Electron 28
The native desktop shell. Chosen because:
- The UI team already knows React/TypeScript.
- Provides access to SerialPort for the NFC hardware.
- Single codebase for Windows, Mac, Linux.
- Vite's dev server is fast and compatible.

### React 18 + TypeScript
Standard component-based UI. TypeScript is set to `strict` mode for maximum type safety.

### Vite 5
Build tool replacing Create React App. Provides:
- Lightning-fast Hot Module Replacement (HMR) in development.
- Optimized production bundle with code splitting.
- Native ESM support.

### Tailwind CSS 3 + Shadcn UI
**Tailwind CSS** provides utility classes for all layout and styling. The `tailwind.config.ts` defines a custom design system with CSS variables for colors, so the app can easily be themed.

**Shadcn UI** is not a traditional component library — it is a collection of copy-paste-able component primitives built on **Radix UI**. This means:
- Components are in the `src/components/ui/` directory and are fully customizable.
- Radix UI handles all accessibility (ARIA attributes, keyboard navigation, focus trapping).
- There is no version lock-in — the component code is owned by the project.

### TanStack Query (React Query v5)
Used for all server state. Key benefits:
- Automatic caching: Fetched patient data is cached and reused across pages.
- Background refetching: Data stays fresh without manual refresh logic.
- Loading/error states: Every query has `isLoading`, `isError`, `data` — no manual state management.
- Cache invalidation: After creating a visit, `queryClient.invalidateQueries(['visits'])` automatically refreshes the list.

### React Router 6 (HashRouter)
Provides client-side routing. **HashRouter** is used instead of BrowserRouter because Electron loads files from the filesystem (`file:///...`), not a web server. Without a server to handle HTML5 pushState URLs, the app would show a blank page on navigation. Hash-based URLs (`#/doctor`) always work because the hash is client-side only.

---

## Routing & Pages

The `AppRouter.tsx` defines all routes. Role-based redirect happens on the Login page: after successful login, the app reads the user's role from the JWT response and navigates to `/receptionist` or `/doctor`.

| Route | Component | Who Uses It |
|-------|-----------|-------------|
| `/` | `Login` | Everyone — entry point |
| `/receptionist` | `ReceptionistDashboard` | Receptionist |
| `/receptionist/register-patient` | `RegisterPatient` | Receptionist |
| `/receptionist/existing-patient` | `ExistingPatient` | Receptionist |
| `/patient-details/:patientId` | `PatientDetails` | Receptionist |
| `/doctor` | `DoctorDashboard` | Doctor |
| `/doctor/consultation/:patientId` | `Consultation` | Doctor |
| `/doctor/patient/:patientId` | `DoctorPatientView` | Doctor |
| `/doctor/visit/:visitId` | `ViewVisit` | Doctor |
| `*` | `NotFound` | — |

---

## State Management

The app uses **two state layers**:

### 1. Server State — TanStack Query
Any data that comes from the backend (patients, appointments, visits) is managed by React Query. Custom hooks in `src/hooks/` wrap the query logic:

```typescript
// src/hooks/usePatients.ts
export const usePatients = (query: string) => {
  return useQuery({
    queryKey: ['patients', query],
    queryFn: () => patientsApi.search(query),
    enabled: query.length > 2,
    staleTime: 1000 * 60, // 1 minute
  });
};
```

### 2. Client State — React Context
Only the **authenticated user session** is stored in global client state (`AuthContext`). This holds the current user's ID, name, role, and the JWT access token. On logout, the context is cleared and the user is redirected to the login page.

---

## API Layer

All HTTP calls are in `src/api/`. Each file corresponds to one resource:

```typescript
// src/api/patients.ts — example
const BASE = import.meta.env.VITE_API_BASE_URL;

export const patientsApi = {
  create: async (data: CreatePatientDto) => {
    const res = await fetch(`${BASE}/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  search: async (query: string) => { ... },
  getById: async (id: string) => { ... },
  update: async (id: string, data: UpdatePatientDto) => { ... },
};
```

All API files are re-exported from `src/api/index.ts` for clean imports:
```typescript
import { patientsApi, appointmentsApi, visitsApi } from '@/api';
```

---

## NFC Card Integration

This is the most distinctive feature of the desktop app. Here is how it works end-to-end:

### Hardware
A standard **NFC reader module** (e.g., RC522 or PN532) is connected to an **Arduino** (or CH340-based clone). The Arduino reads NFC card UIDs and sends them over **USB serial port** at **115200 baud rate**, one UID per line (e.g., `A3F20B1C\r\n`).

### Electron Main Process
On startup, Electron:
1. Scans all available serial ports via `SerialPort.list()`.
2. Looks for an Arduino by its Vendor ID (`0x2341` for Arduino, `0x1A86` for CH340).
3. Auto-connects to the first matching port.
4. Uses `ReadlineParser` to parse each newline-terminated UID string.
5. Validates that the string is a valid hex UID (`/^[0-9A-F]+$/i`).
6. Sends the UID to the renderer via `mainWindow.webContents.send('nfc:card-detected', uid)`.

### React Renderer
In pages like `ExistingPatient.tsx`, the component registers a listener for the NFC event:

```typescript
useEffect(() => {
  if (!window.electronAPI) return; // not in Electron (browser mode)

  const cleanup = window.electronAPI.onNFCCardDetected((event, uid) => {
    // uid = "A3F20B1C"
    // Search for patient by NFC UID
    patientsApi.search(uid).then(results => {
      if (results.length > 0) navigate(`/patient-details/${results[0].patient_id}`);
    });
  });

  return () => cleanup(); // remove listener on unmount
}, []);
```

### NFC UID → Patient Lookup
The server has an index on `patients.nfc_card_uid`. When the receptionist scans a card, the app calls `GET /api/patients?q=<uid>` which does an indexed lookup — this returns in milliseconds.

---

## Voice Input in Consultation

The `Consultation.tsx` page includes a **microphone button** that lets doctors dictate their diagnosis instead of typing.

### `useSpeechRecognition` Hook
Located at `src/hooks/useSpeechRecognition.ts`. It wraps the browser's native **Web Speech API** (`SpeechRecognition`):

```typescript
const {
  isListening,
  isSupported,
  interimTranscript,   // what the user is currently saying (not finalized)
  toggleListening,     // starts or stops recognition
} = useSpeechRecognition({
  onResult: (transcript, isInterim) => {
    if (!isInterim) {
      // Append finalized transcript to the diagnosis field
      setConsultationData(prev => ({
        ...prev,
        diagnosis: prev.diagnosis + ' ' + transcript
      }));
    }
  },
  onStart: () => toast.success('🎤 Listening... Start speaking'),
  onEnd: () => toast.info('🎤 Stopped listening'),
});
```

**How it works:**
1. Doctor clicks the mic button → `toggleListening()` is called.
2. The browser asks for microphone permission (once).
3. `SpeechRecognition` streams audio to Google's speech-to-text service.
4. Interim results (partial words) are shown in gray text in real time.
5. When the doctor pauses, the final transcript is appended to the diagnosis text field.
6. Doctor clicks the mic again (or it auto-stops) to end the session.

---

## Form Handling & Validation

Large forms like `RegisterPatient` and `Consultation` use **react-hook-form + Zod**:

```typescript
// Define schema
const patientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  dob: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']),
  blood_group: z.string().optional(),
  phone_number: z.string().regex(/^\d{10}$/, 'Must be 10 digits').optional(),
});

// Use in component
const { register, handleSubmit, formState: { errors } } = useForm<PatientData>({
  resolver: zodResolver(patientSchema),
});

// In JSX — errors shown inline
<Input {...register('phone_number')} />
{errors.phone_number && <p className="text-red-500">{errors.phone_number.message}</p>}
```

This means the API is never called with invalid data — all validation happens client-side first.

---

## Build & Packaging

### Development
```bash
# Runs both Vite (http://localhost:5173) and Electron concurrently
pnpm --filter client electron:dev
```
Electron loads the app from the Vite dev server. Changes to React code are reflected instantly via HMR without restarting Electron.

### Production Build
```bash
# 1. Vite builds the React app into dist/
# 2. electron-builder packages Electron + dist/ into an installer
pnpm --filter client electron:build
```

Output is in `client/dist-electron/`:
- **Windows:** `Medical Management System Setup.exe` (NSIS installer)
- **Mac:** `Medical Management System.dmg`
- **Linux:** `Medical Management System.AppImage`

The `package.json` `build` key configures `electron-builder`:
```json
{
  "build": {
    "appId": "com.medical.management",
    "productName": "Medical Management System",
    "win": { "target": "nsis" },
    "mac": { "target": "dmg" },
    "linux": { "target": "AppImage" }
  }
}
```

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Base URL for the backend API | `http://localhost:4000/api` |

All Vite environment variables must be prefixed with `VITE_` to be exposed in the React code. Access them via `import.meta.env.VITE_API_BASE_URL`.

---

## Development Tips

- **Browser mode:** Run `pnpm dev:client` to open the app in a browser. NFC features won't work (no Electron IPC), but all API functionality does. Useful for rapid UI iteration.
- **React DevTools:** In Electron dev mode, DevTools open automatically. You can inspect React component trees, React Query cache state, and network requests.
- **Prisma Studio:** Run `pnpm db:studio` to visually inspect the database and verify data is being saved correctly after API calls.
- **Adding a new page:** Create the component in `src/pages/`, add the route in `AppRouter.tsx`, and add any API calls in the appropriate `src/api/` file.
- **Shadcn UI components:** Add new components with `npx shadcn-ui add <component-name>` — they are downloaded into `src/components/ui/`.
