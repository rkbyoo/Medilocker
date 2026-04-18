import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/constants/app_colors.dart';
import '../../core/providers/patient_provider.dart';

class EmergencyScreen extends StatelessWidget {
  const EmergencyScreen({super.key});

  Future<void> _makePhoneCall(String phoneNumber) async {
    final Uri launchUri = Uri(
      scheme: 'tel',
      path: phoneNumber,
    );
    if (await canLaunchUrl(launchUri)) {
      await launchUrl(launchUri);
    } else {
      debugPrint('Could not launch $launchUri');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.emergency,
        elevation: 0,
        title: const Text(
          'Emergency',
          style: TextStyle(color: Colors.white),
        ),
      ),
      body: Consumer<PatientProvider>(
        builder: (context, provider, child) {
          final patient = provider.patient;
          if (patient == null) {
            return const Center(child: CircularProgressIndicator());
          }

          // Try to get hospital from the latest appointment or visit
          String hospitalName = 'Unknown Hospital';
          String hospitalAddress = 'No address on file';
          String hospitalPhone = '';

          if (provider.appointments.isNotEmpty) {
            final appt = provider.appointments.first;
            hospitalName = appt.hospital.name;
            hospitalAddress = appt.hospital.address;
            hospitalPhone = appt.hospital.contactNumber;
          } else if (provider.visits.isNotEmpty) {
            final visit = provider.visits.first;
            hospitalName = visit.hospital.name;
            hospitalAddress = visit.hospital.address;
            hospitalPhone = visit.hospital.contactNumber;
          }

          final emergencyContact = patient.emergencyContactNumber.isNotEmpty ? patient.emergencyContactNumber : hospitalPhone;
          final emergencyName = patient.emergencyContactName.isNotEmpty ? patient.emergencyContactName : 'Emergency Contact';

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                // Emergency Call Button
                Container(
                  width: double.infinity,
                  height: 200,
                  decoration: BoxDecoration(
                    color: AppColors.emergency,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.emergency.withValues(alpha: 0.3),
                        blurRadius: 20,
                        offset: const Offset(0, 10),
                      ),
                    ],
                  ),
                  child: Material(
                    color: Colors.transparent,
                    child: InkWell(
                      onTap: () {
                        if (emergencyContact.isNotEmpty) {
                          _makePhoneCall(emergencyContact);
                        } else if (hospitalPhone.isNotEmpty) {
                          _makePhoneCall(hospitalPhone);
                        } else {
                          // Default 911 if no records found
                          _makePhoneCall('911');
                        }
                      },
                      borderRadius: BorderRadius.circular(16),
                      child: const Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.phone,
                            size: 64,
                            color: Colors.white,
                          ),
                          SizedBox(height: 16),
                          Text(
                            'Call Emergency',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          SizedBox(height: 8),
                          Text(
                            'Tap to call',
                            style: TextStyle(
                              color: Colors.white70,
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                
                // Medical ID Card
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.05),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      Text(
                        'Medical ID Card',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                      const SizedBox(height: 16),
                      QrImageView(
                        data: patient.patientNumber,
                        version: QrVersions.auto,
                        size: 200,
                      ),
                      const SizedBox(height: 16),
                      _buildInfoRow(context, 'Name', patient.name),
                      _buildInfoRow(context, 'Patient Number', patient.patientNumber),
                      _buildInfoRow(context, 'Blood Group', patient.bloodGroup.isNotEmpty ? patient.bloodGroup : 'Unknown', isHighlight: true),
                      _buildInfoRow(context, 'Emergency Contact', emergencyContact.isNotEmpty ? emergencyContact : 'Not set'),
                      const SizedBox(height: 16),
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.warning.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Text(
                          'Show this to medical personnel in case of emergency',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: AppColors.warning,
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                
                // Hospital Info
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Hospital Information',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                      const SizedBox(height: 16),
                      _buildContactRow(
                        context,
                        icon: Icons.location_on,
                        title: hospitalName,
                        subtitle: hospitalAddress.isNotEmpty ? hospitalAddress : 'No Address',
                        onTap: null,
                      ),
                      const SizedBox(height: 12),
                      _buildContactRow(
                        context,
                        icon: Icons.phone,
                        title: emergencyName,
                        subtitle: emergencyContact.isNotEmpty ? emergencyContact : 'No Emergency Contact',
                        onTap: emergencyContact.isNotEmpty ? () => _makePhoneCall(emergencyContact) : null,
                      ),
                      const SizedBox(height: 12),
                      if (hospitalPhone.isNotEmpty)
                        _buildContactRow(
                          context,
                          icon: Icons.phone,
                          title: 'Hospital Reception',
                          subtitle: hospitalPhone,
                          onTap: () => _makePhoneCall(hospitalPhone),
                        ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildInfoRow(BuildContext context, String label, String value,
      {bool isHighlight = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppColors.textSecondary,
                ),
          ),
          Text(
            value,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: isHighlight ? AppColors.emergency : AppColors.textPrimary,
                ),
          ),
        ],
      ),
    );
  }

  Widget _buildContactRow(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    VoidCallback? onTap,
  }) {
    return InkWell(
      onTap: onTap,
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: AppColors.primary),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                ),
                Text(
                  subtitle,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppColors.textSecondary,
                      ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
