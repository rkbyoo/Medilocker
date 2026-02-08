# UI Requirements – Hospital Management System

This document describes the functional scope, user journeys, data entities, and visual system requirements for the Hospital Management System (HMS). It should be used as the single source of truth when generating fresh UI mockups with an AI design tool.

## 1. Product Overview

- **Platform:** Electron-based desktop application (React + Vite) for hospital staff. Web build is for preview only.
- **Purpose:** Manage NFC-enabled patient health cards, appointments, consultations, and historical medical records across multiple hospitals.
- **Key Traits:** Dense data views, professional medical aesthetic, trustworthy corporate tone, hardware integrations (NFC readers, microphones for dictation), and role-based access.

## 2. User Roles & Responsibilities

| Role | Responsibilities | Primary Screens |
| --- | --- | --- |
| **Receptionist / Front Desk** | Authenticate, register new patients, scan NFC cards, search existing patients, book appointments, print/share patient IDs. | Login, Receptionist Dashboard, Register Patient, Existing Patient Lookup, Patient Details.
| **Doctor / Clinician** | Review today/tomorrow schedules, drill into patient charts, record consultations, capture voice notes, generate visit summaries, review historical visits. | Doctor Dashboard, Consultation Workspace, Doctor Patient View, Visit History.
| **Admin / IT** | Manage staff accounts, monitor access logs (back-end scope). | Not yet visualized in current client but must be considered for future UI.

## 3. Core Use Cases

1. **Secure Login**
   - Split-screen card; uses staff email/password; supports demo credentials.
   - Communicates HIPAA compliance and secure desktop access.

2. **Receptionist Workflow**
   - Dashboard with quick actions (Register New Patient, Find Existing Patient).
   - Register Patient: multi-column form capturing demographics, contacts, emergency info, allergies, chronic conditions, etc.
   - Existing Patient Search: query by patient ID, name, phone, or NFC card; optional auto-search via query string; handles NFC scan dialog.
   - Schedule Appointment: assign department, doctor, reason, date/time.

3. **Doctor Workflow**
   - Dashboard columns for Today’s Appointments, Tomorrow’s Appointments, Recently Seen patients; cards link to consultation/patient views.
   - Consultation Workspace: split panels (patient info, medical history, new consultation form) with voice dictation, vitals, diagnosis, medications, advice, next visit scheduling.
   - Doctor Patient View: read-only layout for upcoming appointments.
   - Visit History (View Visit): resizable panels showing patient card + detailed visit record (diagnosis, medications, advice, prescriptions, next visit).

4. **NFC Card Operations**
   - NFC dialog triggered in receptionist screens to read/write smart health card IDs.
   - Must expose card UID, sync status, and fallback manual entry.

5. **Voice Dictation**
   - Consultation page integrates speech recognition (start/stop microphone button, real-time transcript, error states).

6. **Backend Sync & Alerts**
   - Toast notifications for success/error states (search, schedule, save consultation).
   - Query invalidation/resync for appointments, visits after writes.

## 4. Data Entities & Key Fields

1. **User / Staff**
   - `user_id`, `name`, `email`, `role`, `phone`, `department`.

2. **Patient Profile**
   - `patientNumber` (NFC ID), `name`, `dob`, `gender`, `bloodGroup`, `phone`, `guardianPhone`, `address`, `maritalStatus`, `spouseName`, `nationality`, `religion`, `caste`, `emergencyContactName/Number`, `allergies`, `chronicConditions`.

3. **Appointment**
   - `id`, `patientNumber`, `patientName`, `doctorId`, `doctorName`, `department`, `reason`, `dateTime`, `status` (scheduled/completed), `visit_id`, `patientNumber`.

4. **Visit / Consultation**
   - `visit_id`, `patient_id`, `doctor_id`, `appointment_id`, `visit_date`, `visit_type` (scheduled, walk_in, follow_up, emergency), `diagnosis`, `notes/medications`, `advice`, `next_visit_date`, `prescriptions[]`, `reports[]`.

5. **NFC Card**
   - `card_uid`, `patientNumber`, `issue_date`, `last_sync`, `status` (active/lost), offline data snapshot (name, allergies, blood group, emergency contacts).

6. **Access Logs & Auth**
   - Track login success/failure, refresh tokens, logout events.

## 5. Screen Inventory & Requirements

### 5.1 Desktop Shell (Global)
- Fixed 260 px dark sidebar (logo, navigation grouped by role, user summary, logout).
- Main area: header bar (page title, optional actions), scrollable content.
- System font stack (`system-ui, -apple-system, Segoe UI, Roboto, sans-serif`).
- Dense spacing (13 px base font, sharp corners, thin dividers).

