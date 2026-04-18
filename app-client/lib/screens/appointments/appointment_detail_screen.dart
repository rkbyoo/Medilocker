import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:add_2_calendar/add_2_calendar.dart' as calendar;
import 'package:maps_launcher/maps_launcher.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:share_plus/share_plus.dart';
import 'package:path_provider/path_provider.dart';
import 'dart:io';
import '../../core/constants/app_colors.dart';
import '../../core/models/appointment.dart';

class AppointmentDetailScreen extends StatelessWidget {
  final Appointment appointment;

  const AppointmentDetailScreen({super.key, required this.appointment});

  @override
  Widget build(BuildContext context) {
    DateTime? dt;
    try {
      dt = DateTime.parse(appointment.scheduledDateTime).toLocal();
    } catch (_) {}

    final dateStr = dt != null
        ? DateFormat('EEEE, MMMM dd').format(dt)
        : 'Date TBD';
    final timeStr = dt != null ? DateFormat('hh:mm a').format(dt) : 'Time TBD';

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        title: const Text(
          'Appointment',
          style: TextStyle(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.bold,
            fontSize: 18,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.share_outlined, color: AppColors.textPrimary),
            onPressed: () => _generateAndSharePDF(context, timeStr, dateStr),
          ),
          const SizedBox(width: 16),
        ],
        leading: IconButton(
          icon: const Icon(Icons.close, color: AppColors.textPrimary),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          return Column(
            children: [
              Expanded(
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 60),

                      // Status Label (Top Right-ish)
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 40),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            _buildMinimalStatus(),
                            Text(
                              'REF: ${appointment.appointmentId.substring(0, 8).toUpperCase()}',
                              style: TextStyle(
                                fontSize: 9,
                                fontWeight: FontWeight.w600,
                                color: AppColors.textSecondary.withValues(
                                  alpha: 0.4,
                                ),
                                letterSpacing: 1,
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 16),

                      // Date & Time Hero
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 40),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              timeStr,
                              style: const TextStyle(
                                fontSize: 64,
                                fontWeight: FontWeight
                                    .w200, // Ultra light for premium feel
                                color: AppColors.textPrimary,
                                letterSpacing: -3,
                                height: 0.9,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              dateStr.toUpperCase(),
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w800,
                                color: AppColors.textPrimary,
                                letterSpacing: 2.5,
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 80),

                      // Information Grid
                      _buildEditorialSection(
                        'Healthcare Provider',
                        appointment.doctor.fullName,
                        subtitle: appointment.department,
                      ),
                      _buildEditorialSection(
                        'Reason for Visit',
                        appointment.reason.isNotEmpty
                            ? appointment.reason
                            : 'General Checkup',
                      ),
                      _buildEditorialSection(
                        'Visit Location',
                        appointment.hospital.name,
                        subtitle: appointment.hospital.address,
                        onAction: () => MapsLauncher.launchQuery(
                          appointment.hospital.address,
                        ),
                        actionLabel: 'OPEN MAPS',
                      ),

                      const SizedBox(height: 40),
                    ],
                  ),
                ),
              ),

              // Minimal Bottom Button
              _buildBottomAction(context, dt),
            ],
          );
        },
      ),
    );
  }

  Widget _buildMinimalStatus() {
    final status = appointment.status.toLowerCase();
    Color color = AppColors.primary;
    if (status == 'confirmed') color = AppColors.success;
    if (status == 'cancelled') color = AppColors.emergency;

    return Text(
      appointment.status.toUpperCase(),
      style: TextStyle(
        color: color,
        fontWeight: FontWeight.w900,
        fontSize: 10,
        letterSpacing: 1.5,
      ),
    );
  }

  Widget _buildEditorialSection(
    String label,
    String value, {
    String? subtitle,
    VoidCallback? onAction,
    String? actionLabel,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 24),
      decoration: BoxDecoration(
        border: Border(
          top: BorderSide(
            color: AppColors.divider.withValues(alpha: 0.6),
            width: 0.5,
          ),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label.toUpperCase(),
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w700,
              color: AppColors.textSecondary.withValues(alpha: 0.6),
              letterSpacing: 1.2,
            ),
          ),
          const SizedBox(height: 8),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      value,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary,
                        height: 1.2,
                      ),
                    ),
                    if (subtitle != null) ...[
                      const SizedBox(height: 4),
                      Text(
                        subtitle,
                        style: const TextStyle(
                          fontSize: 14,
                          color: AppColors.textSecondary,
                          height: 1.4,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              if (onAction != null)
                TextButton(
                  onPressed: onAction,
                  style: TextButton.styleFrom(
                    padding: EdgeInsets.zero,
                    minimumSize: Size.zero,
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                  child: Text(
                    actionLabel ?? 'ACTION',
                    style: const TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w900,
                      color: AppColors.primary,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildBottomAction(BuildContext context, DateTime? dt) {
    final now = DateTime.now();
    final status = appointment.status.toLowerCase();
    final isStale = status == 'cancelled' || 
                    status == 'completed' || 
                    (dt != null && dt.isBefore(now));

    return Container(
      padding: const EdgeInsets.fromLTRB(40, 0, 40, 40),
      child: Container(
        width: double.infinity,
        height: 64,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isStale 
              ? AppColors.textSecondary.withValues(alpha: 0.2) 
              : AppColors.textPrimary, 
            width: 1.5
          ),
        ),
        child: ElevatedButton(
          onPressed: isStale ? null : () async {
            if (dt != null) {
              try {
                final calendar.Event event = calendar.Event(
                  title: 'Appointment with ${appointment.doctor.fullName}',
                  description:
                      'Reason: ${appointment.reason.isEmpty ? "General Checkup" : appointment.reason}\n'
                      'Department: ${appointment.department}\n'
                      'Hospital: ${appointment.hospital.name}',
                  location: appointment.hospital.address,
                  startDate: dt,
                  endDate: dt.add(const Duration(hours: 1)),
                  iosParams: const calendar.IOSParams(
                    reminder: Duration(minutes: 30),
                  ),
                );

                final bool success = await calendar.Add2Calendar.addEvent2Cal(
                  event,
                );

                if (!success && context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Could not open calendar app'),
                    ),
                  );
                }
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Error: ${e.toString().split('\n').first}'),
                    ),
                  );
                }
              }
            } else {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Invalid appointment date')),
              );
            }
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.textPrimary,
            foregroundColor: Colors.white,
            disabledBackgroundColor: AppColors.textSecondary.withValues(alpha: 0.1),
            disabledForegroundColor: AppColors.textSecondary.withValues(alpha: 0.4),
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
            ),
          ),
          child: Text(
            isStale ? 'Archived Appointment' : 'Add to Calendar',
            style: const TextStyle(
              fontWeight: FontWeight.w700,
              fontSize: 14,
              letterSpacing: 0.5,
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _generateAndSharePDF(BuildContext context, String timeStr, String dateStr) async {
    final pdf = pw.Document();
    final now = DateTime.now();
    DateTime? dt;
    try {
      dt = DateTime.parse(appointment.scheduledDateTime).toLocal();
    } catch (_) {}

    final status = appointment.status.toLowerCase();
    final isStale = status == 'cancelled' || 
                    status == 'completed' || 
                    (dt != null && dt.isBefore(now));
    
    final timelineStage = isStale ? 'ARCHIVED RECORD' : 'UPCOMING VISIT';

    pdf.addPage(
      pw.Page(
        pageFormat: PdfPageFormat.a4,
        margin: const pw.EdgeInsets.all(50),
        build: (pw.Context pwContext) {
          return pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.start,
            children: [
              // Header
              pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                children: [
                  pw.Text(
                    timelineStage,
                    style: pw.TextStyle(
                      color: isStale ? PdfColors.grey500 : PdfColors.blue700,
                      fontWeight: pw.FontWeight.bold,
                      fontSize: 10,
                      letterSpacing: 1.5,
                    ),
                  ),
                  pw.Text(
                    'ID: ${appointment.appointmentId.substring(0, 8).toUpperCase()}',
                    style: const pw.TextStyle(
                      fontSize: 9,
                      color: PdfColors.grey400,
                    ),
                  ),
                ],
              ),
              pw.SizedBox(height: 12),
              pw.Divider(thickness: 0.5, color: PdfColors.grey200),
              pw.SizedBox(height: 32),

              // Hero
              pw.Text(
                timeStr,
                style: pw.TextStyle(
                  fontSize: 56,
                  fontWeight: pw.FontWeight.normal,
                  color: PdfColors.black,
                  letterSpacing: -2,
                ),
              ),
              pw.SizedBox(height: 4),
              pw.Text(
                dateStr.toUpperCase(),
                style: pw.TextStyle(
                  fontSize: 14,
                  fontWeight: pw.FontWeight.bold,
                  color: PdfColors.black,
                  letterSpacing: 2,
                ),
              ),
              pw.SizedBox(height: 48),

              // Grid
              _buildPDFSection('Current Status', appointment.status.toUpperCase(), null),
              _buildPDFSection('Healthcare Provider', appointment.doctor.fullName, appointment.department),
              _buildPDFSection('Reason for Visit', appointment.reason.isNotEmpty ? appointment.reason : 'General Checkup', null),
              _buildPDFSection('Visit Location', appointment.hospital.name, appointment.hospital.address),
              
              pw.SizedBox(height: 40),
              pw.Divider(thickness: 0.5, color: PdfColors.grey200),
              pw.SizedBox(height: 20),
              pw.Center(
                child: pw.Text(
                  'MEDI LOCKER - DIGITAL HEALTH PASSPORT',
                  style: pw.TextStyle(
                    fontSize: 8, 
                    color: PdfColors.grey500,
                    letterSpacing: 1,
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );

    try {
      final output = await getTemporaryDirectory();
      final file = File("${output.path}/appointment_${appointment.appointmentId.substring(0, 8)}.pdf");
      await file.writeAsBytes(await pdf.save());

      await SharePlus.instance.share(
        ShareParams(
          files: [XFile(file.path)],
          subject: 'Medical Appointment Details - ${appointment.doctor.fullName}',
        ),
      );
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to share: ${e.toString().split('\n').first}')),
        );
      }
    }
  }

  pw.Widget _buildPDFSection(String label, String value, String? subtitle) {
    return pw.Container(
      width: double.infinity,
      padding: const pw.EdgeInsets.symmetric(vertical: 16),
      decoration: const pw.BoxDecoration(
        border: pw.Border(top: pw.BorderSide(color: PdfColors.grey200, width: 0.5)),
      ),
      child: pw.Column(
        crossAxisAlignment: pw.CrossAxisAlignment.start,
        children: [
          pw.Text(
            label.toUpperCase(),
            style: const pw.TextStyle(
              fontSize: 8,
              color: PdfColors.grey500,
              letterSpacing: 1,
            ),
          ),
          pw.SizedBox(height: 4),
          pw.Text(
            value,
            style: pw.TextStyle(
              fontSize: 13,
              fontWeight: pw.FontWeight.bold,
              color: PdfColors.black,
            ),
          ),
          if (subtitle != null) ...[
            pw.SizedBox(height: 2),
            pw.Text(
              subtitle,
              style: const pw.TextStyle(
                fontSize: 10,
                color: PdfColors.grey600,
              ),
            ),
          ],
        ],
      ),
    );
  }
}
