# Patient Mobile App Requirements

## Overview
React Native mobile application for patients to access their health records, appointments, and medical history from the Hospital Management System.

## Functional Requirements

### 1. Authentication & Onboarding

#### FR-1.1 Login Flow
- Patient enters **Phone Number** and **Patient Number** (10-digit ID)
- System validates if phone number matches the patient number in database
- If valid, OTP is sent to the phone number via SMS
- Patient enters 6-digit OTP to complete login
- First successful login creates permanent session
- Subsequent logins only require phone + patient number + OTP

#### FR-1.2 Session Management
- JWT tokens with 30-day refresh cycle
- Biometric authentication option (fingerprint/face) after first login
- Auto-logout after 30 days of inactivity
- Manual logout option in settings

#### FR-1.3 Account Recovery
- Option to resend OTP if not received within 60 seconds
- Maximum 3 OTP attempts before temporary lockout (15 minutes)

---

### 2. Profile Management

#### FR-2.1 View Profile
Display read-only patient information:
- Personal: Name, Date of Birth, Gender, Blood Group
- Contact: Phone Number, Address
- Emergency: Emergency Contact Name and Phone
- Guardian: Guardian Phone Number
- Demographics: Marital Status, Spouse Name, Caste, Religion, Nationality
- Card Status: NFC Card linked/unlinked indicator

#### FR-2.2 Edit Profile
Editable fields:
- Address (full text)
- Phone Number (with verification)
- Emergency Contact Name
- Emergency Contact Phone
- Guardian Phone

#### FR-2.3 Medical Profile View
- List of Allergies (name, severity, notes)
- List of Chronic Conditions (name, diagnosed date, notes)

---

### 3. Medical Records (Visits)

#### FR-3.1 Visit List
- Chronological list of all visits (newest first)
- Display: Hospital name, Doctor name, Visit date, Visit type icon
- Filter by: Date range, Hospital, Doctor
- Search by doctor name or hospital

#### FR-3.2 Visit Details
- Header: Visit date, Hospital, Doctor name, Visit type
- Diagnosis section
- Doctor notes/advice
- Next visit recommendation date
- Prescription section
- Medical reports section

#### FR-3.3 Prescription View
- List of medications per visit
- Each medication: Drug name, Dosage, Frequency, Duration, Instructions
- Option to download prescription as PDF

#### FR-3.4 Medical Reports
- View all reports attached to visits
- Report types: Lab Tests, Imaging (X-ray, MRI, CT), Other
- View report files (PDF viewer for documents, image viewer for scans)
- Download reports to device (encrypted storage)
- Share reports via secure link or download

#### FR-3.5 Offline Access
- Recent visits (last 10) available offline
- Downloaded reports available offline
- Prescriptions cached locally

---

### 4. Billing

#### FR-4.1 Bill List
- All bills sorted by date (newest first)
- Display: Bill date, Total amount, Payment status badge
- Filter by: Payment status (Paid, Pending), Date range
- Search by bill ID

#### FR-4.2 Bill Details
- Bill header: Bill ID, Visit date, Total amount, Status
- Section-wise breakdown:
  - Consultation charges
  - Pharmacy charges
  - Lab test charges
  - Imaging charges
  - Other charges
- Itemized list per section with quantity and unit price
- Payment date (if paid)

#### FR-4.3 Offline Access
- View downloaded bills offline
- Cache recent bills (last 5)

---

### 5. Appointments

#### FR-5.1 View Appointments
**Upcoming Tab:**
- List of scheduled and confirmed appointments
- Display: Doctor name, Hospital, Department, Date/Time, Status
- Sort by date (nearest first)

**Past Tab:**
- History of completed/cancelled appointments
- Display: Doctor name, Date, Status

#### FR-5.2 Appointment Details
- Doctor information (name, department)
- Hospital name and address
- Scheduled date and time
- Reason for visit
- Status badge
- Notes from hospital
- Option to cancel (if status is "scheduled")

#### FR-5.3 Book New Appointment
- Step 1: Select Hospital from list
- Step 2: Select Department
- Step 3: View available date slots (calendar view)
- Step 4: View available time slots for selected date
- Step 5: Select time slot and enter reason
- Step 6: Confirm booking
- Immediate confirmation if slot available

