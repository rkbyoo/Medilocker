# Database Schema Documentation

## Overview
PostgreSQL database schema for the JECSmart Patient Health Card System with comprehensive medical data management.

## Database Design Principles
- HIPAA compliance for healthcare data
- Referential integrity with foreign keys
- Audit trails for all critical operations
- Scalable design for multi-hospital deployment
- Data encryption for sensitive information

## Core Tables

### Users Table
```sql
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('patient', 'doctor', 'admin', 'hospital_staff')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

### Patients Table
```sql
CREATE TABLE patients (
    patient_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10),
    blood_group VARCHAR(5),
    emergency_contact VARCHAR(20),
    emergency_contact_name VARCHAR(100),
    address TEXT,
    insurance_number VARCHAR(50),
    insurance_provider VARCHAR(100),
    allergies TEXT[], -- Array of allergies
    chronic_conditions TEXT[], -- Array of conditions
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_patients_user_id ON patients(user_id);
CREATE INDEX idx_patients_dob ON patients(date_of_birth);
```

### Doctors Table
```sql
CREATE TABLE doctors (
    doctor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    specialization VARCHAR(100),
    hospital_id UUID REFERENCES hospitals(hospital_id),
    years_of_experience INTEGER,
    qualifications TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_doctors_user_id ON doctors(user_id);
CREATE INDEX idx_doctors_hospital_id ON doctors(hospital_id);
CREATE INDEX idx_doctors_specialization ON doctors(specialization);
```

### Hospitals Table
```sql
CREATE TABLE hospitals (
    hospital_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(150),
    license_number VARCHAR(50) UNIQUE,
    type VARCHAR(50), -- 'public', 'private', 'specialty'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_hospitals_name ON hospitals(name);
CREATE INDEX idx_hospitals_type ON hospitals(type);
```

## Medical Data Tables

### Medical Records Table
```sql
CREATE TABLE medical_records (
    record_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(doctor_id),
    hospital_id UUID REFERENCES hospitals(hospital_id),
    record_type VARCHAR(50) NOT NULL, -- 'consultation', 'lab_result', 'imaging', 'surgery'
    title VARCHAR(200) NOT NULL,
    description TEXT,
    diagnosis TEXT,
    treatment_plan TEXT,
    record_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX idx_medical_records_doctor_id ON medical_records(doctor_id);
CREATE INDEX idx_medical_records_date ON medical_records(record_date);
CREATE INDEX idx_medical_records_type ON medical_records(record_type);
```

### Prescriptions Table
```sql
CREATE TABLE prescriptions (
    prescription_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(doctor_id),
    hospital_id UUID REFERENCES hospitals(hospital_id),
    diagnosis TEXT,
    instructions TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    prescribed_date DATE NOT NULL,
    valid_until DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_doctor_id ON prescriptions(doctor_id);
CREATE INDEX idx_prescriptions_date ON prescriptions(prescribed_date);
CREATE INDEX idx_prescriptions_status ON prescriptions(status);
```

### Prescription Medications Table
```sql
CREATE TABLE prescription_medications (
    medication_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_id UUID NOT NULL REFERENCES prescriptions(prescription_id) ON DELETE CASCADE,
    medication_name VARCHAR(200) NOT NULL,
    dosage VARCHAR(50),
    frequency VARCHAR(100),
    duration VARCHAR(50),
    quantity INTEGER,
    instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_prescription_medications_prescription_id ON prescription_medications(prescription_id);
```

### Appointments Table
```sql
CREATE TABLE appointments (
    appointment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(doctor_id),
    hospital_id UUID REFERENCES hospitals(hospital_id),
    appointment_date TIMESTAMP NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
    reason TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
```

## File Storage Tables

### Medical Files Table
```sql
CREATE TABLE medical_files (
    file_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    record_id UUID REFERENCES medical_records(record_id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50), -- 'image', 'pdf', 'document'
    file_size BIGINT,
    mime_type VARCHAR(100),
    storage_path TEXT NOT NULL, -- S3/Blob storage path
    uploaded_by UUID REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_medical_files_patient_id ON medical_files(patient_id);
CREATE INDEX idx_medical_files_record_id ON medical_files(record_id);
CREATE INDEX idx_medical_files_type ON medical_files(file_type);
```

## Authentication & Security Tables

### Refresh Tokens Table
```sql
CREATE TABLE refresh_tokens (
    token_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    refresh_token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_revoked BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
```

### Access Logs Table
```sql
CREATE TABLE access_logs (
    log_id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(user_id),
    action VARCHAR(200) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_access_logs_user_id ON access_logs(user_id);
CREATE INDEX idx_access_logs_timestamp ON access_logs(timestamp);
CREATE INDEX idx_access_logs_action ON access_logs(action);
```

## NFC Card Data Table

### NFC Cards Table
```sql
CREATE TABLE nfc_cards (
    card_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    card_number VARCHAR(50) UNIQUE NOT NULL,
    card_type VARCHAR(20) DEFAULT 'standard', -- 'standard', 'premium', 'emergency'
    is_active BOOLEAN DEFAULT true,
    last_sync TIMESTAMP,
    data_version INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_nfc_cards_patient_id ON nfc_cards(patient_id);
CREATE INDEX idx_nfc_cards_number ON nfc_cards(card_number);
CREATE INDEX idx_nfc_cards_active ON nfc_cards(is_active);
```

## Database Functions and Triggers

### Update Timestamp Trigger
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Audit Log Function
```sql
CREATE OR REPLACE FUNCTION log_data_changes()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO access_logs (user_id, action, resource_type, resource_id, success, timestamp)
    VALUES (
        COALESCE(NEW.user_id, OLD.user_id),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.patient_id, OLD.patient_id, NEW.user_id, OLD.user_id),
        true,
        CURRENT_TIMESTAMP
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';
```

## Data Migration Scripts
Located in `/migrations/` directory:
- `001_create_tables.sql` - Initial schema creation
- `002_add_indexes.sql` - Performance indexes
- `003_add_triggers.sql` - Audit triggers
- `004_sample_data.sql` - Sample data for testing

## Backup and Recovery
- Daily automated backups
- Point-in-time recovery capability
- Cross-region backup replication
- Disaster recovery procedures