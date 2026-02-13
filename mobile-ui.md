# Patient Mobile App - UI Requirements

## App Overview
Patient mobile app for Hospital Management System. Clean, medical-grade UI. Patient-facing health records, appointments, and medical history.

---

## Screen 1: Login Flow

### Login Screen
**Layout:** Centered form on white background
**Components:**
- App logo/icon at top
- Title: "Patient Login"
- Input field 1: Phone Number (numeric keyboard, +91 prefix)
- Input field 2: Patient Number (10-digit, placeholder: "Enter 10-digit ID")
- Primary button: "Send OTP"
- Help link: "Don't know your Patient Number?"

**Data Model:**
```typescript
interface LoginRequest {
  phone_number: string
  patient_number: string
}
```

### OTP Verification Screen
**Layout:** Centered content
**Components:**
- Back arrow top-left
- Title: "Enter OTP"
- Subtitle: "Sent to +91 98****3210"
- 6-digit OTP input boxes
- Resend OTP link (disabled for 60s with countdown)
- Verify button
- Error message area

**Data Model:**
```typescript
interface OTPVerifyRequest {
  phone_number: string
  patient_number: string
  otp: string
}
```

### First-Time Linking Screen
**Layout:** Centered information card
**Components:**
- Info icon
- Title: "Link Your Account"
- Description: "Please confirm your details to link this phone number"
- Display: Patient Name (read-only)
- Display: Patient Number (read-only)
- Date picker: Date of Birth verification
- Confirm button

---

## Screen 2: Dashboard (Home)

**Layout:** Scrollable content with summary cards

**Top Header:**
- Menu icon (left)
- App title: "My Health" (center)
- Notification bell with badge (right)

**Quick Summary Cards (Horizontal scroll):**

**Card 1 - Next Appointment:**
- Icon: Calendar
- Doctor name (bold)
- Department
- Date badge
- Time
- Tap to view details

**Data Model:**
```typescript
interface NextAppointmentCard {
  doctor_name: string
  department: string
  date: string
  time: string
  hospital_name: string
}
```

**Card 2 - Recent Visit:**
- Icon: Medical file
- "Last Visit" label
- Doctor + Hospital
- Diagnosis preview

**Data Model:**
```typescript
interface RecentVisitCard {
  visit_date: string
  doctor_name: string
  hospital_name: string
  diagnosis: string
}
```

**Card 3 - Pending Bills:**
- Icon: Receipt
- Count badge
- Total amount (large, bold)
- "Pending Bills" label

**Data Model:**
```typescript
interface PendingBillsCard {
  count: number
  total_amount: number
  currency: string
}
```

**Quick Actions Grid (2x2):**
- Book Appointment
- Medical Records
- My Bills
- Emergency (red background)

**Recent Activity Feed:**
- List of 5 recent activities
- Icon on left
- Title + description
- Timestamp on right

**Data Model:**
```typescript
interface ActivityItem {
  type: 'report' | 'bill' | 'appointment' | 'prescription'
  title: string
  description: string
  timestamp: string
}
```

**Offline Indicator:**
- Banner at top when offline
- "Offline Mode - Last synced X hours ago"

---

## Screen 3: Profile

**Layout:** Scrollable form sections

**Header:**
- Back button
- Title: "My Profile"
- Edit button (toggles edit mode)

**Profile Card:**
- Large avatar
- Name (large, bold)
- Patient Number (copyable)
- Blood group badge (prominent)
- NFC card status indicator

**Data Model:**
```typescript
interface PatientProfile {
  name: string
  patient_number: string
  blood_group: string
  phone_number: string
  nfc_card_linked: boolean
}
```

**Personal Information Section:**
- Date of Birth
- Gender
- Blood Group
- Read-only in view mode, editable in edit mode

**Data Model:**
```typescript
interface PersonalInfo {
  dob: string
  gender: string
  blood_group: string
}
```

