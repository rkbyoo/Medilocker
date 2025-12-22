////////////////////////////////////////////////////
// ENUMS
////////////////////////////////////////////////////
Enum user_role {
patient
doctor
admin
hospital_staff
}

Enum hospital_role {
doctor
nurse
staff
admin
}

Enum appointment_status {
scheduled
confirmed
completed
cancelled
no_show
}

Enum visit_type {
scheduled
walk_in
follow_up
emergency
}

Enum payment_status {
pending
paid
failed
}

Enum bill_section_type {
consultation
pharmacy
lab_test
imaging
other
}

////////////////////////////////////////////////////
// USERS & HOSPITALS
////////////////////////////////////////////////////
Table users {
user_id uuid [pk]
full_name varchar(150) [not null]
email varchar(150) [unique, not null]
phone varchar(20)
password_hash text [not null]
role user_role [not null]
created_at timestamp
updated_at timestamp
Indexes {
(email) [unique]
}
}

Table hospitals {
hospital_id uuid [pk]
name varchar(200) [not null]
address text
contact_number varchar(20)
created_at timestamp
}

Table hospital_users {
hospital_user_id uuid [pk]
hospital_id uuid [not null]
user_id uuid [not null]
role_in_hospital hospital_role [not null]
created_at timestamp
Indexes {
(hospital_id)
(user_id)
}
}

////////////////////////////////////////////////////
// PATIENTS
////////////////////////////////////////////////////
Table patients {
patient_id uuid [pk]
user_id uuid [not null]

-- Basic Information
name varchar(200) [not null]
dob date
gender varchar(10)
blood_group varchar(5)

-- Contact Information
phone_number varchar(20)
guardian_phone varchar(20)
address text
emergency_contact_name varchar(200)
emergency_contact_number varchar(20)

-- Personal Details
marital_status varchar(20)
spouse_name varchar(200)
caste varchar(100)
religion varchar(100)
nationality varchar(100)

-- Medical Information
photo_url text

-- NFC Card
nfc_card_uid varchar(100) [unique]

created_at timestamp
updated_at timestamp

Indexes {
(nfc_card_uid) [unique]
(user_id)
(name)
(phone_number)
}
}

Table patient_allergies {
allergy_id uuid [pk]
patient_id uuid [not null]
allergy_name varchar(200) [not null]
severity varchar(50)
notes text
created_at timestamp
Indexes {
(patient_id)
}
}

Table patient_chronic_conditions {
condition_id uuid [pk]
patient_id uuid [not null]
condition_name varchar(200) [not null]
diagnosed_date date
notes text
created_at timestamp
Indexes {
(patient_id)
}
}

////////////////////////////////////////////////////
// APPOINTMENTS (Scheduling)
////////////////////////////////////////////////////
Table appointments {
appointment_id uuid [pk]
patient_id uuid [not null]
doctor_id uuid [not null]
hospital_id uuid [not null]
department varchar(100) [not null]
reason text
scheduled_date_time timestamp [not null]
status appointment_status [not null]

-- Link to visit when completed
visit_id uuid [nullable]

-- Metadata
created_by uuid [not null]
notes text
cancelled_at timestamp
cancelled_reason text

created_at timestamp
updated_at timestamp

Indexes {
(patient_id)
(doctor_id)
(scheduled_date_time)
(status)
(hospital_id)
(visit_id)
}
}

////////////////////////////////////////////////////
// VISITS (Medical Encounters)
////////////////////////////////////////////////////
Table visits {
visit_id uuid [pk]

-- Link to appointment (nullable for walk-ins)
appointment_id uuid [nullable]

-- Patient & Doctor Info
patient_id uuid [not null]
hospital_id uuid [not null]
doctor_id uuid [not null]

-- Visit Details
visit_date timestamp [not null]
visit_type visit_type [not null]

-- Medical Record Fields
diagnosis text
notes text
advice text
next_visit_date date

created_at timestamp
updated_at timestamp

Indexes {
(patient_id)
(doctor_id)
(visit_date)
(appointment_id)
(hospital_id)
}
}

