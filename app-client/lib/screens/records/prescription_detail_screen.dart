import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/models/visit.dart';
import 'package:intl/intl.dart';

class PrescriptionDetailScreen extends StatelessWidget {
  final Prescription prescription;
  final String doctorName;

  const PrescriptionDetailScreen({
    super.key,
    required this.prescription,
    required this.doctorName,
  });

  @override
  Widget build(BuildContext context) {
    String dateStr = 'Unknown Date';
    try {
      if (prescription.prescribedDate.isNotEmpty) {
        DateTime dt = DateTime.parse(prescription.prescribedDate);
        dateStr = DateFormat('MMM dd, yyyy - hh:mm a').format(dt);
      }
    } catch (_) {}

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Prescription Details', style: TextStyle(color: AppColors.textPrimary)),
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: AppColors.textPrimary),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Doctor and Date Info
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, 4)),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Dr. $doctorName', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                  const SizedBox(height: 8),
                  Text('Date: $dateStr', style: const TextStyle(fontSize: 14, color: AppColors.textSecondary)),
                ],
              ),
            ),
            const SizedBox(height: 24),
            
            // Prescription Notes/Text
            if (prescription.prescriptionText.isNotEmpty) ...[
              const Text('Prescription Notes', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
              const SizedBox(height: 12),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.05),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.primary.withValues(alpha: 0.2)),
                ),
                child: Text(
                  prescription.prescriptionText,
                  style: const TextStyle(fontSize: 15, color: AppColors.textPrimary, height: 1.4),
                ),
              ),
              const SizedBox(height: 24),
            ],

            // Medications Table
            const Text('Medications', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
            const SizedBox(height: 16),
            if (prescription.medications.isEmpty)
              const Center(child: Text('No medications listed.', style: TextStyle(color: AppColors.textSecondary)))
            else
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, 4)),
                  ],
                ),
                child: SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: DataTable(
                    headingRowColor: WidgetStateProperty.all(AppColors.background),
                    columns: const [
                      DataColumn(label: Text('Drug Name', style: TextStyle(fontWeight: FontWeight.bold))),
                      DataColumn(label: Text('Dosage', style: TextStyle(fontWeight: FontWeight.bold))),
                      DataColumn(label: Text('Frequency', style: TextStyle(fontWeight: FontWeight.bold))),
                      DataColumn(label: Text('Duration', style: TextStyle(fontWeight: FontWeight.bold))),
                      DataColumn(label: Text('Instructions', style: TextStyle(fontWeight: FontWeight.bold))),
                    ],
                    rows: prescription.medications.map((med) {
                      return DataRow(
                        cells: [
                          DataCell(Text(med.drugName, style: const TextStyle(fontWeight: FontWeight.w600))),
                          DataCell(Text(med.dosage)),
                          DataCell(Text(med.frequency)),
                          DataCell(Text(med.duration)),
                          DataCell(Text(med.instructions.isNotEmpty ? med.instructions : '-')),
                        ],
                      );
                    }).toList(),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