**Contact Information Section:**
- Phone Number
- Address
- Editable fields

**Data Model:**
```typescript
interface ContactInfo {
  phone_number: string
  address: string
}
```

**Emergency Contacts Section:**
- Emergency Contact Name + Phone
- Guardian Phone
- Edit button for each

**Data Model:**
```typescript
interface EmergencyContact {
  name: string
  phone: string
}

interface GuardianContact {
  phone: string
}
```

**Demographics Section:**
- Marital Status
- Spouse Name
- Caste
- Religion
- Nationality
- Read-only display

**Data Model:**
```typescript
interface Demographics {
  marital_status: string
  spouse_name: string
  caste: string
  religion: string
  nationality: string
}
```

**Medical Profile Section:**
- Allergies list with severity badges
- Chronic conditions list with dates
- Expandable/collapsible

**Data Model:**
```typescript
interface Allergy {
  allergy_name: string
  severity: string
}

interface ChronicCondition {
  condition_name: string
  diagnosed_date: string
}
```

**Settings Link:**
- Row with "Settings" text
- Navigate to settings screen

---

## Screen 4: Medical Records (Visits)

**Layout:** Tab view with list

**Header:**
- Title: "Medical Records"
- Search icon
- Filter icon

**Tab Navigation:**
- Visits (default)
- Reports
- Prescriptions

### Visits Tab

**Visit List Item:**
- Card layout
- Date badge (left side)
- Hospital name (bold)
- Doctor name + Department
- Visit type tag
- Prescription icon (if exists)
- Reports count badge

**Data Model:**
```typescript
interface VisitListItem {
  visit_id: string
  visit_date: string
  hospital_name: string
  doctor_name: string
  visit_type: string
  has_prescription: boolean
  has_reports: number
}
```

**Visit Detail Screen:**
- Header: Date + Hospital
- Doctor info card
- Diagnosis section
- Notes section (expandable)
- Advice section
- Next visit date
- Prescriptions card
- Reports list
- Bill summary card

**Data Model:**
```typescript
interface VisitDetail {
  visit_id: string
  visit_date: string
  visit_type: string
  hospital: Hospital
  doctor: Doctor
  diagnosis: string
  notes: string
  advice: string
  next_visit_date: string
  prescriptions: Prescription[]
  reports: Report[]
  bill: BillSummary
}
```

### Reports Tab

**Report List Item:**
- Icon based on type
- Title (bold)
- Visit date + Hospital
- File type badge

**Data Model:**
```typescript
interface ReportListItem {
  report_id: string
  report_type: string
  title: string
  visit_date: string
  hospital_name: string
  file_type: string
}
```

**Report Viewer:**
- PDF viewer with zoom/pan
- Image viewer with pinch-zoom
- Share button
- Download button

### Prescriptions Tab

**Prescription Card:**
- Doctor name + Date header
- List of medications
- Each medication: Drug name, Dosage, Frequency, Duration, Instructions
- Download PDF button
- Share button

**Data Model:**
```typescript
interface PrescriptionView {
  prescription_id: string
  prescribed_date: string
  doctor_name: string
  medications: Medication[]
}

interface Medication {
  drug_name: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
}
```

---

## Screen 5: Bills

**Layout:** List with filter chips

**Header:**
- Title: "My Bills"
- Filter dropdown

**Filter Chips:**
- All (default)
- Pending (with count)
- Paid

**Bill List Item:**
- Hospital name (top)
- Visit date
- Total amount (large, bold)
- Status badge

**Data Model:**
```typescript
interface BillListItem {
  bill_id: string
  visit_date: string
  total_amount: number
  currency: string
  payment_status: string
  hospital_name: string
}
```

**Bill Detail Screen:**
- Bill ID + Date
- Hospital info
- Total amount (very large, centered)
- Status badge
- Section-wise breakdown
- Itemized list per section
- Payment info (if paid)
- Download PDF button

