# NFC Card Module

## Overview
NFC/RFID cards used as **physical patient identifiers**. The card itself stores only its hardware **UID** — all patient data lives in the PostgreSQL database. The UID is used as a fast, touch-free database lookup key.

## Features
- Touch-free patient lookup by NFC card scan
- Instant patient profile retrieval via card UID
- Optional: patients can be registered without an NFC card
- Cross-hospital compatibility (UID is globally unique)
- Each card UID can only be linked to one patient (unique constraint)

## How the NFC Card Works

The NFC card (RFID) does **not** store patient data. It only exposes a hardware **card UID** (a read-only hex string printed on the chip, e.g., `04A1B2C3D4E5F6`).

### What is stored on the card
```
Card UID (hardware identifier only)
Example: 04A1B2C3D4E5F6
```

### What is stored in the database (`patients` table)
```sql
nfc_card_uid VARCHAR(100) UNIQUE  -- Optional, indexed for fast lookups
```

When a card is scanned:
1. The **Arduino** (with PN532 NFC module) reads the UID from the card via serial port.
2. The **Electron desktop app** receives the UID via IPC from the main process.
3. The app calls `GET /api/patients/:nfcCardUid` on the Express server.
4. The server looks up the patient record by UID and returns the full patient data.

## NFC Operations

### Read Card Data
```typescript
interface CardReader {
  readCard(): Promise<PatientData>;
  writeCard(data: PatientData): Promise<boolean>;
  verifyCard(): Promise<boolean>;
}
```

### Write Card Data
- Update patient information
- Sync with backend before writing
- Verify write operation success
- Log all card operations

## Security Features
- No patient data is written to the physical card — the UID is just a lookup key.
- The `nfc_card_uid` column has a unique constraint — each card can only be linked to one patient.
- All patient data is protected by the server's JWT authentication and RBAC system.
- Card scans are performed only within the authenticated Electron desktop app.
- All NFC card–related operations are recorded in the `access_logs` table.

## Integration Points

### Hospital Desktop App
- Read patient data from card
- Update card with new information
- Sync with backend database
- Print card reports

### Mobile App
- View card data (read-only)
- Request card updates
- Emergency access features
- Card status monitoring

## Error Handling
- Card read failures
- Data corruption detection
- Network sync issues
- Card replacement procedures

## Compliance
- HIPAA compliance for data storage
- ISO 14443 NFC standards
- Medical device regulations
- Data privacy requirements