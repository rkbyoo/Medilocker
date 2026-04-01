# NFC Integration Flow Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         HARDWARE LAYER                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────┐         ┌──────────────┐         ┌──────────────┐   │
│  │ NFC Card │ ──RF──> │ PN532 Module │ ──I2C─> │   Arduino    │   │
│  └──────────┘         └──────────────┘         └──────┬───────┘   │
│                                                        │           │
│                                                     USB│           │
└────────────────────────────────────────────────────────┼───────────┘
                                                         │
                                                         │ Serial
                                                         │ 115200 baud
                                                         │
┌────────────────────────────────────────────────────────┼───────────┐
│                      ELECTRON LAYER                    │           │
├────────────────────────────────────────────────────────┼───────────┤
│                                                        ▼           │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │              MAIN PROCESS (Node.js)                         │  │
│  │                                                              │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │ SerialPort Manager                                   │  │  │
│  │  │  - Auto-detect Arduino                               │  │  │
│  │  │  - Listen on COM port                                │  │  │
│  │  │  - Parse incoming UIDs                               │  │  │
│  │  └──────────────────┬───────────────────────────────────┘  │  │
│  │                     │                                       │  │
│  │                     │ IPC Events                            │  │
│  │                     │ (nfc:card-detected)                   │  │
│  │                     ▼                                       │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │ IPC Handlers                                         │  │  │
│  │  │  - nfc:list-ports                                    │  │  │
│  │  │  - nfc:connect                                       │  │  │
│  │  │  - nfc:disconnect                                    │  │  │
│  │  └──────────────────┬───────────────────────────────────┘  │  │
│  └────────────────────┼──────────────────────────────────────┘  │
│                       │                                          │
│                       │ IPC Bridge                               │
│                       │                                          │
│  ┌────────────────────┼──────────────────────────────────────┐  │
│  │              PRELOAD SCRIPT                              │  │
│  │                    │                                      │  │
│  │  window.electronAPI.nfc = {                              │  │
│  │    listPorts()                                           │  │
│  │    connect(port)                                         │  │
│  │    disconnect()                                          │  │
│  │    onCardDetected(callback)                              │  │
│  │  }                 │                                      │  │
│  └────────────────────┼──────────────────────────────────────┘  │
│                       │                                          │
│                       │ Context Bridge                           │
│                       │                                          │
│  ┌────────────────────┼──────────────────────────────────────┐  │
│  │           RENDERER PROCESS (React)                       │  │
│  │                    │                                      │  │
│  │  ┌─────────────────▼──────────────────────────────────┐  │  │
│  │  │ ExistingPatient Component                          │  │  │
│  │  │                                                     │  │  │
│  │  │  useEffect(() => {                                 │  │  │
│  │  │    window.electronAPI.nfc.onCardDetected(uid => {  │  │  │
│  │  │      searchPatient(uid)                            │  │  │
│  │  │    })                                              │  │  │
│  │  │  })                                                │  │  │
│  │  │                 │                                  │  │  │
│  │  └─────────────────┼──────────────────────────────────┘  │  │
│  │                    │                                      │  │
│  └────────────────────┼──────────────────────────────────────┘  │
└─────────────────────────┼────────────────────────────────────────┘
                          │
                          │ HTTP Request
                          │
┌─────────────────────────┼────────────────────────────────────────┐
│                    BACKEND LAYER                                 │
├─────────────────────────┼────────────────────────────────────────┤
│                         ▼                                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ API Endpoint: GET /api/patients/:id                      │   │
│  │  - Search by Patient ID                                  │   │
│  │  - Search by NFC UID                                     │   │
│  │  - Search by Name                                        │   │
│  │  - Search by Phone                                       │   │
│  └──────────────────────┬───────────────────────────────────┘   │
│                         │                                        │
│                         ▼                                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Database (PostgreSQL)                                    │   │
│  │  - patients table                                        │   │
│  │  - nfc_card_uid column                                   │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

## Data Flow Sequence

### 1. Initialization (App Startup)

```
App Start
    │
    ├─> Electron Main Process starts
    │       │
    │       ├─> Auto-scan for serial ports
    │       │       │
    │       │       └─> Find Arduino (vendor ID: 0x2341, 0x1A86)
    │       │
    │       └─> Auto-connect to Arduino
    │               │
    │               └─> Send 'nfc:connected' event to renderer
    │
    └─> React App loads
            │
            └─> ExistingPatient component mounts
                    │
                    └─> Subscribe to NFC events
```

### 2. Manual Connection (If Auto-connect Fails)

```
User clicks "Scan NFC Card"
    │
    ├─> Call window.electronAPI.nfc.listPorts()
    │       │
    │       └─> Returns: [{ path: 'COM3', manufacturer: 'Arduino' }]
    │
    ├─> User selects port from dropdown
    │
    └─> Call window.electronAPI.nfc.connect('COM3')
            │
            ├─> Main process opens serial port
            │
            └─> Send 'nfc:connected' event
                    │
                    └─> UI shows "Connected" status
```

