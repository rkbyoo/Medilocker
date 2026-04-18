import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:add_2_calendar/add_2_calendar.dart' as calendar;
import 'package:maps_launcher/maps_launcher.dart';
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
        leading: IconButton(
          icon: const Icon(Icons.close, color: AppColors.textPrimary),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  const SizedBox(height: 20),

                  // Status Dot & Label
                  _buildMinimalStatus(),
                  const SizedBox(height: 16),

                  // Time & Date
                  Text(
                    timeStr,
                    style: const TextStyle(
                      fontSize: 42,
                      fontWeight: FontWeight.w900,
                      color: AppColors.textPrimary,
                      letterSpacing: -1,
                    ),
                  ),
                  Text(
                    dateStr,
                    style: TextStyle(
                      fontSize: 16,
                      color: AppColors.textSecondary.withValues(alpha: 0.8),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 48),

                  // Doctor Row
                  _buildMinimalRow(
                    icon: Icons.person_outline_rounded,
                    label: 'Healthcare Provider',
                    value: appointment.doctor.fullName,
                    subValue: appointment.department,
                  ),
                  const Divider(height: 48, thickness: 0.5),

                  // Location Row
                  _buildMinimalRow(
                    icon: Icons.location_on_outlined,
                    label: 'Visit Location',
                    value: appointment.hospital.name,
                    subValue: appointment.hospital.address,
                    onAction: () =>
                        MapsLauncher.launchQuery(appointment.hospital.address),
                    actionIcon: Icons.directions_outlined,
                  ),
                  const Divider(height: 48, thickness: 0.5),

                  // Reason Row
                  _buildMinimalRow(
                    icon: Icons.info_outline_rounded,
                    label: 'Reason for Visit',
                    value: appointment.reason.isNotEmpty
                        ? appointment.reason
                        : 'General Checkup',
                  ),
                ],
              ),
            ),
          ),

          // Fixed Bottom Action
          _buildBottomAction(dt),
        ],
      ),
    );
  }

  Widget _buildMinimalStatus() {
    final status = appointment.status.toLowerCase();
    Color color = AppColors.primary;
    if (status == 'confirmed') color = AppColors.success;
    if (status == 'cancelled') color = AppColors.emergency;

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 8),
        Text(
          appointment.status.toUpperCase(),
          style: TextStyle(
            color: color,
            fontWeight: FontWeight.w800,
            fontSize: 11,
            letterSpacing: 1.2,
          ),
        ),
      ],
    );
  }

  Widget _buildMinimalRow({
    required IconData icon,
    required String label,
    required String value,
    String? subValue,
    VoidCallback? onAction,
    IconData? actionIcon,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, color: AppColors.primary.withValues(alpha: 0.6), size: 24),
        const SizedBox(width: 20),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: const TextStyle(
                  fontSize: 12,
                  color: AppColors.textSecondary,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.5,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                value,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
              if (subValue != null) ...[
                const SizedBox(height: 2),
                Text(
                  subValue,
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
          IconButton(
            onPressed: onAction,
            icon: Icon(actionIcon, color: AppColors.primary),
            visualDensity: VisualDensity.compact,
          ),
      ],
    );
  }

  Widget _buildBottomAction(DateTime? dt) {
    // We'll show the button if it's not cancelled or completed
    // This handles cases where test data dates might be in the past
    final status = appointment.status.toLowerCase();
    final isStale = status == 'cancelled' || status == 'completed';

    if (isStale) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.fromLTRB(24, 0, 24, 40),
      child: SizedBox(
        width: double.infinity,
        height: 60,
        child: ElevatedButton(
          onPressed: () {
            if (dt != null) {
              final calendar.Event event = calendar.Event(
                title: 'Appointment with ${appointment.doctor.fullName}',
                description:
                    'Hospital: ${appointment.hospital.name}\nDepartment: ${appointment.department}',
                location: appointment.hospital.address,
                startDate: dt,
                endDate: dt.add(const Duration(hours: 1)),
              );
              calendar.Add2Calendar.addEvent2Cal(event);
            }
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primary,
            foregroundColor: Colors.white,
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
            ),
          ),
          child: const Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.calendar_month_rounded, size: 20),
              SizedBox(width: 12),
              Text(
                'ADD TO GOOGLE CALENDAR',
                style: TextStyle(
                  fontWeight: FontWeight.w900,
                  letterSpacing: 0.5,
                  fontSize: 13,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
