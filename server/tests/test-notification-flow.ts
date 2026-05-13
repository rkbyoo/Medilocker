
import 'dotenv/config';
import { NotificationService } from '../src/app/modules/notification/notification.service';
import { prisma } from '../src/app/config/prisma';

/**
 * Notification Workflow Diagnostic Script
 * 
 * This script allows you to test the entire notification flow (DB + Push)
 * for a specific patient in one go.
 * 
 * Usage: 
 *   - Check/Test:    npx ts-node tests/test-notification-flow.ts [patient_id]
 *   - Link Token:    npx ts-node tests/test-notification-flow.ts [patient_id] --register [token]
 */

async function testFlow() {
  const patientId = process.argv[2];

  if (!patientId) {
    console.log('\n❌ Please provide a patient_id');
    console.log('Example: npx ts-node tests/test-notification-flow.ts clp123abc...\n');
    
    // Suggest some patients from DB
    const patients = await prisma.patient.findMany({
      take: 5,
      include: {
        _count: {
          select: { deviceTokens: true }
        }
      }
    });

    console.log('Available Patients:');
    patients.forEach(p => {
      console.log(`- ${p.name} (ID: ${p.patient_id}) [Devices: ${p._count.deviceTokens}]`);
    });
    return;
  }

  console.log(`\n🚀 Starting Notification Workflow Test for Patient: ${patientId}`);

  // OPTIONAL: Register a token if --register flag is present
  const registerIdx = process.argv.indexOf('--register');
  if (registerIdx !== -1 && process.argv[registerIdx + 1]) {
    const newToken = process.argv[registerIdx + 1];
    console.log(`\n📥 Registering new FCM token: ${newToken.substring(0, 10)}...`);
    await NotificationService.registerDeviceToken(patientId, newToken, 'android');
    console.log('✅ Token registered successfully.');
  }

  // 1. Check Device Tokens
  const tokens = await prisma.deviceToken.findMany({
    where: { patient_id: patientId }
  });

  if (tokens.length === 0) {
    console.log('⚠️  WARNING: No device tokens found for this patient. Push notifications will be skipped but DB entries will be created.');
  } else {
    console.log(`✅ Found ${tokens.length} registered device(s).`);
  }

  // 2. Trigger a sequence of notifications
  console.log('\n--- Step 1: Sending Appointment Scheduled ---');
  const n1 = await NotificationService.notifyAppointmentScheduled({
    patient_id: patientId,
    doctor_name: 'Test Doctor',
    department: 'Diagnostics',
    scheduled_date_time: new Date().toISOString(),
    appointment_id: 'TEST-APP-001',
    hospital_name: 'Medilocker Test Lab'
  });
  console.log(`Result: ${n1 ? 'Saved to DB' : 'Failed'}`);

  console.log('\n--- Step 2: Sending Bill Generated ---');
  const n2 = await NotificationService.notifyBillGenerated({
    patient_id: patientId,
    bill_id: 'TEST-BILL-001',
    total_amount: 500.50,
    visit_id: 'TEST-VISIT-001'
  });
  console.log(`Result: ${n2 ? 'Saved to DB' : 'Failed'}`);

  console.log('\n--- Step 3: Sending Report Uploaded ---');
  const n3 = await NotificationService.notifyReportUploaded({
    patient_id: patientId,
    report_type: 'Blood Test',
    report_id: 'TEST-REP-001',
    visit_id: 'TEST-VISIT-001'
  });
  console.log(`Result: ${n3 ? 'Saved to DB' : 'Failed'}`);

  console.log('\n--- Workflow Complete ---');
  console.log('Check your device for push notifications and Prisma Studio for DB records.');
}

testFlow()
  .catch(err => console.error(err))
  .finally(() => prisma.$disconnect());
