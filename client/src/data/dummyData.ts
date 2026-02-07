import type { User, UserRole, Patient, MedicalRecord, Appointment } from '../types';

// Dummy users for authentication
export const dummyUsers: User[] = [
  {
    id: 'U001',
    username: 'receptionist',
    password: 'receptionist123',
    role: 'receptionist',
    name: 'Sarah Johnson'
  },
  {
    id: 'D001',
    username: 'doctor',
    password: 'doctor123',
    role: 'doctor',
    name: 'Dr. Michael Chen'
  }
];

// Dummy patients
export const dummyPatients: Patient[] = [
  {
    id: '1234567890',
    name: 'John Smith',
    dateOfBirth: '1985-03-15',
    gender: 'Male',
    bloodGroup: 'O+',
    phoneNumber: '+1-555-0123',
    guardianPhone: '+1-555-0124',
    address: '123 Main Street, Springfield, IL 62701',
    maritalStatus: 'Married',
    spouseName: 'Jane Smith',
    caste: 'General',
    religion: 'Christian',
    nationality: 'American',
    emergencyContactName: 'Jane Smith',
    emergencyContactNumber: '+1-555-0125',
    allergies: ['Penicillin', 'Peanuts'],
    chronicConditions: ['Hypertension', 'Type 2 Diabetes']
  },
  {
    id: '2345678901',
    name: 'Emily Rodriguez',
    dateOfBirth: '1992-07-22',
    gender: 'Female',
    bloodGroup: 'A+',
    phoneNumber: '+1-555-0234',
    guardianPhone: '+1-555-0235',
    address: '456 Oak Avenue, Springfield, IL 62702',
    maritalStatus: 'Single',
    caste: 'General',
    religion: 'Catholic',
    nationality: 'American',
    emergencyContactName: 'Maria Rodriguez',
    emergencyContactNumber: '+1-555-0236',
    allergies: ['Latex'],
    chronicConditions: ['Asthma']
  },
  {
    id: '3456789012',
    name: 'David Thompson',
    dateOfBirth: '1978-11-05',
    gender: 'Male',
    bloodGroup: 'B+',
    phoneNumber: '+1-555-0345',
    guardianPhone: '+1-555-0346',
    address: '789 Pine Road, Springfield, IL 62703',
    maritalStatus: 'Married',
    spouseName: 'Lisa Thompson',
    caste: 'General',
    religion: 'Protestant',
    nationality: 'American',
    emergencyContactName: 'Lisa Thompson',
    emergencyContactNumber: '+1-555-0347',
    allergies: [],
    chronicConditions: ['High Cholesterol']
  }
];

// Dummy medical records
export const dummyMedicalRecords: MedicalRecord[] = [
  {
    id: 'MR001',
    patientId: '1234567890',
    doctorId: 'D001',
    doctorName: 'Dr. Michael Chen',
    date: '2024-10-15',
    diagnosis: 'Acute upper respiratory infection',
    medications: 'Amoxicillin 500mg TID x 7 days, Paracetamol 500mg PRN for fever',
    advice: 'Rest, increase fluid intake, avoid cold beverages',
    nextVisit: '2024-10-22'
  },
  {
    id: 'MR002',
    patientId: '1234567890',
    doctorId: 'D001',
    doctorName: 'Dr. Michael Chen',
    date: '2024-09-01',
    diagnosis: 'Hypertension follow-up, blood pressure well controlled',
    medications: 'Lisinopril 10mg OD, continue current regimen',
    advice: 'Continue low-sodium diet, regular exercise, monitor BP at home',
    nextVisit: '2024-12-01'
  },
  {
    id: 'MR003',
    patientId: '2345678901',
    doctorId: 'D001',
    doctorName: 'Dr. Michael Chen',
    date: '2024-10-20',
    diagnosis: 'Asthma exacerbation, mild',
    medications: 'Albuterol inhaler 2 puffs QID, Prednisone 20mg OD x 5 days',
    advice: 'Avoid triggers, keep inhaler handy, follow up if symptoms worsen',
    nextVisit: '2024-11-03'
  }
];

// Dummy appointments
export const dummyAppointments: Appointment[] = [
  {
    id: 'APT001',
    patientId: '1234567890',
    patientName: 'John Smith',
    doctorId: 'D001',
    doctorName: 'Dr. Michael Chen',
    department: 'General Medicine',
    reason: 'Follow-up for hypertension',
    dateTime: new Date().toISOString(),
    status: 'scheduled'
  },
  {
    id: 'APT002',
    patientId: '2345678901',
    patientName: 'Emily Rodriguez',
    doctorId: 'D001',
    doctorName: 'Dr. Michael Chen',
    department: 'Pulmonology',
    reason: 'Asthma check-up',
    dateTime: new Date(Date.now() + 3600000).toISOString(),
    status: 'scheduled'
  },
  {
    id: 'APT003',
    patientId: '3456789012',
    patientName: 'David Thompson',
    doctorId: 'D001',
    doctorName: 'Dr. Michael Chen',
    department: 'Cardiology',
    reason: 'Chest pain evaluation',
    dateTime: new Date(Date.now() + 7200000).toISOString(),
    status: 'scheduled'
  }
];

// Helper function to generate unique 10-digit patient ID
export const generatePatientId = (): string => {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
};

// Helper function to get patient by ID
export const getPatientById = (id: string): Patient | undefined => {
  return dummyPatients.find(patient => patient.id === id);
};

// Helper function to get medical records by patient ID
export const getMedicalRecordsByPatientId = (patientId: string): MedicalRecord[] => {
  return dummyMedicalRecords.filter(record => record.patientId === patientId);
};

// Helper function to get appointments by doctor ID
export const getAppointmentsByDoctorId = (doctorId: string): Appointment[] => {
  return dummyAppointments.filter(apt => apt.doctorId === doctorId);
};
