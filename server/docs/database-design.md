# Database Design Documentation

## Table of Contents
1. [Overview](#overview)
2. [Database Architecture](#database-architecture)
3. [Table Descriptions](#table-descriptions)
4. [Entity Relationships](#entity-relationships)
5. [Data Flow Diagrams](#data-flow-diagrams)
6. [Workflow Documentation](#workflow-documentation)
7. [Design Decisions](#design-decisions)
8. [Use Cases](#use-cases)

---

## Overview

### Purpose
This document describes the complete database schema for the Medical Management System. The database is designed to support patient management, appointment scheduling, medical record keeping, prescription management, and billing operations.

### Technology Stack
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Architecture**: Relational Database Management System (RDBMS)

### Key Design Principles
1. **Normalization**: Data is normalized to reduce redundancy and ensure data integrity
2. **Scalability**: Schema supports multi-hospital operations and future expansion
3. **Data Integrity**: Foreign key constraints ensure referential integrity
4. **Audit Trail**: Access logs track all system activities
5. **Separation of Concerns**: Clear separation between scheduling (appointments) and medical records (visits)

---

## Database Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   USERS &    │    │   PATIENTS   │    │ APPOINTMENTS │  │
│  │  HOSPITALS   │───▶│  MANAGEMENT  │───▶│  SCHEDULING  │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                    │                    │          │
│         │                    │                    │          │
│         ▼                    ▼                    ▼          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              MEDICAL ENCOUNTERS (VISITS)              │  │
│  └──────────────────────────────────────────────────────┘  │
│         │                    │                    │          │
│         ├────────────────────┼────────────────────┤          │
│         ▼                    ▼                    ▼          │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │PRESCRIPTIONS │    │   REPORTS    │    │    BILLING   │  │
│  │ & MEDICATIONS│    │   & FILES    │    │   SYSTEM     │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Core Modules

1. **User Management Module**: Authentication, authorization, and user profiles
2. **Patient Management Module**: Patient demographics, medical history, allergies, conditions
3. **Appointment Management Module**: Scheduling, status tracking, calendar management
4. **Medical Records Module**: Visit records, diagnoses, prescriptions, reports
5. **Billing Module**: Bills, sections, items, payment tracking

---

## Table Descriptions

### 1. User Management Tables

#### 1.1 `users`
**Purpose**: Central table for all system users (patients, doctors, admins, hospital staff)

**Fields**:
- `user_id` (UUID, Primary Key): Unique identifier for each user
- `full_name` (VARCHAR 150): User's full name
- `email` (VARCHAR 150, Unique): Email address for login and communication
- `phone` (VARCHAR 20): Contact phone number
- `password_hash` (TEXT): Hashed password for authentication
- `role` (ENUM): User role (patient, doctor, admin, hospital_staff)
- `created_at` (TIMESTAMP): Account creation timestamp
- `updated_at` (TIMESTAMP): Last update timestamp

**Usage**:
- User authentication and authorization
- Role-based access control
- User profile management
- Links to other entities (patients, appointments, visits)

**Why**: Centralized user management allows single sign-on and consistent user data across the system.

---

#### 1.2 `hospitals`
**Purpose**: Stores information about hospitals/clinics in the system

**Fields**:
- `hospital_id` (UUID, Primary Key): Unique identifier for each hospital
- `name` (VARCHAR 200): Hospital name
- `address` (TEXT): Physical address
- `contact_number` (VARCHAR 20): Hospital contact number
- `created_at` (TIMESTAMP): Record creation timestamp

**Usage**:
- Multi-hospital support
- Hospital information management
- Links to hospital_users, appointments, and visits

**Why**: Enables the system to support multiple healthcare facilities with shared patient records.

---

#### 1.3 `hospital_users`
**Purpose**: Links users to hospitals with specific roles (many-to-many relationship)

**Fields**:
- `hospital_user_id` (UUID, Primary Key): Unique identifier
- `hospital_id` (UUID, Foreign Key): Reference to hospitals table
- `user_id` (UUID, Foreign Key): Reference to users table
- `role_in_hospital` (ENUM): Role at this hospital (doctor, nurse, staff, admin)
- `created_at` (TIMESTAMP): Assignment creation timestamp

**Usage**:
- Assign users to hospitals
- Define user roles per hospital
- Support users working at multiple hospitals

**Why**: A doctor can work at multiple hospitals with different roles at each location.

---

### 2. Patient Management Tables

#### 2.1 `patients`
**Purpose**: Comprehensive patient demographic and medical information

**Fields**:
- `patient_id` (UUID, Primary Key): Unique patient identifier
- `user_id` (UUID, Foreign Key): Link to users table for authentication
- `name` (VARCHAR 200): Patient full name
- `dob` (DATE): Date of birth
- `gender` (VARCHAR 10): Gender (Male, Female, Other)
- `blood_group` (VARCHAR 5): Blood group (A+, B-, O+, etc.)
- `phone_number` (VARCHAR 20): Patient contact number
- `guardian_phone` (VARCHAR 20): Guardian/emergency contact phone
- `address` (TEXT): Patient address
- `emergency_contact_name` (VARCHAR 200): Emergency contact person name
- `emergency_contact_number` (VARCHAR 20): Emergency contact phone
- `marital_status` (VARCHAR 20): Marital status (Single, Married, Divorced, Widowed)
- `spouse_name` (VARCHAR 200): Spouse name (if applicable)
- `caste` (VARCHAR 100): Caste information
- `religion` (VARCHAR 100): Religious affiliation
- `nationality` (VARCHAR 100): Nationality
- `photo_url` (TEXT): URL to patient photo
- `nfc_card_uid` (VARCHAR 100, Unique): NFC card unique identifier
- `created_at` (TIMESTAMP): Patient registration timestamp
- `updated_at` (TIMESTAMP): Last update timestamp

**Indexes**:
- `nfc_card_uid`: Fast lookup by NFC card
- `user_id`: Link to user account
- `name`: Search by patient name
- `phone_number`: Search by phone

**Usage**:
- Patient registration and profile management
- Medical history lookup
- Emergency contact information
- NFC card-based patient identification

**Why**: Central patient record containing all demographic and basic medical information needed for healthcare operations.

---

#### 2.2 `patient_allergies`
**Purpose**: Stores patient allergies (one-to-many relationship)

**Fields**:
- `allergy_id` (UUID, Primary Key): Unique identifier
- `patient_id` (UUID, Foreign Key): Reference to patients table
- `allergy_name` (VARCHAR 200): Name of the allergy
- `severity` (VARCHAR 50): Severity level (mild, moderate, severe)
- `notes` (TEXT): Additional notes about the allergy
- `created_at` (TIMESTAMP): Record creation timestamp

**Indexes**:
- `patient_id`: Fast lookup of all allergies for a patient

**Usage**:
- Track patient allergies
- Prescription safety checks (prevent prescribing allergic medications)
- Medical alerts and warnings
- Patient safety management

**Why**: Separate table allows multiple allergies per patient and enables efficient querying for safety checks.

---

#### 2.3 `patient_chronic_conditions`
**Purpose**: Stores chronic medical conditions (one-to-many relationship)

**Fields**:
- `condition_id` (UUID, Primary Key): Unique identifier
- `patient_id` (UUID, Foreign Key): Reference to patients table
- `condition_name` (VARCHAR 200): Name of the condition
- `diagnosed_date` (DATE): Date when condition was diagnosed
- `notes` (TEXT): Additional notes about the condition
- `created_at` (TIMESTAMP): Record creation timestamp

**Indexes**:
- `patient_id`: Fast lookup of all conditions for a patient

**Usage**:
- Track chronic conditions (diabetes, hypertension, etc.)
- Treatment planning
- Medical history documentation
- Long-term care management

**Why**: Separate table allows multiple conditions per patient and maintains historical diagnosis dates.

---

### 3. Appointment Management Tables

#### 3.1 `appointments`
**Purpose**: Manages appointment scheduling and status tracking

**Fields**:
- `appointment_id` (UUID, Primary Key): Unique appointment identifier
- `patient_id` (UUID, Foreign Key): Reference to patients table
- `doctor_id` (UUID, Foreign Key): Reference to users table (doctor)
- `hospital_id` (UUID, Foreign Key): Reference to hospitals table
- `department` (VARCHAR 100): Department/specialty
- `reason` (TEXT): Reason for appointment
- `scheduled_date_time` (TIMESTAMP): Scheduled appointment date and time
- `status` (ENUM): Appointment status (scheduled, confirmed, completed, cancelled, no_show)
- `visit_id` (UUID, Foreign Key, Nullable): Link to visit when appointment is completed
- `created_by` (UUID, Foreign Key): User who created the appointment (receptionist)
- `notes` (TEXT): Pre-visit notes
- `cancelled_at` (TIMESTAMP): Cancellation timestamp
- `cancelled_reason` (TEXT): Reason for cancellation
- `created_at` (TIMESTAMP): Appointment creation timestamp
- `updated_at` (TIMESTAMP): Last update timestamp

**Indexes**:
- `patient_id`: Find all appointments for a patient
- `doctor_id`: Find all appointments for a doctor
- `scheduled_date_time`: Calendar queries and sorting
- `status`: Filter by status
- `hospital_id`: Hospital-specific queries
- `visit_id`: Link to completed visit

**Usage**:
- Appointment booking and scheduling
- Calendar management
- Status tracking (scheduled → completed/cancelled)
- Appointment reminders
- Rescheduling operations

**Why**: Separates scheduling logic from medical records. Supports cancellations, rescheduling, and appointment analytics without affecting medical records.

**Status Flow**:
```
scheduled → confirmed → completed (creates visit)
         ↓
      cancelled
         ↓
      no_show
```

---

### 4. Medical Records Tables

#### 4.1 `visits`
**Purpose**: Records actual medical consultations and encounters

**Fields**:
- `visit_id` (UUID, Primary Key): Unique visit identifier
- `appointment_id` (UUID, Foreign Key, Nullable): Link to appointment (null for walk-ins)
- `patient_id` (UUID, Foreign Key): Reference to patients table
- `hospital_id` (UUID, Foreign Key): Reference to hospitals table
- `doctor_id` (UUID, Foreign Key): Reference to users table (doctor)
- `visit_date` (TIMESTAMP): Actual visit date and time
- `visit_type` (ENUM): Type of visit (scheduled, walk_in, follow_up, emergency)
- `diagnosis` (TEXT): Medical diagnosis
- `notes` (TEXT): Doctor's notes
- `advice` (TEXT): Medical advice given to patient
- `next_visit_date` (DATE): Recommended next visit date
- `created_at` (TIMESTAMP): Visit creation timestamp
- `updated_at` (TIMESTAMP): Last update timestamp

**Indexes**:
- `patient_id`: Patient visit history
- `doctor_id`: Doctor's patient visits
- `visit_date`: Date-based queries
- `appointment_id`: Link to original appointment
- `hospital_id`: Hospital-specific visits

**Usage**:
- Record medical consultations
- Store diagnosis and medical advice
- Link to prescriptions, reports, and bills
- Medical history tracking
- Support both scheduled appointments and walk-ins

**Why**: Central table for medical encounters. All medical records (prescriptions, reports, bills) link to visits, ensuring data integrity and complete medical history.

**Key Design Decision**: Visits can exist without appointments (walk-ins), but appointments link to visits when completed. This supports both scheduled and unscheduled patient visits.

---

#### 4.2 `prescriptions`
**Purpose**: Prescription records linked to visits

**Fields**:
- `prescription_id` (UUID, Primary Key): Unique prescription identifier
- `visit_id` (UUID, Foreign Key): Reference to visits table
- `prescribed_by` (UUID, Foreign Key): Doctor who prescribed (reference to users)
- `prescription_text` (TEXT): Full prescription text
- `created_at` (TIMESTAMP): Prescription creation timestamp

**Indexes**:
- `visit_id`: Find prescription for a visit
- `prescribed_by`: Track prescriptions by doctor

**Usage**:
- Store prescription information
- Link medications to visits
- Prescription history
- Pharmacy processing

**Why**: One prescription per visit. Links to structured medication details in the medications table.

---

#### 4.3 `medications`
**Purpose**: Structured medication details within prescriptions

**Fields**:
- `medication_id` (UUID, Primary Key): Unique medication identifier
- `prescription_id` (UUID, Foreign Key): Reference to prescriptions table
- `drug_name` (VARCHAR 200): Name of the medication
- `dosage` (VARCHAR 100): Dosage information
- `frequency` (VARCHAR 100): How often to take (e.g., "twice daily")
- `duration` (VARCHAR 100): Duration of medication (e.g., "7 days")
- `instructions` (TEXT): Additional instructions

**Indexes**:
- `prescription_id`: Find all medications in a prescription

**Usage**:
- Detailed medication information
- Pharmacy processing
- Patient medication instructions
- Drug interaction checks

**Why**: Structured data allows for automated processing, drug interaction checks, and clear patient instructions. One prescription can have multiple medications.

---

#### 4.4 `reports`
**Purpose**: Medical reports and files linked to visits

**Fields**:
- `report_id` (UUID, Primary Key): Unique report identifier
- `visit_id` (UUID, Foreign Key): Reference to visits table
- `report_type` (VARCHAR 100): Type of report (lab_test, imaging, xray, etc.)
- `file_url` (TEXT): URL/path to the report file
- `file_type` (VARCHAR 20): File format (PDF, JPG, DICOM, etc.)
- `uploaded_at` (TIMESTAMP): Upload timestamp

**Indexes**:
- `visit_id`: Find all reports for a visit
- `report_type`: Filter by report type

**Usage**:
- Store lab test results
- Store imaging files (X-rays, MRIs, etc.)
- Medical document management
- Patient report access

**Why**: Centralized storage of all medical reports and files linked to specific visits for easy retrieval and patient access.

---

### 5. Billing Tables

#### 5.1 `bills`
**Purpose**: Bills generated for visits

**Fields**:
- `bill_id` (UUID, Primary Key): Unique bill identifier
- `visit_id` (UUID, Foreign Key): Reference to visits table
- `total_amount` (DECIMAL 10,2): Total bill amount
- `currency` (VARCHAR 10): Currency code (default: USD)
- `payment_status` (ENUM): Payment status (pending, paid, failed)
- `payment_date` (TIMESTAMP): Payment completion timestamp
- `created_at` (TIMESTAMP): Bill creation timestamp

**Indexes**:
- `visit_id`: Find bill for a visit
- `payment_status`: Filter by payment status

**Usage**:
- Generate bills for visits
- Track payment status
- Financial records
- Revenue management

**Why**: One bill per visit. Links to visit (not appointment) because bills are generated after the actual consultation.

---

#### 5.2 `bill_sections`
**Purpose**: Organize bill items by category

**Fields**:
- `section_id` (UUID, Primary Key): Unique section identifier
- `bill_id` (UUID, Foreign Key): Reference to bills table
- `section_type` (ENUM): Category (consultation, pharmacy, lab_test, imaging, other)
- `section_total` (DECIMAL 10,2): Total for this section
- `created_at` (TIMESTAMP): Section creation timestamp

**Indexes**:
- `bill_id`: Find all sections for a bill

**Usage**:
- Organize charges by category
- Clear billing breakdown
- Financial reporting by category

**Why**: Groups related charges together for better organization and reporting. Example: All pharmacy charges in one section.

---

#### 5.3 `bill_items`
**Purpose**: Individual line items within bill sections

**Fields**:
- `item_id` (UUID, Primary Key): Unique item identifier
- `section_id` (UUID, Foreign Key): Reference to bill_sections table
- `description` (VARCHAR 255): Item description
- `quantity` (INT): Quantity (default: 1)
- `unit_price` (DECIMAL 10,2): Price per unit
- `total_price` (DECIMAL 10,2): Total price (quantity × unit_price)

**Indexes**:
- `section_id`: Find all items in a section

**Usage**:
- Detailed itemized billing
- Quantity and pricing tracking
- Financial transparency

**Why**: Granular billing details. Example: "Paracetamol 500mg - Qty: 2 - $5.00 each - Total: $10.00"

**Billing Hierarchy**:
```
Bill → Bill Sections → Bill Items
```

---

### 6. Security & Audit Tables

#### 6.1 `access_logs`
**Purpose**: Audit trail of all system activities

**Fields**:
- `log_id` (BIGSERIAL, Primary Key): Auto-incrementing log identifier
- `user_id` (UUID, Foreign Key, Nullable): User who performed the action
- `action` (VARCHAR 200): Action performed (LOGIN, CREATE_PATIENT, etc.)
- `timestamp` (TIMESTAMP): Action timestamp
- `ip_address` (VARCHAR 50): IP address of the request
- `user_agent` (TEXT): Browser/client information
- `success` (BOOLEAN): Whether action succeeded

**Indexes**:
- `user_id`: User activity tracking
- `timestamp`: Time-based queries
- `action`: Filter by action type

**Usage**:
- Security monitoring
- Compliance and audit requirements
- Debugging and troubleshooting
- User activity tracking

**Why**: Essential for security, compliance (HIPAA, etc.), and system monitoring. Tracks who did what, when, and from where.

---

#### 6.2 `refresh_tokens`
**Purpose**: JWT refresh token storage for secure authentication

**Fields**:
- `token_id` (UUID, Primary Key): Unique token identifier
- `user_id` (UUID, Foreign Key): Reference to users table
- `refresh_token` (TEXT, Unique): Encrypted refresh token
- `expires_at` (TIMESTAMP): Token expiration timestamp
- `created_at` (TIMESTAMP): Token creation timestamp

**Indexes**:
- `user_id`: Find tokens for a user
- `refresh_token`: Fast token lookup

**Usage**:
- Secure token refresh mechanism
- Session management
- Token revocation

**Why**: Enables long-lived user sessions without storing passwords. Tokens can be revoked for security.

---

## Entity Relationships

### Relationship Diagram

```
┌──────────┐         ┌──────────────┐         ┌──────────────┐
│  users   │────────▶│   patients   │────────▶│ appointments │
└──────────┘         └──────────────┘         └──────────────┘
     │                      │                         │
     │                      │                         │
     │                      ▼                         ▼
     │                ┌──────────┐              ┌──────────┐
     │                │  visits  │◀─────────────│          │
     │                └──────────┘              └──────────┘
     │                      │
     │                      ├──────────┬──────────┬──────────┐
     │                      │          │          │          │
     │                      ▼          ▼          ▼          ▼
     │                ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
     │                │prescrip- │ │ reports │ │  bills   │ │          │
     │                │  tions   │ └──────────┘ └──────────┘ │          │
     │                └──────────┘                           │          │
     │                      │                                │          │
     │                      ▼                                │          │
     │                ┌──────────┐                           │          │
     │                │medications│                           │          │
     │                └──────────┘                           │          │
     │                                                       │          │
     └───────────────────────────────────────────────────────┘          │
                                                                        │
┌──────────┐         ┌──────────────┐                                  │
│hospitals │────────▶│hospital_users│──────────────────────────────────┘
└──────────┘         └──────────────┘
```

### Key Relationships

1. **users ↔ patients**: One-to-one (each patient has a user account)
2. **patients ↔ appointments**: One-to-many (patient can have multiple appointments)
3. **appointments ↔ visits**: One-to-one (appointment links to visit when completed)
4. **visits ↔ prescriptions**: One-to-many (one visit can have multiple prescriptions)
5. **prescriptions ↔ medications**: One-to-many (one prescription has multiple medications)
6. **visits ↔ reports**: One-to-many (one visit can have multiple reports)
7. **visits ↔ bills**: One-to-one (one bill per visit)
8. **bills ↔ bill_sections**: One-to-many (one bill has multiple sections)
9. **bill_sections ↔ bill_items**: One-to-many (one section has multiple items)
10. **patients ↔ patient_allergies**: One-to-many (patient can have multiple allergies)
11. **patients ↔ patient_chronic_conditions**: One-to-many (patient can have multiple conditions)

---

## Data Flow Diagrams

### 1. Patient Registration Flow

```
┌─────────────┐
│  Receptionist│
└──────┬──────┘
       │
       │ 1. Create User Account
       ▼
┌─────────────┐
│    users    │
└──────┬──────┘
       │
       │ 2. Create Patient Record
       ▼
┌─────────────┐     ┌──────────────────────┐
│   patients  │────▶│ patient_allergies     │
└─────────────┘     └──────────────────────┘
       │
       │ 3. Add Allergies/Conditions
       ▼
┌──────────────────────────────┐
│ patient_chronic_conditions   │
└──────────────────────────────┘
```

**Steps**:
1. Receptionist creates user account in `users` table
2. Patient record created in `patients` table (linked to user_id)
3. Allergies added to `patient_allergies` table
4. Chronic conditions added to `patient_chronic_conditions` table

---

### 2. Appointment Scheduling Flow

```
┌─────────────┐
│  Receptionist│
└──────┬──────┘
       │
       │ 1. Create Appointment
       ▼
┌─────────────┐
│appointments │
│status:      │
│"scheduled"  │
└─────────────┘
       │
       │ 2. Patient Arrives
       │    Update Status
       ▼
┌─────────────┐
│appointments │
│status:      │
│"completed"  │
└──────┬──────┘
       │
       │ 3. Create Visit Record
       ▼
┌─────────────┐
│   visits    │◀───── appointment_id
└─────────────┘
```

**Steps**:
1. Receptionist creates appointment (status: "scheduled")
2. When patient arrives, appointment status updated to "completed"
3. Visit record created and linked to appointment via `visit_id`
4. Visit can now have prescriptions, reports, and bills

---

### 3. Medical Consultation Flow

```
┌─────────────┐
│    Doctor    │
└──────┬──────┘
       │
       │ 1. Record Diagnosis
       ▼
┌─────────────┐
│   visits    │
│ - diagnosis │
│ - advice    │
│ - next_visit│
└──────┬──────┘
       │
       ├──────────┬──────────┬──────────┐
       │          │          │          │
       │ 2.       │ 3.       │ 4.       │
       ▼          ▼          ▼          ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│prescrip- │ │ reports  │ │  bills   │ │          │
│  tions   │ └──────────┘ └──────────┘ │          │
└────┬─────┘                           │          │
     │                                  │          │
     │ 5. Add Medications               │          │
     ▼                                  │          │
┌──────────┐                            │          │
│medications│                           │          │
└──────────┘                            │          │
```

**Steps**:
1. Doctor records diagnosis, advice, and next visit date in `visits` table
2. Prescription created in `prescriptions` table (linked to visit)
3. Reports uploaded to `reports` table (linked to visit)
4. Bill generated in `bills` table (linked to visit)
5. Medications added to `medications` table (linked to prescription)

---

### 4. Walk-In Patient Flow

```
┌─────────────┐
│  Receptionist│
└──────┬──────┘
       │
       │ 1. Create Visit Directly
       │    (No Appointment)
       ▼
┌─────────────┐
│   visits    │
│appointment_ │
│  id: NULL   │
│visit_type:  │
│"walk_in"    │
└──────┬──────┘
       │
       │ 2. Continue with normal
       │    consultation flow
       ▼
   [Same as Medical Consultation Flow]
```

**Steps**:
1. Walk-in patient arrives without appointment
2. Visit created directly (appointment_id = NULL, visit_type = "walk_in")
3. Rest of flow same as scheduled appointment (prescriptions, reports, bills)

---

### 5. Billing Flow

```
┌─────────────┐
│   Billing   │
│   System    │
└──────┬──────┘
       │
       │ 1. Create Bill
       ▼
┌─────────────┐
│    bills    │
└──────┬──────┘
       │
       │ 2. Create Sections
       ▼
┌─────────────┐
│bill_sections│
│ - consultation│
│ - pharmacy  │
│ - lab_test  │
└──────┬──────┘
       │
       │ 3. Add Items
       ▼
┌─────────────┐
│ bill_items  │
│ - item 1    │
│ - item 2    │
│ - item 3    │
└─────────────┘
```

**Steps**:
1. Bill created for visit (total_amount calculated)
2. Bill sections created (consultation, pharmacy, lab_test, etc.)
3. Individual items added to each section with quantities and prices
4. Payment status tracked (pending → paid/failed)

---

## Workflow Documentation

### Workflow 1: Complete Appointment Lifecycle

**Scenario**: Patient schedules appointment, visits doctor, receives prescription and bill

**Step-by-Step Process**:

1. **Appointment Scheduling** (Receptionist)
   - Receptionist creates record in `appointments` table
   - Status: "scheduled"
   - Fields: patient_id, doctor_id, hospital_id, department, scheduled_date_time, reason

2. **Appointment Confirmation** (Optional)
   - System or receptionist updates status to "confirmed"
   - Can send reminder notifications

3. **Patient Arrival** (Receptionist)
   - Receptionist marks appointment as "completed"
   - Creates record in `visits` table
   - Links visit to appointment via `visit_id` in appointments table
   - Sets visit_type: "scheduled"

4. **Medical Consultation** (Doctor)
   - Doctor updates `visits` table with:
     - diagnosis
     - notes
     - advice
     - next_visit_date

5. **Prescription Creation** (Doctor)
   - Doctor creates record in `prescriptions` table (linked to visit)
   - Adds medications to `medications` table (linked to prescription)

6. **Report Upload** (If needed)
   - Lab reports or imaging files uploaded to `reports` table (linked to visit)

7. **Bill Generation** (Billing System)
   - Bill created in `bills` table (linked to visit)
   - Bill sections created (consultation, pharmacy, etc.)
   - Bill items added with quantities and prices
   - Payment status: "pending"

8. **Payment Processing** (Billing)
   - Payment received
   - Update `bills.payment_status` to "paid"
   - Record `payment_date`

**Data Flow**:
```
appointments (scheduled) 
  → appointments (completed) + visits (created)
  → visits (diagnosis added)
  → prescriptions + medications
  → reports (optional)
  → bills + bill_sections + bill_items
  → bills (paid)
```

---

### Workflow 2: Walk-In Patient

**Scenario**: Patient arrives without appointment

**Step-by-Step Process**:

1. **Patient Identification** (Receptionist)
   - Search patient by ID, name, or NFC card
   - Retrieve patient record from `patients` table

2. **Visit Creation** (Receptionist)
   - Create record in `visits` table directly
   - appointment_id: NULL
   - visit_type: "walk_in"
   - Set patient_id, doctor_id, hospital_id, visit_date

3. **Medical Consultation** (Doctor)
   - Same as Workflow 1, Step 4

4. **Prescription, Reports, Billing** (Doctor/Billing)
   - Same as Workflow 1, Steps 5-8

**Key Difference**: No appointment record exists. Visit is created directly.

---

### Workflow 3: Appointment Cancellation

**Scenario**: Patient cancels scheduled appointment

**Step-by-Step Process**:

1. **Cancellation Request** (Receptionist/Patient)
   - Update `appointments` table:
     - status: "cancelled"
     - cancelled_at: current timestamp
     - cancelled_reason: reason text

2. **No Visit Created**
   - Since appointment was cancelled, no visit record is created
   - No prescriptions, reports, or bills generated

3. **Rescheduling** (Optional)
   - Create new appointment record
   - Link to original cancelled appointment if needed (via notes field)

**Data Flow**:
```
appointments (scheduled) 
  → appointments (cancelled)
  → [No further records created]
```

---

### Workflow 4: Patient Medical History Retrieval

**Scenario**: Doctor needs to view patient's complete medical history

**Step-by-Step Process**:

1. **Patient Lookup**
   - Query `patients` table by patient_id
   - Retrieve basic patient information

2. **Allergies & Conditions**
   - Query `patient_allergies` table (filter by patient_id)
   - Query `patient_chronic_conditions` table (filter by patient_id)

3. **Visit History**
   - Query `visits` table (filter by patient_id)
   - Order by visit_date (descending)

4. **Prescriptions History**
   - For each visit, query `prescriptions` table
   - For each prescription, query `medications` table

5. **Reports History**
   - Query `reports` table (filter by visit_id from patient's visits)

6. **Billing History**
   - Query `bills` table (filter by visit_id from patient's visits)

**Query Pattern**:
```sql
-- Get patient with allergies and conditions
SELECT * FROM patients 
LEFT JOIN patient_allergies ON patients.patient_id = patient_allergies.patient_id
LEFT JOIN patient_chronic_conditions ON patients.patient_id = patient_chronic_conditions.patient_id
WHERE patients.patient_id = ?

-- Get all visits for patient
SELECT * FROM visits WHERE patient_id = ? ORDER BY visit_date DESC

-- Get prescriptions and medications for visits
SELECT * FROM prescriptions 
JOIN medications ON prescriptions.prescription_id = medications.prescription_id
WHERE prescriptions.visit_id IN (SELECT visit_id FROM visits WHERE patient_id = ?)
```

---

## Design Decisions

### 1. Separation of Appointments and Visits

**Decision**: Keep appointments and visits as separate tables

**Rationale**:
- **Appointments** represent scheduling (future/past scheduled time)
- **Visits** represent actual medical encounters
- Supports cancellations without affecting medical records
- Enables walk-ins (visits without appointments)
- Industry-standard pattern in healthcare systems

**Benefits**:
- Clear separation of concerns
- Better data integrity
- Supports complex workflows (rescheduling, cancellations)
- Easier analytics and reporting

---

### 2. Visit as Central Medical Record

**Decision**: Link all medical records (prescriptions, reports, bills) to visits

**Rationale**:
- One visit = one consultation = one billing unit
- Ensures data integrity (prescriptions can't exist without visit)
- Simplifies queries (all visit-related data in one place)
- Supports walk-ins (visits without appointments)

**Benefits**:
- Data consistency
- Simplified queries
- Clear medical history
- Accurate billing

---

### 3. Normalized Patient Data

**Decision**: Separate tables for allergies and chronic conditions

**Rationale**:
- Patients can have multiple allergies and conditions
- Enables efficient querying (find all patients with specific allergy)
- Maintains historical data (diagnosed dates)
- Supports safety checks (drug-allergy interactions)

**Benefits**:
- Data normalization
- Efficient queries
- Historical tracking
- Safety features

---

### 4. Hierarchical Billing Structure

**Decision**: Bill → Bill Sections → Bill Items

**Rationale**:
- Organizes charges by category (consultation, pharmacy, lab)
- Provides itemized billing
- Supports financial reporting by category
- Clear billing breakdown for patients

**Benefits**:
- Organized billing
- Financial reporting
- Patient transparency
- Flexible pricing

---

### 5. Structured Medication Data

**Decision**: Separate prescriptions and medications tables

**Rationale**:
- One prescription can have multiple medications
- Structured data enables automated processing
- Supports drug interaction checks
- Clear patient instructions

**Benefits**:
- Data structure
- Automation support
- Safety features
- Clear instructions

---

## Use Cases

### Use Case 1: New Patient Registration

**Actor**: Receptionist

**Preconditions**: None

**Main Flow**:
1. Receptionist creates user account in `users` table
2. Receptionist creates patient record in `patients` table
3. Receptionist adds allergies to `patient_allergies` table
4. Receptionist adds chronic conditions to `patient_chronic_conditions` table
5. System generates NFC card UID and stores in `patients.nfc_card_uid`

**Postconditions**: Patient registered and ready for appointments

---

### Use Case 2: Schedule Appointment

**Actor**: Receptionist

**Preconditions**: Patient exists in system

**Main Flow**:
1. Receptionist searches for patient
2. Receptionist creates appointment in `appointments` table
3. Status set to "scheduled"
4. System can send appointment confirmation

**Postconditions**: Appointment scheduled, patient can be notified

---

### Use Case 3: Complete Medical Consultation

**Actor**: Doctor

**Preconditions**: Visit exists (from completed appointment or walk-in)

**Main Flow**:
1. Doctor updates `visits` table with diagnosis, advice, next_visit_date
2. Doctor creates prescription in `prescriptions` table
3. Doctor adds medications to `medications` table
4. Doctor uploads reports to `reports` table (if needed)
5. System generates bill in `bills` table

**Postconditions**: Complete medical record created, bill generated

---

### Use Case 4: View Patient History

**Actor**: Doctor

**Preconditions**: Patient exists

**Main Flow**:
1. Doctor queries `patients` table for patient info
2. Doctor queries `patient_allergies` and `patient_chronic_conditions`
3. Doctor queries `visits` table for visit history
4. For each visit, doctor queries related prescriptions, medications, reports
5. System displays complete medical history

**Postconditions**: Doctor has complete patient medical history

---

### Use Case 5: Process Payment

**Actor**: Billing Staff

**Preconditions**: Bill exists with status "pending"

**Main Flow**:
1. Billing staff locates bill in `bills` table
2. Payment received
3. Update `bills.payment_status` to "paid"
4. Record `bills.payment_date`

**Postconditions**: Bill marked as paid, payment recorded

---

## Conclusion

This database design provides a comprehensive, scalable, and maintainable foundation for the Medical Management System. The schema supports:

- ✅ Multi-hospital operations
- ✅ Complete patient management
- ✅ Appointment scheduling and tracking
- ✅ Medical record keeping
- ✅ Prescription management
- ✅ Billing and payment processing
- ✅ Security and audit trails
- ✅ Future expansion capabilities

The design follows industry best practices and ensures data integrity, performance, and scalability for healthcare operations.

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Author**: Database Design Team