### 3. Card Scanning Flow

```
User places NFC card near reader
    │
    ├─> Arduino PN532 detects card
    │       │
    │       └─> Read UID: [0x04, 0xA1, 0xB2, 0xC3]
    │
    ├─> Arduino converts to hex string: "04A1B2C3"
    │       │
    │       └─> Send via Serial: "04A1B2C3\r\n"
    │
    ├─> Electron Main Process receives data
    │       │
    │       ├─> Parse with ReadlineParser
    │       │
    │       └─> Emit 'nfc:card-detected' event with UID
    │
    ├─> React component receives UID
    │       │
    │       ├─> Show toast: "NFC Card detected: 04A1B2C3"
    │       │
    │       ├─> Set patientId state
    │       │
    │       └─> Call patientsApi.getPatientById('04A1B2C3')
    │
    ├─> Backend searches database
    │       │
    │       └─> Return patient data
    │
    └─> UI updates
            │
            ├─> Show patient profile
            │
            └─> Show appointment booking form
```

### 4. Error Handling

```
Error occurs
    │
    ├─> Serial port error
    │       │
    │       └─> Emit 'nfc:error' event
    │               │
    │               └─> Show toast: "NFC Reader error: ..."
    │
    ├─> Port disconnected
    │       │
    │       └─> Emit 'nfc:disconnected' event
    │               │
    │               └─> Update UI status
    │
    └─> Patient not found
            │
            └─> Show toast: "No patient found with this NFC card"
```

## Component Communication

```
┌─────────────────────────────────────────────────────────────┐
│                    React Component                          │
│                                                             │
│  State:                                                     │
│  - nfcConnected: boolean                                    │
│  - nfcScanning: boolean                                     │
│  - availablePorts: SerialPortInfo[]                         │
│  - selectedPort: string                                     │
│  - foundPatient: Patient | null                             │
│                                                             │
│  Effects:                                                   │
│  - Subscribe to NFC events on mount                         │
│  - Auto-search patient when UID received                    │
│                                                             │
│  Handlers:                                                  │
│  - handleOpenNFCDialog() → List ports                       │
│  - handleConnectNFC() → Connect to selected port            │
│  - handleDisconnectNFC() → Disconnect and close dialog      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                          ▲
                          │
                          │ IPC Events
                          │
┌─────────────────────────┼───────────────────────────────────┐
│                  Electron API                               │
│                         │                                   │
│  Methods:               │                                   │
│  - listPorts()          │                                   │
│  - connect(port)        │                                   │
│  - disconnect()         │                                   │
│                         │                                   │
│  Events:                │                                   │
│  - onCardDetected(cb)   │                                   │
│  - onConnected(cb)      │                                   │
│  - onDisconnected(cb)   │                                   │
│  - onError(cb)          │                                   │
│                         │                                   │
└─────────────────────────┼───────────────────────────────────┘
                          │
                          │ IPC Bridge
                          │
┌─────────────────────────┼───────────────────────────────────┐
│                  Main Process                               │
│                         │                                   │
│  IPC Handlers:          │                                   │
│  - nfc:list-ports       │                                   │
│  - nfc:connect          │                                   │
│  - nfc:disconnect       │                                   │
│                         │                                   │
│  Serial Port:           │                                   │
│  - SerialPort instance  │                                   │
│  - ReadlineParser       │                                   │
│  - Event listeners      │                                   │
│                         │                                   │
└─────────────────────────┼───────────────────────────────────┘
                          │
                          │ USB Serial
                          │
┌─────────────────────────┼───────────────────────────────────┐
│                      Arduino                                │
│                         │                                   │
│  Loop:                  │                                   │
│  1. Check for NFC card  │                                   │
│  2. Read UID            │                                   │
│  3. Convert to hex      │                                   │
│  4. Send via Serial     │                                   │
│  5. Debounce (500ms)    │                                   │
│                         │                                   │
└─────────────────────────────────────────────────────────────┘
```

## State Machine

```
┌─────────────┐
│ Disconnected│
└──────┬──────┘
       │
       │ User clicks "Scan NFC Card"
       │ OR Auto-connect on startup
       │
       ▼
┌─────────────┐
│ Connecting  │
└──────┬──────┘
       │
       │ Connection successful
       │
       ▼
┌─────────────┐
│  Connected  │◄────────┐
└──────┬──────┘         │
       │                │
       │ Card detected  │ Card removed
       │                │
       ▼                │
┌─────────────┐         │
│  Scanning   │─────────┘
└──────┬──────┘
       │
       │ UID received
       │
       ▼
┌─────────────┐
│  Searching  │
└──────┬──────┘
       │
       ├─> Patient found ──> Show profile
       │
       └─> Not found ──> Show error
```
