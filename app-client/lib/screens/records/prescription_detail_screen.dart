import 'dart:io';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:path_provider/path_provider.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:share_plus/share_plus.dart';
import '../../core/constants/app_colors.dart';
import '../../core/models/visit.dart';

class PrescriptionDetailScreen extends StatefulWidget {
  final Prescription prescription;
  final String doctorName;

  const PrescriptionDetailScreen({
    super.key,
    required this.prescription,
    required this.doctorName,
  });

  @override
  State<PrescriptionDetailScreen> createState() =>
      _PrescriptionDetailScreenState();
}

class _PrescriptionDetailScreenState extends State<PrescriptionDetailScreen> {
  bool _isGenerating = false;

  Future<void> _generateAndSharePDF() async {
    setState(() => _isGenerating = true);
    try {
      final pdf = pw.Document();
      final dateStr = DateFormat('MMM dd, yyyy').format(
        DateTime.tryParse(widget.prescription.prescribedDate) ?? DateTime.now(),
      );

      pdf.addPage(
        pw.Page(
          pageFormat: PdfPageFormat.a4,
          build: (pw.Context context) {
            return pw.Padding(
              padding: const pw.EdgeInsets.all(40),
              child: pw.Column(
                crossAxisAlignment: pw.CrossAxisAlignment.start,
                children: [
                  // Header
                  pw.Row(
                    mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                    crossAxisAlignment: pw.CrossAxisAlignment.start,
                    children: [
                      pw.Column(
                        crossAxisAlignment: pw.CrossAxisAlignment.start,
                        children: [
                          pw.Text(
                            'PHYSICIAN',
                            style: pw.TextStyle(
                              fontSize: 8,
                              color: PdfColors.grey700,
                            ),
                          ),
                          pw.Text(
                            widget.doctorName.toUpperCase(),
                            style: pw.TextStyle(
                              fontSize: 18,
                              fontWeight: pw.FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      pw.Column(
                        crossAxisAlignment: pw.CrossAxisAlignment.end,
                        children: [
                          pw.Text(
                            'ISSUED ON',
                            style: pw.TextStyle(
                              fontSize: 8,
                              color: PdfColors.grey700,
                            ),
                          ),
                          pw.Text(
                            dateStr,
                            style: pw.TextStyle(
                              fontWeight: pw.FontWeight.bold,
                              fontSize: 10,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  pw.SizedBox(height: 40),

                  // Clinical Summary
                  if (widget.prescription.prescriptionText.isNotEmpty) ...[
                    pw.Text(
                      'CLINICAL SUMMARY',
                      style: pw.TextStyle(
                        fontSize: 10,
                        fontWeight: pw.FontWeight.bold,
                      ),
                    ),
                    pw.Divider(thickness: 1, color: PdfColors.black),
                    pw.SizedBox(height: 10),
                    pw.Text(
                      widget.prescription.prescriptionText,
                      style: const pw.TextStyle(fontSize: 12),
                    ),
                    pw.SizedBox(height: 40),
                  ],

                  // Medication Table
                  pw.Text(
                    'MEDICATION PLAN',
                    style: pw.TextStyle(
                      fontSize: 10,
                      fontWeight: pw.FontWeight.bold,
                    ),
                  ),
                  pw.Divider(thickness: 1, color: PdfColors.black),
                  pw.SizedBox(height: 10),

                  pw.Container(
                    decoration: pw.BoxDecoration(
                      border: pw.Border.all(color: PdfColors.black, width: 1),
                    ),
                    child: pw.Column(
                      children: widget.prescription.medications
                          .map(
                            (med) => pw.Container(
                              padding: const pw.EdgeInsets.all(12),
                              decoration: pw.BoxDecoration(
                                border: pw.Border(
                                  bottom:
                                      med ==
                                          widget.prescription.medications.last
                                      ? pw.BorderSide.none
                                      : const pw.BorderSide(
                                          color: PdfColors.black,
                                          width: 0.5,
                                        ),
                                ),
                              ),
                              child: pw.Column(
                                crossAxisAlignment: pw.CrossAxisAlignment.start,
                                children: [
                                  pw.Text(
                                    med.drugName.toUpperCase(),
                                    style: pw.TextStyle(
                                      fontSize: 12,
                                      fontWeight: pw.FontWeight.bold,
                                    ),
                                  ),
                                  pw.SizedBox(height: 8),
                                  pw.Row(
                                    children: [
                                      pw.Expanded(
                                        child: pw.Column(
                                          crossAxisAlignment:
                                              pw.CrossAxisAlignment.start,
                                          children: [
                                            pw.Text(
                                              'DOSAGE',
                                              style: const pw.TextStyle(
                                                fontSize: 7,
                                              ),
                                            ),
                                            pw.Text(
                                              med.dosage,
                                              style: pw.TextStyle(
                                                fontSize: 10,
                                                fontWeight: pw.FontWeight.bold,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                      pw.Expanded(
                                        child: pw.Column(
                                          crossAxisAlignment:
                                              pw.CrossAxisAlignment.start,
                                          children: [
                                            pw.Text(
                                              'FREQUENCY',
                                              style: const pw.TextStyle(
                                                fontSize: 7,
                                              ),
                                            ),
                                            pw.Text(
                                              med.frequency,
                                              style: pw.TextStyle(
                                                fontSize: 10,
                                                fontWeight: pw.FontWeight.bold,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                      pw.Expanded(
                                        child: pw.Column(
                                          crossAxisAlignment:
                                              pw.CrossAxisAlignment.start,
                                          children: [
                                            pw.Text(
                                              'DURATION',
                                              style: const pw.TextStyle(
                                                fontSize: 7,
                                              ),
                                            ),
                                            pw.Text(
                                              med.duration,
                                              style: pw.TextStyle(
                                                fontSize: 10,
                                                fontWeight: pw.FontWeight.bold,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          )
                          .toList(),
                    ),
                  ),

                  pw.Spacer(),
                  pw.Divider(thickness: 0.5),
                  pw.SizedBox(height: 10),
                  pw.Row(
                    mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                    children: [
                      pw.Text(
                        'MEDI LOCKER DIGITAL HEALTH RECORD',
                        style: const pw.TextStyle(
                          fontSize: 8,
                          color: PdfColors.grey500,
                        ),
                      ),
                      pw.Text(
                        'OFFICIAL DOCUMENT',
                        style: const pw.TextStyle(
                          fontSize: 8,
                          color: PdfColors.grey500,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            );
          },
        ),
      );

      final output = await getTemporaryDirectory();
      final file = File(
        "${output.path}/prescription_${widget.prescription.prescriptionId}.pdf",
      );
      await file.writeAsBytes(await pdf.save());

      // ignore: deprecated_member_use
      await Share.shareXFiles([
        XFile(file.path),
      ], subject: 'Prescription from Dr. ${widget.doctorName}');
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Error generating PDF: $e')));
    } finally {
      setState(() => _isGenerating = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final date =
        DateTime.tryParse(widget.prescription.prescribedDate) ?? DateTime.now();
    final dateStr = DateFormat('MMMM dd, yyyy').format(date);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        title: const Text(
          'PRESCRIPTION',
          style: TextStyle(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w900,
            fontSize: 15,
            letterSpacing: 2,
          ),
        ),
        actions: [
          if (_isGenerating)
            const Center(
              child: Padding(
                padding: EdgeInsets.only(right: 16),
                child: SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(strokeWidth: 2),
                ),
              ),
            ),
          if (!_isGenerating)
            IconButton(
              onPressed: _generateAndSharePDF,
              icon: const Icon(
                Icons.share_rounded,
                color: AppColors.textPrimary,
                size: 22,
              ),
            ),
          const SizedBox(width: 8),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Clinical Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'PRIMARY PHYSICIAN',
                        style: TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.w800,
                          color: AppColors.textSecondary.withValues(alpha: 0.4),
                          letterSpacing: 1.5,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        widget.doctorName.toUpperCase(),
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w900,
                          color: AppColors.textPrimary,
                          height: 1.1,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 60),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      'ISSUED ON',
                      style: TextStyle(
                        fontSize: 9,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textSecondary.withValues(alpha: 0.4),
                        letterSpacing: 1.5,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      dateStr.toUpperCase(),
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w900,
                        color: AppColors.textPrimary,
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 52),

            // Clinical Summary Label
            if (widget.prescription.prescriptionText.isNotEmpty) ...[
              const Text(
                'CLINICAL SUMMARY',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w900,
                  color: AppColors.textPrimary,
                  letterSpacing: 2,
                ),
              ),
              const Padding(
                padding: EdgeInsets.only(top: 8, bottom: 16),
                child: Divider(thickness: 1, color: AppColors.textPrimary),
              ),
              Text(
                widget.prescription.prescriptionText,
                style: TextStyle(
                  fontSize: 16,
                  height: 1.6,
                  color: AppColors.textPrimary.withValues(alpha: 0.8),
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 60),
            ],

            // Medications enclosed in a "Table" format
            const Text(
              'MEDICATIONS',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w900,
                color: AppColors.textPrimary,
                letterSpacing: 2,
              ),
            ),
            const Padding(
              padding: EdgeInsets.only(top: 8, bottom: 20),
              child: Divider(thickness: 1, color: AppColors.textPrimary),
            ),

            if (widget.prescription.medications.isEmpty)
              const Center(
                child: Text(
                  'NO MEDICATIONS RECORDED',
                  style: TextStyle(
                    fontSize: 13,
                    color: AppColors.textSecondary,
                  ),
                ),
              )
            else
              _buildMedicationsTable(),

            const SizedBox(height: 100),

            Center(
              child: Text(
                'MEDI LOCKER DIGITAL HEALTH RECORD',
                style: TextStyle(
                  fontSize: 8,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textSecondary.withValues(alpha: 0.4),
                  letterSpacing: 2,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMedicationsTable() {
    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: AppColors.textPrimary, width: 1.5),
      ),
      child: Column(
        children: widget.prescription.medications.map((med) {
          final isLast = med == widget.prescription.medications.last;
          return Container(
            decoration: BoxDecoration(
              border: Border(
                bottom: isLast
                    ? BorderSide.none
                    : const BorderSide(color: AppColors.textPrimary, width: 1),
              ),
            ),
            child: _buildMedicationRow(med),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildMedicationRow(dynamic med) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            med.drugName.toUpperCase(),
            style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w900,
              color: AppColors.textPrimary,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 12),
          IntrinsicHeight(
            child: Row(
              children: [
                _buildMedDetail('DOSAGE', med.dosage),
                _buildDivider(),
                _buildMedDetail('FREQUENCY', med.frequency),
                _buildDivider(),
                _buildMedDetail('DURATION', med.duration),
              ],
            ),
          ),
          if (med.instructions.isNotEmpty) ...[
            const SizedBox(height: 18),
            const Divider(height: 1, color: AppColors.divider),
            const SizedBox(height: 14),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'NOTES: ',
                  style: TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.w900,
                    color: AppColors.textSecondary.withValues(alpha: 0.6),
                    letterSpacing: 0.6,
                  ),
                ),
                Flexible(
                  child: Text(
                    med.instructions.toUpperCase(),
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary.withValues(alpha: 0.8),
                      height: 1.5,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildDivider() {
    return Container(
      width: 1,
      margin: const EdgeInsets.symmetric(horizontal: 14),
      color: AppColors.divider.withValues(alpha: 0.5),
    );
  }

  Widget _buildMedDetail(String label, String value) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 8,
              fontWeight: FontWeight.w800,
              color: AppColors.textSecondary.withValues(alpha: 0.5),
              letterSpacing: 1,
            ),
          ),
          const SizedBox(height: 5),
          Text(
            value,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w800,
              color: AppColors.textPrimary,
            ),
          ),
        ],
      ),
    );
  }
}