### 5.2 Login Experience
- Centered card on light blue-grey field.
- Split layout: left shows doctor image + royal blue welcome copy with thin vertical accent; right is white form.
- Inputs: thin gray border, rounded 8px, icons inside.
- Primary CTA: full-width royal blue button; sub actions for demo credentials.

### 5.3 Receptionist Dashboard
- Two large action tiles with icon, description, CTA button.
- Display quick status (e.g., “Register New”, “Find Patient”).

### 5.4 Register New Patient
- Multi-column form grouped by Basic Info, Contact, Demographics, Emergency, Medical history.
- Input heights ~36px, inline labels, required indicators.
- Footer buttons: Cancel (outline), Register (primary) with loading state.

### 5.5 Existing Patient Lookup
- Search panel with patient ID input + actions (search, read NFC, quick links).
- When found: split view showing Patient Info Card left and Appointment Booking form right via resizable panels.
- NFC dialog component for scanning instructions.

### 5.6 Patient Details (Receptionist)
- Display patient card + scheduling form similar to existing patient, but triggered from query string.

### 5.7 Receptionist Patient Info Card
- Shows avatar initials, ID, age, blood group, contact info, tags for allergies/chronic conditions, expandable sections for address/emergency data.

### 5.8 Doctor Dashboard
- Three equal columns with scrollable lists (Today, Tomorrow, Recently Visited).
- Each appointment card displays patient name, time, reason/status, click to open Consultation/Visit.

### 5.9 Consultation Workspace
- Horizontal split: left column with patient profile + collapsible medical history; right column for current consultation form.
- Tooling: voice dictation controls, vitals inputs, diagnosis textarea, medications grid, advice, attachments, next visit picker, Save & Print actions.
- Support status indicators (listening, saving, required field validation).

### 5.10 Doctor Patient View
- Read-only representation for upcoming consult with patient summary and note about scheduling restrictions.

### 5.11 Visit History (View Visit)
- Left panel: patient info; right panel: timeline of visit details (diagnosis, medications, advice, prescriptions, reports, next visit) with iconography.
- Use dense tables/cards for lists.

### 5.12 Not Found / Utility States
- Simple centered messaging with CTA back to dashboard.

## 6. Backend & API Touchpoints

- **Auth Endpoints:** `/api/auth/login`, `/api/auth/register`, `/api/auth/refresh`, `/api/auth/logout`, `/api/auth/me`.
- **User Profile:** `/api/users/profile` (gets name, role, dept).
- **Patients Service:** `patientsApi.getPatientById`, `patientsApi.createPatient` (IDs sync with NFC card numbers).
- **Appointments Service:** `appointmentsApi.getTodaysAppointments`, `getTomorrowsAppointments`, `getCompletedAppointments`, `createAppointment`.
- **Visits Service:** `visitsApi.createVisit`, `visitsApi.getVisitById`.
- **Users Service:** `usersApi.getDoctors` for dropdowns.
- **Speech Recognition Hook:** `useSpeechRecognition` (browser API wrapper) for doctors.

## 7. Hardware & Integration Requirements

- **NFC Card Reader:** Trigger modal guidance, detect status (listening for card, success, failure). Provide manual override fields.
- **Microphone:** Start/stop recording button, show waveform or textual indicator.
- **Photo/Scan Attachments:** placeholder UI for uploading or linking radiology files (future state).

## 8. Visual & Interaction Guidelines

- Dense, professional desktop aesthetic; avoid web-style spaciousness.
- Sidebar: dark slate background (#0f172a), white text; active nav uses saturated blue (#2563eb).
- Primary actions: Royal blue (#1f4ed8) backgrounds, white text.
- Secondary actions: outlined or subtle fills (#e2e8f0).
- Typography: 13–14 px base; headings 16–18 px, weight 600.
- Components: minimal shadows, sharp corners (6 px), thin dividers (#e2e8f0).
- Animations: restrained (fade/slide 150–200 ms), no bouncy motions.

## 9. Accessibility & Compliance

- WCAG AA color contrast for text on blue backgrounds.
- Keyboard navigation for all forms (tab order, focus styles).
- Toast notifications should include descriptive text.
- Voice dictation controls must expose status for screen readers.

## 10. Future Enhancements to Consider

- Admin console for account management and audit logs.
- Analytics dashboard (patient volume, department load, NFC issuance stats).
- Billing & payment gateway screens.
- Patient-facing mobile/portal UI for record access.
- Offline mode indicators for NFC-only operations.

---

Use this requirements brief when prompting an AI design system. Provide role context (Receptionist vs Doctor), emphasize the desktop-first layout, NFC hardware prompts, dense data tables, and the split-screen login aesthetic described above.
