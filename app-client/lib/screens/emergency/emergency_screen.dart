import 'dart:math';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/constants/app_colors.dart';
import '../../core/providers/patient_provider.dart';

class EmergencyScreen extends StatefulWidget {
  const EmergencyScreen({super.key});

  @override
  State<EmergencyScreen> createState() => _EmergencyScreenState();
}

class _EmergencyScreenState extends State<EmergencyScreen> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  bool _isFront = true;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        final pp = context.read<PatientProvider>();
        // Ensure we have appointment data for the hospital contact section
        if (pp.appointments.isEmpty) pp.fetchAppointments();
        // Ensure profile is loaded for the card
        if (pp.patient == null) pp.fetchProfile();
      }
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _flipCard() {
    if (_isFront) {
      _controller.forward();
    } else {
      _controller.reverse();
    }
    setState(() {
      _isFront = !_isFront;
    });
  }

  Future<void> _makePhoneCall(String phoneNumber) async {
    final Uri launchUri = Uri(scheme: 'tel', path: phoneNumber);
    if (await canLaunchUrl(launchUri)) {
      await launchUrl(launchUri);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        title: const Text(
          'EMERGENCY ID',
          style: TextStyle(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w900,
            fontSize: 14,
            letterSpacing: 2,
          ),
        ),
      ),
      body: Consumer<PatientProvider>(
        builder: (context, provider, child) {
          final patient = provider.patient;
          if (patient == null) {
            return const Center(child: CircularProgressIndicator());
          }

          final emergencyContact = patient.emergencyContactNumber.isNotEmpty
              ? patient.emergencyContactNumber
              : '';
          final emergencyName = patient.emergencyContactName.isNotEmpty
              ? patient.emergencyContactName
              : 'Emergency Contact';

          return RefreshIndicator(
            onRefresh: () => provider.fetchAll(forceRefresh: true),
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              child: Column(
                children: [
                  const SizedBox(height: 40),

                  // Flippable Card
                  Center(
                    child: GestureDetector(
                      onHorizontalDragEnd: (details) {
                        if (details.primaryVelocity!.abs() > 100) {
                          _flipCard();
                        }
                      },
                      onTap: _flipCard,
                      child: AnimatedBuilder(
                        animation: _controller,
                        builder: (context, child) {
                          double angle = _controller.value * pi;
                          bool isBack = angle > pi / 2;
                          return Transform(
                            transform: Matrix4.identity()
                              ..setEntry(3, 2, 0.0015)
                              ..rotateY(angle),
                            alignment: Alignment.center,
                            child: isBack
                                ? Transform(
                                    transform: Matrix4.identity()..rotateY(pi),
                                    alignment: Alignment.center,
                                    child: _buildCardBack(patient),
                                  )
                                : _buildCardFront(patient, emergencyName, emergencyContact),
                          );
                        },
                      ),
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Interaction Guide
                  const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 40),
                    child: Column(
                      children: [
                        Icon(Icons.swipe_outlined, color: AppColors.textSecondary, size: 24),
                        SizedBox(height: 8),
                        Text(
                          'SWIPE OR TAP TO REVEAL MEDICAL DETAILS',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            color: AppColors.textSecondary,
                            letterSpacing: 1.5,
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 60),

                  // Critical Actions Section
                  _buildActionSection(
                    'Primary Emergency Contact',
                    emergencyName,
                    subtitle: emergencyContact,
                    onCall: () => _makePhoneCall(emergencyContact),
                  ),

                  if (provider.appointments.isNotEmpty)
                    _buildActionSection(
                      'Recent Healthcare Hub',
                      provider.appointments.first.hospital.name,
                      subtitle: provider.appointments.first.hospital.contactNumber,
                      onCall: () => _makePhoneCall(
                          provider.appointments.first.hospital.contactNumber),
                    ),

                  const SizedBox(height: 40),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildCardFront(dynamic patient, String contactName, String contactPhone) {
    return Container(
      width: 330,
      height: 200,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppColors.textPrimary,
            AppColors.textPrimary.withValues(alpha: 0.85),
          ],
        ),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withValues(alpha: 0.1), width: 1),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.3),
            blurRadius: 30,
            offset: const Offset(0, 15),
          ),
        ],
      ),
      child: Stack(
        children: [
          Positioned(
            top: 24,
            right: 24,
            child: Icon(Icons.nfc_rounded, color: Colors.white.withValues(alpha: 0.3), size: 28),
          ),
          Padding(
            padding: const EdgeInsets.all(28),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top: Name
                Text(
                  patient.name.toUpperCase(),
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 26,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 0.5,
                  ),
                ),
                const SizedBox(height: 12),
                
                // Middle: Patient ID
                Row(
                  children: [
                    Text(
                      'PATIENT ID  ',
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.4),
                        fontSize: 8,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 1,
                      ),
                    ),
                    Text(
                      patient.patientNumber.toUpperCase(),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 1.2,
                      ),
                    ),
                  ],
                ),

                const Spacer(),
                
                // Bottom: EMG Contact
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'EMG. CONTACT',
                          style: TextStyle(
                            color: Colors.white.withValues(alpha: 0.4),
                            fontSize: 8,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 1,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          contactPhone,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ],
                    ),
                    GestureDetector(
                      onTap: () => _makePhoneCall(contactPhone),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        decoration: BoxDecoration(
                          color: AppColors.emergency,
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.emergency.withValues(alpha: 0.3),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.call, color: Colors.white, size: 14),
                            SizedBox(width: 6),
                            Text(
                              'CALL',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 10,
                                fontWeight: FontWeight.w900,
                                letterSpacing: 0.5,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCardBack(dynamic patient) {
    // Generate medical notes from real data
    String allergies = patient.allergies.isEmpty 
        ? 'NO KNOWN ALLERGIES' 
        : patient.allergies.map((a) => a.allergyName.toUpperCase()).join(', ');
    
    String conditions = patient.chronicConditions.isEmpty 
        ? 'NONE RECORDED' 
        : patient.chronicConditions.map((c) => c.conditionName.toUpperCase()).join(', ');

    return Container(
      width: 330,
      height: 200,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.textPrimary, width: 1.5),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 30,
            offset: const Offset(0, 15),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Row(
          children: [
            Expanded(
              flex: 3,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildBackInfo('BLOOD GROUP', patient.bloodGroup.isNotEmpty ? patient.bloodGroup : 'N/A', isImportant: true),
                  const SizedBox(height: 12),
                  _buildBackInfo('ALLERGIES', allergies, isSmall: true),
                  const SizedBox(height: 8),
                  _buildBackInfo('CHRONIC CONDITIONS', conditions, isSmall: true),
                  const Spacer(),
                  Text(
                    'SCAN FOR RECORDS',
                    style: TextStyle(
                      fontSize: 8,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textSecondary.withValues(alpha: 0.5),
                      letterSpacing: 1,
                    ),
                  ),
                ],
              ),
            ),
            const VerticalDivider(width: 32, thickness: 0.5),
            Expanded(
              flex: 2,
              child: Center(
                child: QrImageView(
                  data: patient.patientNumber,
                  version: QrVersions.auto,
                  size: 100,
                  eyeStyle: const QrEyeStyle(eyeShape: QrEyeShape.square, color: AppColors.textPrimary),
                  dataModuleStyle: const QrDataModuleStyle(dataModuleShape: QrDataModuleShape.square, color: AppColors.textPrimary),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBackInfo(String label, String value, {bool isImportant = false, bool isSmall = false}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 8,
            fontWeight: FontWeight.w700,
            color: AppColors.textSecondary.withValues(alpha: 0.7),
            letterSpacing: 1,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          value,
          style: TextStyle(
            fontSize: isSmall ? 10 : 18,
            fontWeight: isImportant ? FontWeight.w900 : FontWeight.w600,
            color: isImportant ? AppColors.emergency : AppColors.textPrimary,
          ),
        ),
      ],
    );
  }

  Widget _buildActionSection(String label, String title, {required String subtitle, required VoidCallback onCall}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 24),
      decoration: BoxDecoration(
        border: Border(top: BorderSide(color: AppColors.divider.withValues(alpha: 0.5), width: 0.5)),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label.toUpperCase(),
                  style: TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textSecondary.withValues(alpha: 0.6),
                    letterSpacing: 1.2,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
                Text(
                  subtitle,
                  style: const TextStyle(
                    fontSize: 14,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          GestureDetector(
            onTap: onCall,
            child: Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.04),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.phone_rounded, 
                color: AppColors.primary, 
                size: 20
              ),
            ),
          ),
        ],
      ),
    );
  }
}
