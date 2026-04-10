# NFC Card Implementation Summary

## Database Schema

The NFC card UID is stored in the `patients` table:

```sql
nfc_card_uid VARCHAR(100) UNIQUE -- Optional, indexed for fast lookups
```

### Key Features:
- **Optional field**: Patients can be registered without an NFC card
- **Unique constraint**: Each NFC card can only be linked to one patient
- **Indexed**: Fast lookups when scanning NFC cards
- **Max length**: 100 characters (supports various NFC UID formats)

## How It Works

### 1. Patient Registration
When registering a new patient in `/receptionist/register-patient`:
- Fill in all required patient information
- Optionally scan or manually enter the NFC Card UID
- The NFC card UID is saved to the database with the patient record

### 2. Patient Lookup
When looking up an existing patient in `/receptionist/existing-patient`:
- The NFC reader automatically connects on page load
- When an NFC card is scanned, the UID is sent to the backend
- The backend searches for a patient with that NFC card UID
- If found, the patient information is displayed
- You can then schedule an appointment for that patient

### 3. Backend Search Logic
The `findByAnyId` method in `patient.model.ts` supports multiple search methods:
1. **10-digit patient number** (e.g., 1234567890)
2. **Patient UUID** (e.g., 550e8400-e29b-41d4-a716-446655440000)
3. **NFC Card UID** (any format, e.g., 04A1B2C3D4E5F6)
4. **User UUID**

The search automatically detects the format and queries the appropriate field.

## API Endpoints

### Register Patient with NFC Card
```http
POST /api/patients
Content-Type: application/json

{
  "name": "John Doe",
  "dateOfBirth": "1990-01-15",
  "gender": "Male",
  "bloodGroup": "O+",
  "phoneNumber": "1234567890",
  "guardianPhone": "0987654321",
  "address": "123 Main St",
  "nfcCardUid": "04A1B2C3D4E5F6",
  ...
}
```

### Search Patient by NFC Card
```http
GET /api/patients/04A1B2C3D4E5F6
```

The same endpoint works for:
- Patient number: `/api/patients/1234567890`
- Patient UUID: `/api/patients/550e8400-e29b-41d4-a716-446655440000`
- NFC Card UID: `/api/patients/04A1B2C3D4E5F6`

## Files Modified

### Backend
1. `server/prisma/schema.prisma` - Already had `nfc_card_uid` field
2. `server/src/app/modules/patient/patient.dto.ts` - Added `nfcCardUid` to CreatePatientDto
3. `server/src/app/modules/patient/patient.service.ts` - Pass `nfc_card_uid` to model
4. `server/src/app/modules/patient/patient.model.ts` - Accept `nfc_card_uid` in createPatientWithUser

### Frontend
1. `client/src/pages/RegisterPatient.tsx` - Added NFC Card UID input field
2. `client/src/pages/ExistingPatient.tsx` - Already supports NFC scanning
3. `client/electron/main.js` - Fixed port cleanup issues

## Usage Flow

### Registering a Patient with NFC Card
1. Go to "Register New Patient"
2. Fill in patient information
3. Scan NFC card or manually enter UID in the "NFC Card UID" field
4. Click "Register Patient"
5. The NFC card is now linked to this patient

### Looking Up a Patient with NFC Card
1. Go to "Existing Patient Lookup"
2. NFC reader connects automatically
3. Scan the patient's NFC card
4. Patient information appears automatically
5. Schedule an appointment if needed

## Benefits

- **Fast patient lookup**: No need to remember or type patient IDs
- **Reduced errors**: Eliminates manual ID entry mistakes
- **Better patient experience**: Quick and seamless check-in
- **Flexible**: Works alongside traditional ID-based lookup
- **Secure**: Each card is uniquely linked to one patient

## Troubleshooting

### NFC Reader Not Connecting
- Check if Arduino is connected via USB
- Verify COM port in Device Manager (Windows)
- Try manually connecting through the NFC dialog
- Restart the Electron app

### Port Access Denied Error
- Close and reopen the patient lookup page
- The app now properly releases the port on unmount
- Wait 1-2 seconds before reopening

### Card Not Recognized
- Ensure the NFC card UID is correctly saved in the database
- Check that the Arduino is reading the card correctly
- Verify the UID format matches what's stored in the database