////////////////////////////////////////////////////
// PRESCRIPTIONS & MEDICATIONS
////////////////////////////////////////////////////
Table prescriptions {
prescription_id uuid [pk]
visit_id uuid [not null]
prescribed_by uuid [not null]
prescription_text text
created_at timestamp
Indexes {
(visit_id)
(prescribed_by)
}
}

Table medications {
medication_id uuid [pk]
prescription_id uuid [not null]
drug_name varchar(200) [not null]
dosage varchar(100)
frequency varchar(100)
duration varchar(100)
instructions text
Indexes {
(prescription_id)
}
}

////////////////////////////////////////////////////
// REPORTS & FILES
////////////////////////////////////////////////////
Table reports {
report_id uuid [pk]
visit_id uuid [not null]
report_type varchar(100) [not null]
file_url text [not null]
file_type varchar(20)
uploaded_at timestamp
Indexes {
(visit_id)
(report_type)
}
}

////////////////////////////////////////////////////
// BILLING
////////////////////////////////////////////////////
Table bills {
bill_id uuid [pk]
visit_id uuid [not null]
total_amount decimal(10,2) [not null]
currency varchar(10) [default: 'USD']
payment_status payment_status [not null]
payment_date timestamp
created_at timestamp
Indexes {
(visit_id)
(payment_status)
}
}

Table bill_sections {
section_id uuid [pk]
bill_id uuid [not null]
section_type bill_section_type [not null]
section_total decimal(10,2) [not null]
created_at timestamp
Indexes {
(bill_id)
}
}

Table bill_items {
item_id uuid [pk]
section_id uuid [not null]
description varchar(255) [not null]
quantity int [default: 1]
unit_price decimal(10,2) [not null]
total_price decimal(10,2) [not null]
Indexes {
(section_id)
}
}

////////////////////////////////////////////////////
// SECURITY & AUDIT
////////////////////////////////////////////////////
Table access_logs {
log_id bigserial [pk]
user_id uuid
action varchar(200) [not null]
timestamp timestamp [default: now()]
ip_address varchar(50)
user_agent text
success boolean [not null]
Indexes {
(user_id)
(timestamp)
(action)
}
}

Table refresh_tokens {
token_id uuid [pk]
user_id uuid [not null]
refresh_token text [unique, not null]
expires_at timestamp [not null]
created_at timestamp
Indexes {
(user_id)
(refresh_token) [unique]
}
}

////////////////////////////////////////////////////
// RELATIONSHIPS
////////////////////////////////////////////////////

-- Hospital & User Relationships
Ref: hospital_users.hospital_id > hospitals.hospital_id
Ref: hospital_users.user_id > users.user_id

-- Patient Relationships
Ref: patients.user_id > users.user_id
Ref: patient_allergies.patient_id > patients.patient_id
Ref: patient_chronic_conditions.patient_id > patients.patient_id

-- Appointment Relationships
Ref: appointments.patient_id > patients.patient_id
Ref: appointments.doctor_id > users.user_id
Ref: appointments.hospital_id > hospitals.hospital_id
Ref: appointments.visit_id > visits.visit_id
Ref: appointments.created_by > users.user_id

-- Visit Relationships
Ref: visits.appointment_id > appointments.appointment_id
Ref: visits.patient_id > patients.patient_id
Ref: visits.hospital_id > hospitals.hospital_id
Ref: visits.doctor_id > users.user_id

-- Prescription Relationships
Ref: prescriptions.visit_id > visits.visit_id
Ref: prescriptions.prescribed_by > users.user_id
Ref: medications.prescription_id > prescriptions.prescription_id

-- Report Relationships
Ref: reports.visit_id > visits.visit_id

-- Billing Relationships
Ref: bills.visit_id > visits.visit_id
Ref: bill_sections.bill_id > bills.bill_id
Ref: bill_items.section_id > bill_sections.section_id

-- Security Relationships
Ref: access_logs.user_id > users.user_id
Ref: refresh_tokens.user_id > users.user_id