#### FR-5.4 Cancel Appointment
- Cancel option for scheduled appointments
- Required: Cancellation reason (dropdown + optional text)
- Confirmation dialog
- Status changes to "cancelled"

---

### 6. Dashboard (Home Screen)

#### FR-6.1 Quick Summary Cards
- **Next Appointment Card**: Date, time, doctor name, hospital (tap to view details)
- **Recent Visit Card**: Last visit date, doctor, hospital (tap to view)
- **Pending Bills Card**: Count and total amount (tap to view bills)

#### FR-6.2 Recent Activity Feed
- New medical report available
- Appointment confirmed/cancelled
- New bill generated
- Prescription updated

#### FR-6.3 Quick Actions
- Book Appointment button
- View Medical Records button
- View Bills button
- Emergency Contact button

#### FR-6.4 Offline Indicator
- Banner showing "Offline Mode" when no connection
- Last synced timestamp

---

### 7. Emergency Features

#### FR-7.1 Emergency Contact
- One-tap emergency call button (always visible in header/footer)
- Pre-configured hospital emergency number
- Option to add personal emergency contacts

#### FR-7.2 Medical ID Card
- Digital health ID card view
- Displays: Patient Number, Name, Blood Group, Emergency Contact
- QR code containing patient number for quick access
- Available offline

#### FR-7.3 Quick Blood Group Display
- Blood group prominently displayed in profile and emergency section

---

### 8. Notifications

#### FR-8.1 Push Notifications
- New bill generated
- Appointment reminder (24 hours before, 1 hour before)
- Appointment status change (confirmed/cancelled by hospital)
- New medical report available
- Prescription updated
- Payment confirmation (when payment feature added)

#### FR-8.2 In-App Notification Center
- List of all notifications
- Unread indicator
- Tap to navigate to relevant section
- Clear all option
- Notification settings

---

### 9. Multi-Language Support

#### FR-9.1 Supported Languages
- English (default)
- Hindi
- Regional language option (configurable per hospital)

#### FR-9.2 Language Selection
- Available in settings
- Language preference saved locally
- UI elements, labels, and static content translated
- Medical terms kept in English with local language explanation

---

### 10. Offline Mode

#### FR-10.1 Data Caching Strategy
- **Always Available Offline:**
  - Patient profile information
  - Last 10 visits with prescriptions
  - Last 5 bills
  - Upcoming appointments
  - Downloaded reports
  - Emergency contact info
  - Medical ID card

- **Requires Internet:**
  - Booking new appointments
  - Updating profile
  - Viewing new data (visits, bills, reports)
  - Downloading new reports

#### FR-10.2 Sync Behavior
- Automatic sync when connection restored
- Manual pull-to-refresh to force sync
- Background sync every 6 hours
- Show "Last synced: X minutes ago" timestamp

#### FR-10.3 Offline Actions Queue
- Profile updates queued when offline
- Automatic sync when connection available
- Success/failure notification after sync

---

### 11. Settings

#### FR-11.1 App Settings
- Language selection
- Notification preferences (toggle per type)
- Biometric authentication toggle
- Theme selection (Light/Dark/System)
- Text size (Small/Medium/Large)

#### FR-11.2 Account Settings
- Change phone number (with verification)
- Update password (if applicable)
- View patient number
- Logout

#### FR-11.3 App Information
- App version
- Terms of service
- Privacy policy
- Help & Support contact
- Rate app option

---

## Data Models

### User/Patient Model
```typescript
interface Patient {
  patient_id: string          // UUID
  patient_number: string      // 10-digit ID (displayed to user)
  user_id: string            // Links to auth system
  
  // Personal Info
  name: string
  dob: string                // ISO date format
  gender: 'male' | 'female' | 'other'
  blood_group: string        // A+, B-, O+, etc.
  
  // Contact
  phone_number: string
  address: string
  
  // Emergency
  emergency_contact_name: string
  emergency_contact_number: string
  guardian_phone: string
  
  // Demographics
  marital_status: string
  spouse_name: string
  caste: string
  religion: string
  nationality: string
  
  // Status
  nfc_card_linked: boolean
  
  // Relations
  allergies: Allergy[]
  chronic_conditions: ChronicCondition[]
}
```

