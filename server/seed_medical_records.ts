import { VisitType, PaymentStatus, BillSectionType } from './prisma/generated/client';
import { prisma } from './src/app/config/prisma';

async function seed() {
  const patientId = "0e2717ee-0adc-4da2-9589-48c5f1f170ab";
  const doctorId = "2b18fb47-0298-486b-a4a4-7b033d2f77e9";
  const hospitalId = "23f29dfa-8d9d-4195-8577-682c3fd155e4";

  console.log("Seeding dummy visit data...");

  // 1. Create a past Visit (scheduled)
  const visit1 = await prisma.visit.create({
    data: {
      patient_id: patientId,
      doctor_id: doctorId,
      hospital_id: hospitalId,
      visit_date: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      visit_type: VisitType.scheduled,
      diagnosis: "Acute viral pharyngitis",
      notes: "Patient reported sore throat, mild fever, and headaches.",
      advice: "Rest, hydrate, and complete the prescribed course of antibiotics.",
      next_visit_date: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // in 7 days
    }
  });

  // 2. Create Prescription for Visit 1
  const prescription1 = await prisma.prescription.create({
    data: {
      visit_id: visit1.visit_id,
      prescribed_by: doctorId,
      prescription_text: "Please take after food.",
      medications: {
        create: [
          {
            drug_name: "Amoxicillin",
            dosage: "500mg",
            frequency: "Twice a day",
            duration: "5 days",
            instructions: "Take after meals"
          },
          {
            drug_name: "Paracetamol",
            dosage: "500mg",
            frequency: "SOS",
            duration: "3 days",
            instructions: "Take if fever exceeds 100F"
          }
        ]
      }
    }
  });

  // 3. Create a Report for Visit 1
  await prisma.report.create({
    data: {
      visit_id: visit1.visit_id,
      report_type: "Blood Test",
      file_url: "https://example.com/dummy-blood-report.pdf",
      file_type: "pdf"
    }
  });

  // 4. Create a Bill for Visit 1
  await prisma.bill.create({
    data: {
      visit_id: visit1.visit_id,
      total_amount: 150.00,
      currency: "USD",
      payment_status: PaymentStatus.pending,
      billSections: {
        create: [
          {
            section_type: BillSectionType.consultation,
            section_total: 100.00,
            billItems: {
              create: [
                {
                  description: "General Consultation",
                  quantity: 1,
                  unit_price: 100.00,
                  total_price: 100.00
                }
              ]
            }
          },
          {
            section_type: BillSectionType.lab_test,
            section_total: 50.00,
            billItems: {
              create: [
                {
                  description: "Complete Blood Count",
                  quantity: 1,
                  unit_price: 50.00,
                  total_price: 50.00
                }
              ]
            }
          }
        ]
      }
    }
  });

  // 5. Create a second older Visit (emergency)
  const visit2 = await prisma.visit.create({
    data: {
      patient_id: patientId,
      doctor_id: doctorId,
      hospital_id: hospitalId,
      visit_date: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      visit_type: VisitType.emergency,
      diagnosis: "Mild sprained ankle",
      notes: "Swelling in the right ankle after a fall.",
      advice: "RICE protocol: Rest, Ice, Compression, Elevation.",
    }
  });

  // 6. Create Report for Visit 2
  await prisma.report.create({
    data: {
      visit_id: visit2.visit_id,
      report_type: "X-Ray",
      file_url: "https://example.com/dummy-xray.png",
      file_type: "image/png"
    }
  });
  
  // 7. Create a Bill for Visit 2 (Paid)
  await prisma.bill.create({
    data: {
      visit_id: visit2.visit_id,
      total_amount: 250.00,
      currency: "USD",
      payment_status: PaymentStatus.paid,
      payment_date: new Date(),
      billSections: {
        create: [
          {
            section_type: BillSectionType.imaging,
            section_total: 250.00,
            billItems: {
              create: [
                {
                  description: "Ankle X-Ray",
                  quantity: 1,
                  unit_price: 250.00,
                  total_price: 250.00
                }
              ]
            }
          }
        ]
      }
    }
  });

  console.log("Dummy data successfully seeded!");
  await prisma.$disconnect();
}

seed().catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