**Data Model:**
```typescript
interface BillDetail {
  bill_id: string
  visit_date: string
  hospital: Hospital
  total_amount: number
  payment_status: string
  payment_date: string
  sections: BillSection[]
}

interface BillSection {
  section_type: string
  section_total: number
  items: BillItem[]
}

interface BillItem {
  description: string
  quantity: number
  unit_price: number
  total_price: number
}
```

---

## Screen 6: Appointments

**Layout:** Tab view with calendar integration

**Header:**
- Title: "Appointments"
- Plus icon (book new)

**Tab Navigation:**
- Upcoming (default)
- Past

### Upcoming Tab

**Empty State:**
- Illustration
- Text: "No upcoming appointments"
- Button: "Book Appointment"

**Appointment List Item:**
- Date/time badge (left, colored by urgency)
- Doctor name (bold)
- Department + Hospital
- Status badge
- Cancel button (if scheduled)

**Data Model:**
```typescript
interface UpcomingAppointment {
  appointment_id: string
  doctor_name: string
  department: string
  hospital_name: string
  scheduled_date_time: string
  status: string
  reason: string
}
```

### Past Tab

**Appointment List Item:**
- Similar layout to upcoming
- Status badge
- "View Visit" button (if has_visit)

**Data Model:**
```typescript
interface PastAppointment {
  appointment_id: string
  doctor_name: string
  hospital_name: string
  scheduled_date: string
  status: string
  has_visit: boolean
}
```

### Book Appointment Flow

**Step 1 - Select Hospital:**
- Search bar
- List of hospitals
- Hospital card: Name, Address, Distance

**Data Model:**
```typescript
interface HospitalListItem {
  hospital_id: string
  name: string
  address: string
  distance: string
}
```

**Step 2 - Select Department:**
- Grid of departments with icons
- General Medicine, Cardiology, Orthopedics, Pediatrics

**Step 3 - Select Date:**
- Calendar view
- Highlighted available dates
- Disabled unavailable/past dates

**Step 4 - Select Time Slot:**
- Morning slots (AM)
- Afternoon slots (PM)
- Evening slots
- Disabled slots in grey
- Selected slot highlighted

**Data Model:**
```typescript
interface TimeSlot {
  time: string
  is_available: boolean
}
```

**Step 5 - Reason & Confirm:**
- Text input: Reason for visit
- Doctor preference dropdown
- Summary card: Hospital, Department, Date, Time
- Confirm button
- Success modal

**Data Model:**
```typescript
interface BookAppointmentRequest {
  hospital_id: string
  department: string
  date: string
  time: string
  reason: string
  doctor_preference: string
}
```

---

## Screen 7: Emergency

**Layout:** Prominent emergency interface

**Header:**
- Title: "Emergency"
- Warning styling

**Emergency Call Button:**
- Large red button (half screen)
- Phone icon
- Text: "Call Hospital Emergency"
- One-tap dial

**Medical ID Card:**
- Digital card design
- QR code (large)
- Patient info
- Blood group (prominent)
- Emergency contact
- Critical medical info
- "Show to medical personnel" label

**Data Model:**
```typescript
interface MedicalID {
  patient_name: string
  patient_number: string
  blood_group: string
  emergency_contact_name: string
  emergency_contact_phone: string
  allergies: string[]
  conditions: string[]
}
```

**Quick Info Section:**
- Hospital address
- Directions button
- Hospital contact numbers list

---

## Screen 8: Notifications

**Layout:** List with unread indicators

**Header:**
- Title: "Notifications"
- "Mark all as read" button

**Notification Item:**
- Unread indicator (dot)
- Icon based on type
- Title (bold if unread)
- Message preview
- Timestamp

**Data Model:**
```typescript
interface NotificationItem {
  notification_id: string
  type: string
  title: string
  message: string
  reference_id: string
  is_read: boolean
  created_at: string
}
```

---

## Screen 9: Settings

**Layout:** Grouped list