### Visit Model
```typescript
interface Visit {
  visit_id: string
  patient_id: string
  
  // Visit Info
  visit_date: string         // ISO date-time
  visit_type: 'scheduled' | 'walk_in' | 'follow_up' | 'emergency'
  
  // Medical Details
  diagnosis: string
  notes: string             // Doctor notes
  advice: string
  next_visit_date: string   // ISO date
  
  // Relations
  hospital: Hospital
  doctor: Doctor
  prescriptions: Prescription[]
  reports: Report[]
  bill: Bill
}
```

### Prescription Model
```typescript
interface Prescription {
  prescription_id: string
  visit_id: string
  prescribed_by: string      // Doctor name
  prescribed_date: string
  
  medications: Medication[]
}

interface Medication {
  medication_id: string
  drug_name: string
  dosage: string
  frequency: string         // e.g., "Twice daily", "Every 8 hours"
  duration: string          // e.g., "7 days", "2 weeks"
  instructions: string      // e.g., "After food", "Before sleep"
}
```

### Report Model
```typescript
interface Report {
  report_id: string
  visit_id: string
  report_type: 'lab_test' | 'imaging' | 'other'
  title: string             // e.g., "Blood Test Report", "Chest X-Ray"
  file_url: string
  file_type: 'pdf' | 'jpg' | 'png'
  uploaded_at: string       // ISO date-time
  hospital_name: string
}
```

### Bill Model
```typescript
interface Bill {
  bill_id: string
  visit_id: string
  
  // Financial
  total_amount: number
  currency: string
  payment_status: 'pending' | 'paid' | 'failed'
  payment_date: string      // ISO date-time (if paid)
  
  // Relations
  visit_date: string
  sections: BillSection[]
}

interface BillSection {
  section_id: string
  section_type: 'consultation' | 'pharmacy' | 'lab_test' | 'imaging' | 'other'
  section_total: number
  items: BillItem[]
}

interface BillItem {
  item_id: string
  description: string
  quantity: number
  unit_price: number
  total_price: number
}
```

### Appointment Model
```typescript
interface Appointment {
  appointment_id: string
  patient_id: string
  
  // Scheduling
  scheduled_date_time: string   // ISO date-time
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  
  // Details
  department: string
  reason: string
  notes: string
  
  // Relations
  doctor: Doctor
  hospital: Hospital
  
  // Cancellation (if applicable)
  cancelled_at: string
  cancelled_reason: string
}
```

### Doctor Model
```typescript
interface Doctor {
  doctor_id: string
  full_name: string
  specialization: string    // Department/specialization
  hospital_id: string
  hospital_name: string
}
```

### Hospital Model
```typescript
interface Hospital {
  hospital_id: string
  name: string
  address: string
  contact_number: string
}
```

### Allergy Model
```typescript
interface Allergy {
  allergy_id: string
  allergy_name: string
  severity: 'mild' | 'moderate' | 'severe'
  notes: string
}
```

### Chronic Condition Model
```typescript
interface ChronicCondition {
  condition_id: string
  condition_name: string
  diagnosed_date: string    // ISO date
  notes: string
}
```

### Notification Model
```typescript
interface Notification {
  notification_id: string
  patient_id: string
  type: 'bill' | 'appointment' | 'report' | 'prescription' | 'reminder'
  title: string
  message: string
  reference_id: string      // ID of related entity (bill_id, appointment_id, etc.)
  is_read: boolean
  created_at: string        // ISO date-time
}
```

### Available Slot Model
```typescript
interface AvailableSlot {
  hospital_id: string
  department: string
  doctor_id: string
  date: string              // ISO date
  slots: TimeSlot[]
}

interface TimeSlot {
  time: string              // "HH:mm" format
  is_available: boolean
}
```

---

## UI/UX Requirements Summary

### Design Principles
- **Patient-Friendly**: Simple, intuitive navigation for non-technical users
- **Accessible**: Large touch targets (min 44px), high contrast, readable fonts
- **Trustworthy**: Medical-grade visual design, professional color scheme
- **Fast**: Quick load times, smooth transitions, optimistic updates

### Navigation Structure
```
├── Bottom Tab Navigation
│   ├── Home (Dashboard)
│   ├── Appointments
│   ├── Medical Records
│   ├── Bills
│   └── Profile
├── Top Level
│   ├── Emergency Button (always accessible)
│   └── Notifications
└── Settings (in Profile)
```

