/**
 * Migration Script: Add patient_number to existing patients
 * 
 * This script adds sequential patient numbers to existing patients
 * Run after making patient_number optional and pushing schema
 */

import 'dotenv/config';
import { PrismaClient } from '../prisma/generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

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

const BASE_NUMBER = 1000000000;

async function migrateExistingPatients() {
  console.log('\n========================================');
  console.log('  MIGRATING EXISTING PATIENTS');
  console.log('========================================\n');

  try {
    // Get all patients without patient_number
    const patientsWithoutNumber = await prisma.patient.findMany({
      where: {
        patient_number: null,
      },
      orderBy: {
        created_at: 'asc', // Process oldest first
      },
    });

    console.log(`Found ${patientsWithoutNumber.length} patients without patient_number\n`);

    if (patientsWithoutNumber.length === 0) {
      console.log('No patients to migrate. Exiting.');
      return;
    }

    // Get the current maximum patient number
    const maxPatient = await prisma.patient.findFirst({
      where: {
        patient_number: {
          not: null,
        },
      },
      orderBy: {
        patient_number: 'desc',
      },
      select: {
        patient_number: true,
      },
    });

    let nextNumber = BASE_NUMBER;
    if (maxPatient && maxPatient.patient_number) {
      const currentMax = parseInt(maxPatient.patient_number, 10);
      if (!isNaN(currentMax) && currentMax >= BASE_NUMBER) {
        nextNumber = currentMax + 1;
      }
    }

    console.log(`Starting patient numbers from: ${nextNumber}\n`);

    // Update each patient with sequential numbers
    for (const patient of patientsWithoutNumber) {
      const patientNumber = nextNumber.toString().padStart(10, '0');

      await prisma.patient.update({
        where: { patient_id: patient.patient_id },
        data: { patient_number: patientNumber },
      });

      console.log(`✓ Updated ${patient.name}: ${patientNumber}`);
      nextNumber++;

      // Safety check
      if (nextNumber > 9999999999) {
        throw new Error('Patient number limit reached!');
      }
    }

    console.log(`\n✅ Successfully migrated ${patientsWithoutNumber.length} patients!`);
    console.log(`Next patient number will be: ${nextNumber}`);
  } catch (error) {
    console.error('\n❌ Error during migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateExistingPatients()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

