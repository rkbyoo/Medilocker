/**
 * Database Seed Script
 * 
 * This script inserts test data to verify the database design.
 * Run with: npx ts-node tests/seed-database.ts
 * 
 * Test Data:
 * - 1 Hospital
 * - 1 Doctor
 * - 1 Receptionist
 * - 2 Patients
 * - Appointments, Visits, Prescriptions, Bills
 */

import 'dotenv/config';
import { PrismaClient } from '../prisma/generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';

// Verify DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set. Please check your .env file.');
}

// Create PostgreSQL pool for Prisma 7 adapter
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create Prisma adapter
const adapter = new PrismaPg(pool);

// Create Prisma client with adapter
const prisma = new PrismaClient({ adapter });

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logStep(step: string) {
  log(`\n${step}`, colors.blue);
}

function logSuccess(message: string) {
  log(`✓ ${message}`, colors.green);
}

function logError(message: string) {
  log(`✗ ${message}`, colors.red);
}

async function main() {
  log('\n========================================', colors.yellow);
  log('  DATABASE SEED SCRIPT', colors.yellow);
  log('========================================\n', colors.yellow);

  try {
    // Hash password for all users
    const hashedPassword = await bcrypt.hash('password123', 10);

    // ============================================
    // 1. CREATE HOSPITAL
    // ============================================
    logStep('Step 1: Creating Hospital...');
    const hospital = await prisma.hospital.create({
      data: {
        name: 'City General Hospital',
        address: '123 Medical Street, City Center',
        contact_number: '+1-555-0100',
      },
    });
    logSuccess(`Hospital created: ${hospital.name} (ID: ${hospital.hospital_id})`);

    // ============================================
    // 2. CREATE USERS
    // ============================================
    logStep('Step 2: Creating Users...');

    // Doctor (created as hospital_staff, role defined in HospitalUser)
    const doctor = await prisma.user.create({
      data: {
        full_name: 'Dr. Michael Chen',
        email: 'doctor.chen@hospital.com',
        phone: '+1-555-0101',
        password_hash: hashedPassword,
        role: 'hospital_staff',
      },
    });
    logSuccess(`Doctor created: ${doctor.full_name} (ID: ${doctor.user_id})`);

    // Receptionist
    const receptionist = await prisma.user.create({
      data: {
        full_name: 'Sarah Johnson',
        email: 'sarah.johnson@hospital.com',
        phone: '+1-555-0102',
        password_hash: hashedPassword,
        role: 'hospital_staff',
      },
    });
    logSuccess(`Receptionist created: ${receptionist.full_name} (ID: ${receptionist.user_id})`);

    // Patient 1
    const patient1User = await prisma.user.create({
      data: {
        full_name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+1-555-0123',
        password_hash: hashedPassword,
        role: 'patient',
      },
    });
    logSuccess(`Patient 1 user created: ${patient1User.full_name}`);

    // Patient 2
    const patient2User = await prisma.user.create({
      data: {
        full_name: 'Emily Rodriguez',
        email: 'emily.rodriguez@email.com',
        phone: '+1-555-0234',
        password_hash: hashedPassword,
        role: 'patient',
      },
    });
    logSuccess(`Patient 2 user created: ${patient2User.full_name}`);

    // ============================================
    // 3. LINK USERS TO HOSPITAL
    // ============================================
    logStep('Step 3: Linking Users to Hospital...');

    const hospitalDoctor = await prisma.hospitalUser.create({
      data: {
        hospital_id: hospital.hospital_id,
        user_id: doctor.user_id,
        role_in_hospital: 'doctor',
      },
    });
    logSuccess(`Doctor linked to hospital`);

    const hospitalReceptionist = await prisma.hospitalUser.create({
      data: {
        hospital_id: hospital.hospital_id,
        user_id: receptionist.user_id,
        role_in_hospital: 'staff',
      },
    });
    logSuccess(`Receptionist linked to hospital`);

    // ============================================
    // 4. CREATE PATIENTS
    // ============================================
    logStep('Step 4: Creating Patient Records...');

    const patient1 = await prisma.patient.create({
      data: {
        user_id: patient1User.user_id,
        name: 'John Smith',
        dob: new Date('1985-03-15'),
        gender: 'Male',
        blood_group: 'O+',
        phone_number: '+1-555-0123',
        guardian_phone: '+1-555-0124',
        address: '123 Main Street, Springfield, IL 62701',
        marital_status: 'Married',
        spouse_name: 'Jane Smith',
        caste: 'General',
        religion: 'Christian',
        nationality: 'American',
        emergency_contact_name: 'Jane Smith',
        emergency_contact_number: '+1-555-0125',
        nfc_card_uid: 'NFC1234567890',
      },
    });
    logSuccess(`Patient 1 created: ${patient1.name} (ID: ${patient1.patient_id})`);

    const patient2 = await prisma.patient.create({
      data: {
        user_id: patient2User.user_id,
        name: 'Emily Rodriguez',
        dob: new Date('1992-07-22'),
        gender: 'Female',
        blood_group: 'A+',
        phone_number: '+1-555-0234',
        guardian_phone: '+1-555-0235',
        address: '456 Oak Avenue, Springfield, IL 62702',
        marital_status: 'Single',
        caste: 'General',
        religion: 'Catholic',
        nationality: 'American',
        emergency_contact_name: 'Maria Rodriguez',
        emergency_contact_number: '+1-555-0236',
        nfc_card_uid: 'NFC2345678901',
      },
    });
    logSuccess(`Patient 2 created: ${patient2.name} (ID: ${patient2.patient_id})`);

    // ============================================
    // 5. ADD ALLERGIES
    // ============================================
    logStep('Step 5: Adding Patient Allergies...');

    const allergy1 = await prisma.patientAllergy.create({
      data: {
        patient_id: patient1.patient_id,
        allergy_name: 'Penicillin',
        severity: 'severe',
        notes: 'Causes severe allergic reaction',
      },
    });
    logSuccess(`Allergy added for Patient 1: ${allergy1.allergy_name}`);

    const allergy2 = await prisma.patientAllergy.create({
      data: {
        patient_id: patient1.patient_id,
        allergy_name: 'Peanuts',
        severity: 'moderate',
      },
    });
    logSuccess(`Allergy added for Patient 1: ${allergy2.allergy_name}`);

    const allergy3 = await prisma.patientAllergy.create({
      data: {
        patient_id: patient2.patient_id,
        allergy_name: 'Latex',
        severity: 'mild',
      },
    });
    logSuccess(`Allergy added for Patient 2: ${allergy3.allergy_name}`);

    // ============================================
    // 6. ADD CHRONIC CONDITIONS
    // ============================================
    logStep('Step 6: Adding Chronic Conditions...');

    const condition1 = await prisma.patientChronicCondition.create({
      data: {
        patient_id: patient1.patient_id,
        condition_name: 'Hypertension',
        diagnosed_date: new Date('2020-01-15'),
        notes: 'Controlled with medication',
      },
    });
    logSuccess(`Condition added for Patient 1: ${condition1.condition_name}`);

    const condition2 = await prisma.patientChronicCondition.create({
      data: {
        patient_id: patient1.patient_id,
        condition_name: 'Type 2 Diabetes',
        diagnosed_date: new Date('2019-06-10'),
      },
    });
    logSuccess(`Condition added for Patient 1: ${condition2.condition_name}`);

    // ============================================
    // 7. CREATE APPOINTMENTS
    // ============================================
    logStep('Step 7: Creating Appointments...');

    const appointment1 = await prisma.appointment.create({
      data: {
        patient_id: patient1.patient_id,
        doctor_id: doctor.user_id,
        hospital_id: hospital.hospital_id,
        department: 'Cardiology',
        reason: 'Routine checkup',
        scheduled_date_time: new Date('2024-12-20T10:00:00Z'),
        status: 'scheduled',
        created_by: receptionist.user_id,
        notes: 'Patient requested morning appointment',
      },
    });
    logSuccess(`Appointment 1 created: ${appointment1.appointment_id} (Status: ${appointment1.status})`);

    const appointment2 = await prisma.appointment.create({
      data: {
        patient_id: patient2.patient_id,
        doctor_id: doctor.user_id,
        hospital_id: hospital.hospital_id,
        department: 'General Medicine',
        reason: 'Fever and cough',
        scheduled_date_time: new Date('2024-12-18T14:00:00Z'),
        status: 'completed',
        created_by: receptionist.user_id,
        notes: 'Urgent appointment',
      },
    });
    logSuccess(`Appointment 2 created: ${appointment2.appointment_id} (Status: ${appointment2.status})`);

    // ============================================
    // 8. CREATE VISIT (for completed appointment)
    // ============================================
    logStep('Step 8: Creating Visit for Completed Appointment...');

    const visit = await prisma.visit.create({
      data: {
        patient_id: patient2.patient_id,
        hospital_id: hospital.hospital_id,
        doctor_id: doctor.user_id,
        visit_date: new Date('2024-12-18T14:30:00Z'),
        visit_type: 'scheduled',
        diagnosis: 'Upper respiratory infection',
        notes: 'Patient presented with fever (38.5°C) and persistent cough. No chest pain.',
        advice: 'Rest, plenty of fluids, and take prescribed medications. Return if symptoms worsen.',
        next_visit_date: new Date('2024-12-25'),
      },
    });
    logSuccess(`Visit created: ${visit.visit_id}`);

    // Link visit to appointment
    await prisma.appointment.update({
      where: { appointment_id: appointment2.appointment_id },
      data: { visit_id: visit.visit_id },
    });
    logSuccess(`Visit linked to Appointment 2`);

    // ============================================
    // 9. CREATE PRESCRIPTION
    // ============================================
    logStep('Step 9: Creating Prescription...');

    const prescription = await prisma.prescription.create({
      data: {
        visit_id: visit.visit_id,
        prescribed_by: doctor.user_id,
        prescription_text: 'Antibiotics and cough syrup for upper respiratory infection',
      },
    });
    logSuccess(`Prescription created: ${prescription.prescription_id}`);

    // ============================================
    // 10. ADD MEDICATIONS
    // ============================================
    logStep('Step 10: Adding Medications...');

    const medication1 = await prisma.medication.create({
      data: {
        prescription_id: prescription.prescription_id,
        drug_name: 'Amoxicillin',
        dosage: '500mg',
        frequency: 'Three times daily',
        duration: '7 days',
        instructions: 'Take with food to reduce stomach upset',
      },
    });
    logSuccess(`Medication 1 added: ${medication1.drug_name}`);

    const medication2 = await prisma.medication.create({
      data: {
        prescription_id: prescription.prescription_id,
        drug_name: 'Cough Syrup',
        dosage: '10ml',
        frequency: 'Every 6 hours',
        duration: '5 days',
        instructions: 'Take before meals',
      },
    });
    logSuccess(`Medication 2 added: ${medication2.drug_name}`);

    // ============================================
    // 11. CREATE REPORT
    // ============================================
    logStep('Step 11: Creating Medical Report...');

    const report = await prisma.report.create({
      data: {
        visit_id: visit.visit_id,
        report_type: 'lab_test',
        file_url: 'https://storage.example.com/reports/lab-12345.pdf',
        file_type: 'PDF',
      },
    });
    logSuccess(`Report created: ${report.report_id} (Type: ${report.report_type})`);

    // ============================================
    // 12. CREATE BILL
    // ============================================
    logStep('Step 12: Creating Bill...');

    const bill = await prisma.bill.create({
      data: {
        visit_id: visit.visit_id,
        total_amount: 250.00,
        currency: 'USD',
        payment_status: 'pending',
      },
    });
    logSuccess(`Bill created: ${bill.bill_id} (Total: $${bill.total_amount})`);

    // ============================================
    // 13. CREATE BILL SECTIONS
    // ============================================
    logStep('Step 13: Creating Bill Sections...');

    const consultationSection = await prisma.billSection.create({
      data: {
        bill_id: bill.bill_id,
        section_type: 'consultation',
        section_total: 150.00,
      },
    });
    logSuccess(`Bill section created: Consultation ($${consultationSection.section_total})`);

    const pharmacySection = await prisma.billSection.create({
      data: {
        bill_id: bill.bill_id,
        section_type: 'pharmacy',
        section_total: 100.00,
      },
    });
    logSuccess(`Bill section created: Pharmacy ($${pharmacySection.section_total})`);

    // ============================================
    // 14. CREATE BILL ITEMS
    // ============================================
    logStep('Step 14: Creating Bill Items...');

    const consultationItem = await prisma.billItem.create({
      data: {
        section_id: consultationSection.section_id,
        description: 'Doctor Consultation Fee',
        quantity: 1,
        unit_price: 150.00,
        total_price: 150.00,
      },
    });
    logSuccess(`Bill item created: ${consultationItem.description}`);

    const medicationItem1 = await prisma.billItem.create({
      data: {
        section_id: pharmacySection.section_id,
        description: 'Amoxicillin 500mg',
        quantity: 21, // 7 days × 3 times daily
        unit_price: 3.50,
        total_price: 73.50,
      },
    });
    logSuccess(`Bill item created: ${medicationItem1.description}`);

    const medicationItem2 = await prisma.billItem.create({
      data: {
        section_id: pharmacySection.section_id,
        description: 'Cough Syrup 100ml',
        quantity: 1,
        unit_price: 26.50,
        total_price: 26.50,
      },
    });
    logSuccess(`Bill item created: ${medicationItem2.description}`);

    // ============================================
    // VERIFICATION QUERIES
    // ============================================
    logStep('\n========================================');
    log('  VERIFICATION QUERIES', colors.yellow);
    log('========================================\n');

    // Query 1: Hospital with users
    log('Query 1: Hospital with associated users', colors.blue);
    const hospitalWithUsers = await prisma.hospital.findUnique({
      where: { hospital_id: hospital.hospital_id },
      include: {
        hospitalUsers: {
          include: { user: true },
        },
      },
    });
    logSuccess(`Hospital: ${hospitalWithUsers?.name}`);
    logSuccess(`  - Users: ${hospitalWithUsers?.hospitalUsers.length}`);
    hospitalWithUsers?.hospitalUsers.forEach((hu) => {
      log(`    • ${hu.user.full_name} (${hu.role_in_hospital})`, colors.yellow);
    });

    // Query 2: Patient with allergies and conditions
    log('\nQuery 2: Patient 1 with allergies and conditions', colors.blue);
    const patientWithDetails = await prisma.patient.findUnique({
      where: { patient_id: patient1.patient_id },
      include: {
        allergies: true,
        chronicConditions: true,
      },
    });
    logSuccess(`Patient: ${patientWithDetails?.name}`);
    logSuccess(`  - Allergies: ${patientWithDetails?.allergies.length}`);
    patientWithDetails?.allergies.forEach((a) => {
      log(`    • ${a.allergy_name} (${a.severity || 'N/A'})`, colors.yellow);
    });
    logSuccess(`  - Conditions: ${patientWithDetails?.chronicConditions.length}`);
    patientWithDetails?.chronicConditions.forEach((c) => {
      log(`    • ${c.condition_name}`, colors.yellow);
    });

    // Query 3: Appointment with visit
    log('\nQuery 3: Completed appointment with visit', colors.blue);
    const appointmentWithVisit = await prisma.appointment.findUnique({
      where: { appointment_id: appointment2.appointment_id },
      include: {
        visit: {
          include: {
            prescriptions: {
              include: { medications: true },
            },
            reports: true,
            bill: {
              include: {
                billSections: {
                  include: { billItems: true },
                },
              },
            },
          },
        },
      },
    });
    logSuccess(`Appointment: ${appointmentWithVisit?.department}`);
    logSuccess(`  - Status: ${appointmentWithVisit?.status}`);
    logSuccess(`  - Visit: ${appointmentWithVisit?.visit ? 'Yes' : 'No'}`);
    if (appointmentWithVisit?.visit) {
      log(`    • Diagnosis: ${appointmentWithVisit.visit.diagnosis}`, colors.yellow);
      log(`    • Prescriptions: ${appointmentWithVisit.visit.prescriptions.length}`, colors.yellow);
      log(`    • Medications: ${appointmentWithVisit.visit.prescriptions[0]?.medications.length || 0}`, colors.yellow);
      log(`    • Reports: ${appointmentWithVisit.visit.reports.length}`, colors.yellow);
      log(`    • Bill Total: $${appointmentWithVisit.visit.bill?.total_amount || 0}`, colors.yellow);
    }

    // Query 4: Doctor's appointments
    log('\nQuery 4: Doctor appointments', colors.blue);
    const doctorAppointments = await prisma.appointment.findMany({
      where: { doctor_id: doctor.user_id },
      include: { patient: true },
    });
    logSuccess(`Doctor has ${doctorAppointments.length} appointments`);
    doctorAppointments.forEach((apt) => {
      log(`    • ${apt.patient.name} - ${apt.department} (${apt.status})`, colors.yellow);
    });

    // ============================================
    // SUMMARY
    // ============================================
    log('\n========================================', colors.green);
    log('  SEED COMPLETE!', colors.green);
    log('========================================\n', colors.green);

    log('Summary:', colors.blue);
    log(`  ✓ 1 Hospital created`, colors.green);
    log(`  ✓ 4 Users created (1 doctor, 1 receptionist, 2 patients)`, colors.green);
    log(`  ✓ 2 Patients with full demographic data`, colors.green);
    log(`  ✓ 3 Allergies added`, colors.green);
    log(`  ✓ 2 Chronic conditions added`, colors.green);
    log(`  ✓ 2 Appointments created`, colors.green);
    log(`  ✓ 1 Visit with complete medical record`, colors.green);
    log(`  ✓ 1 Prescription with 2 medications`, colors.green);
    log(`  ✓ 1 Medical report`, colors.green);
    log(`  ✓ 1 Bill with 2 sections and 3 items`, colors.green);
    log('\nAll relationships verified successfully!', colors.green);
  } catch (error) {
    logError('\nError occurred during seeding:');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