### Key UI Patterns
- Card-based layouts for data display
- List views with swipe actions where appropriate
- Full-screen modals for details
- Bottom sheets for quick actions
- Pull-to-refresh for data sync
- Skeleton loaders during loading states
- Empty states with helpful illustrations
- Confirmation dialogs for destructive actions

### Color Palette
- Primary: Professional Blue (#2563eb)
- Success: Green (#16a34a) for paid bills, confirmed appointments
- Warning: Amber (#d97706) for pending bills, scheduled appointments
- Error: Red (#dc2626) for failed payments, cancelled items
- Emergency: Red background with white text for emergency button
- Background: White (#ffffff) for light mode, Dark Slate (#0f172a) for dark mode

### Typography
- Font: System default (San Francisco on iOS, Roboto on Android)
- Sizes: 
  - Header: 20-24px
  - Title: 16-18px
  - Body: 14-16px
  - Caption: 12px
- Weights: Regular (400), Medium (500), Semibold (600)

---

## API Endpoints (Summary)

### Authentication
- `POST /api/mobile/auth/validate` - Validate phone + patient number
- `POST /api/mobile/auth/send-otp` - Request OTP
- `POST /api/mobile/auth/verify-otp` - Verify OTP and login
- `POST /api/mobile/auth/refresh` - Refresh token
- `POST /api/mobile/auth/logout` - Logout

### Patient
- `GET /api/mobile/patient/profile` - Get patient profile
- `PUT /api/mobile/patient/profile` - Update patient profile
- `GET /api/mobile/patient/allergies` - Get allergies
- `GET /api/mobile/patient/conditions` - Get chronic conditions

### Visits
- `GET /api/mobile/visits` - List patient visits
- `GET /api/mobile/visits/:id` - Get visit details
- `GET /api/mobile/visits/:id/prescription` - Get prescription PDF
- `GET /api/mobile/visits/:id/reports` - List visit reports
- `GET /api/mobile/reports/:id/download` - Download report file

### Bills
- `GET /api/mobile/bills` - List patient bills
- `GET /api/mobile/bills/:id` - Get bill details
- `GET /api/mobile/bills/:id/pdf` - Download bill PDF

### Appointments
- `GET /api/mobile/appointments` - List appointments
- `GET /api/mobile/appointments/:id` - Get appointment details
- `POST /api/mobile/appointments` - Book new appointment
- `DELETE /api/mobile/appointments/:id` - Cancel appointment
- `GET /api/mobile/appointments/slots` - Get available slots

### Notifications
- `GET /api/mobile/notifications` - List notifications
- `PUT /api/mobile/notifications/:id/read` - Mark as read
- `PUT /api/mobile/notifications/read-all` - Mark all as read

---

## Security Requirements

1. **Data Encryption**: All patient data encrypted at rest and in transit (TLS 1.3)
2. **Secure Storage**: JWT tokens stored in encrypted device storage (Keychain/Keystore)
3. **Screenshots**: Disable screenshots on screens showing sensitive medical data
4. **Session Timeout**: Auto-lock after 5 minutes of inactivity
5. **Biometric**: Support device biometric authentication
6. **Certificate Pinning**: Pin SSL certificates to prevent MITM attacks
7. **Root Detection**: Detect rooted/jailbroken devices and warn users

---

## Future Enhancements

- **Payments**: Integration with payment gateways for online bill payment
- **Telemedicine**: Video consultation booking and joining
- **Health Tracking**: Integration with health apps (Apple Health, Google Fit)
- **Family Access**: Multi-profile support for family members
- **Lab Booking**: Direct booking of lab tests
- **Medicine Reminders**: Prescription-based medication reminders
- **Chat**: Direct messaging with doctors/hospital staff
- **Feedback**: Rate and review hospital services

---

## Success Metrics

- **Adoption**: 70% of registered patients download and activate app within 3 months
- **Engagement**: Average 3 sessions per week per active user
- **Satisfaction**: 4.5+ star rating on app stores
- **Support Reduction**: 40% reduction in phone calls for appointment/bill inquiries
- **Feature Usage**: 50% of appointments booked through app (after payment feature launch)