**Header:**
- Title: "Settings"

**Account Section:**
- Change Phone Number
- Change Language
- Biometric Login toggle

**Preferences Section:**
- Notifications submenu
  - Appointment reminders toggle
  - Bill notifications toggle
  - New reports toggle
- Theme selection
- Text Size selection

**Offline Section:**
- Downloaded Reports (storage usage)
- Clear Cache button
- Sync Now button

**App Section:**
- App Version
- Terms of Service
- Privacy Policy
- Help & Support
- Rate App

**Danger Section:**
- Logout

---

## Data Models (Complete Reference)

### Patient Model
```typescript
interface Patient {
  patient_id: string
  patient_number: string
  user_id: string
  name: string
  dob: string
  gender: string
  blood_group: string
  phone_number: string
  address: string
  emergency_contact_name: string
  emergency_contact_number: string
  guardian_phone: string
  marital_status: string
  spouse_name: string
  caste: string
  religion: string
  nationality: string
  nfc_card_linked: boolean
  allergies: Allergy[]
  chronic_conditions: ChronicCondition[]
}
```

### Visit Model
```typescript
interface Visit {
  visit_id: string
  patient_id: string
  visit_date: string
  visit_type: string
  diagnosis: string
  notes: string
  advice: string
  next_visit_date: string
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
  prescribed_by: string
  prescribed_date: string
  medications: Medication[]
}

interface Medication {
  medication_id: string
  drug_name: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
}
```

### Report Model
```typescript
interface Report {
  report_id: string
  visit_id: string
  report_type: string
  title: string
  file_url: string
  file_type: string
  uploaded_at: string
  hospital_name: string
}
```

### Bill Model
```typescript
interface Bill {
  bill_id: string
  visit_id: string
  total_amount: number
  currency: string
  payment_status: string
  payment_date: string
  visit_date: string
  hospital: Hospital
  sections: BillSection[]
}

interface BillSection {
  section_id: string
  section_type: string
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
  scheduled_date_time: string
  status: string
  department: string
  reason: string
  notes: string
  doctor: Doctor
  hospital: Hospital
  cancelled_at: string
  cancelled_reason: string
}
```

### Supporting Models
```typescript
interface Doctor {
  doctor_id: string
  full_name: string
  specialization: string
  hospital_id: string
  hospital_name: string
}

interface Hospital {
  hospital_id: string
  name: string
  address: string
  contact_number: string
}

interface Allergy {
  allergy_id: string
  allergy_name: string
  severity: string
  notes: string
}

interface ChronicCondition {
  condition_id: string
  condition_name: string
  diagnosed_date: string
  notes: string
}

interface Notification {
  notification_id: string
  type: string
  title: string
  message: string
  reference_id: string
  is_read: boolean
  created_at: string
}

interface AvailableSlot {
  hospital_id: string
  department: string
  doctor_id: string
  date: string
  slots: TimeSlot[]
}

interface TimeSlot {
  time: string
  is_available: boolean
}
```

---

## Navigation Structure

```
├── Bottom Tab Navigation
│   ├── Home (Dashboard)
│   ├── Appointments
│   ├── Emergency (center, prominent)
│   ├── Records
│   └── Profile
├── Top Level
│   ├── Emergency Button (always accessible)
│   └── Notifications
└── Settings (in Profile)
```

---

## UI Guidelines

### Layout Principles
- Bottom navigation with 5 tabs
- Emergency button always visible (center tab or floating)
- Cards with rounded corners and subtle shadows
- List items with touch feedback
- Modals for details
- Pull-to-refresh

### Components
- Cards for grouped content
- Lists with dividers
- Chips for filters/tags
- Badges for counts
- Avatars for user info
- Icons for visual cues

### Interactions
- Tap to navigate
- Swipe to dismiss (notifications)
- Pull to refresh
- Long press for options
- Bottom sheets for actions
- Dialogs for confirmations
