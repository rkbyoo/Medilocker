# API Module Documentation

This folder contains all API calls organized by feature. Each module handles specific domain operations and can be easily extended with new endpoints.

## Structure

```
src/api/
├── index.ts              # Central export point
├── auth.ts               # Authentication operations
├── patients.ts           # Patient management
├── appointments.ts       # Appointment scheduling
├── medicalRecords.ts     # Medical record operations
└── README.md            # This file
```

## Usage

### Import all APIs
```typescript
import { authApi, patientsApi, appointmentsApi, medicalRecordsApi } from '@/api';
```

### Import specific API
```typescript
import { authApi } from '@/api';
```

## Available APIs

### 1. Authentication API (`authApi`)

**Functions:**
- `login(credentials)` - Authenticate user
- `logout()` - Clear user session
- `getCurrentUser()` - Get current logged-in user
- `isAuthenticated()` - Check if user is authenticated
- `hasRole(role)` - Check if user has specific role

**Example:**
```typescript
const response = authApi.login({ username: 'doctor', password: 'doctor123' });
if (response.success) {
  console.log('Logged in:', response.user);
}
```

### 2. Patients API (`patientsApi`)

**Functions:**
- `getPatientById(id)` - Get patient by ID
- `createPatient(data)` - Register new patient
- `searchPatientsByName(searchTerm)` - Search by name
- `searchPatientsById(searchTerm)` - Search by ID
- `getAllPatients()` - Get all patients
- `calculateAge(dateOfBirth)` - Calculate patient age

**Example:**
```typescript
const response = patientsApi.createPatient({
  name: 'John Doe',
  dateOfBirth: '1990-01-01',
  gender: 'Male',
  bloodGroup: 'O+',
  // ... other fields
});
```

### 3. Appointments API (`appointmentsApi`)

**Functions:**
- `getAppointmentsByDoctorId(doctorId)` - Get doctor's appointments
- `getAppointmentsByPatientId(patientId)` - Get patient's appointments
- `createAppointment(data)` - Schedule new appointment
- `getTodaysAppointments(doctorId)` - Get today's appointments
- `getCompletedAppointments(doctorId, limit?)` - Get completed appointments
- `updateAppointmentStatus(appointmentId, status)` - Update status
- `formatAppointmentTime(dateTime)` - Format time display

**Example:**
```typescript
const response = appointmentsApi.createAppointment({
  patientId: '1234567890',
  patientName: 'John Doe',
  doctorId: 'D001',
  doctorName: 'Dr. Smith',
  department: 'Cardiology',
  reason: 'Checkup',
  dateTime: '2024-11-23T10:00:00'
});
```

### 4. Medical Records API (`medicalRecordsApi`)

**Functions:**
- `getMedicalRecordsByPatientId(patientId)` - Get patient's records
- `getMedicalRecordsByDoctorId(doctorId)` - Get doctor's records
- `getMedicalRecordById(id)` - Get single record
- `createMedicalRecord(data)` - Create new record
- `getLatestMedicalRecord(patientId)` - Get latest record
- `formatRecordDate(date)` - Format date display

**Example:**
```typescript
const response = medicalRecordsApi.createMedicalRecord({
  patientId: '1234567890',
  doctorId: 'D001',
  doctorName: 'Dr. Smith',
  diagnosis: 'Common cold',
  medications: 'Rest and fluids',
  advice: 'Stay hydrated',
  nextVisit: '2024-12-01'
});
```

## Adding New API Calls

### Step 1: Add function to appropriate API file

For example, to add a patient update function in `patients.ts`:

```typescript
/**
 * Update existing patient
 */
export const updatePatient = (id: string, data: Partial<Patient>): PatientResponse => {
  try {
    const patient = dummyPatients.find(p => p.id === id);
    
    if (!patient) {
      return { success: false, error: 'Patient not found' };
    }

    // In real app: PATCH to backend API
    Object.assign(patient, data);
    
    return { success: true, patient };
  } catch (error) {
    return { success: false, error: 'Failed to update patient' };
  }
};
```

### Step 2: Export types if needed

Add interface for request data in the same file:

```typescript
export interface UpdatePatientData {
  name?: string;
  phoneNumber?: string;
  address?: string;
  // ... other updatable fields
}
```

### Step 3: Re-export from index.ts (if adding new types)

```typescript
export type { UpdatePatientData } from './patients';
```

### Step 4: Use in components

```typescript
import { patientsApi } from '@/api';

const response = patientsApi.updatePatient(patientId, {
  phoneNumber: '+1-555-9999',
  address: 'New address'
});
```

## Creating New API Modules

To add a new feature (e.g., billing):

### 1. Create new file `src/api/billing.ts`:

```typescript
import { type Invoice } from '@/data/dummyData';

/**
 * Billing API
 * Handles all billing and invoice operations
 */

export interface CreateInvoiceData {
  patientId: string;
  amount: number;
  description: string;
}

export interface InvoiceResponse {
  success: boolean;
  invoice?: Invoice;
  error?: string;
}

export const createInvoice = (data: CreateInvoiceData): InvoiceResponse => {
  // Implementation
};

export const getInvoicesByPatientId = (patientId: string): Invoice[] => {
  // Implementation
};
```

### 2. Export from `index.ts`:

```typescript
import * as billingApi from './billing';

export {
  authApi,
  patientsApi,
  appointmentsApi,
  medicalRecordsApi,
  billingApi  // Add new API
};

export type { CreateInvoiceData, InvoiceResponse } from './billing';
```

### 3. Use in components:

```typescript
import { billingApi } from '@/api';
```

## Best Practices

1. **Consistent Response Format**: All create/update operations return `{ success, data?, error? }`
2. **Clear Function Names**: Use verb-noun pattern (e.g., `getPatientById`, `createAppointment`)
3. **JSDoc Comments**: Document all functions with purpose and parameters
4. **Type Safety**: Export interfaces for all request/response data
5. **Error Handling**: Always wrap operations in try-catch blocks
6. **Single Responsibility**: Each API file handles one domain/feature
7. **Reusable Utilities**: Extract common functions (e.g., `calculateAge`, `formatDate`)

## Transition to Real Backend

When connecting to a real backend, update functions to use `fetch` or `axios`:

```typescript
export const getPatientById = async (id: string): Promise<Patient | null> => {
  try {
    const response = await fetch(`/api/patients/${id}`);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
};
```

Only the API functions need to change - components remain the same!
