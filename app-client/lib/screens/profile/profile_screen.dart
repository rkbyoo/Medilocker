import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/providers/patient_provider.dart';
import '../auth/login_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  @override
  void initState() {
    super.initState();
    // Load patient profile if not already loaded
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final pp = context.read<PatientProvider>();
      if (pp.patient == null && !pp.isLoading) {
        pp.fetchProfile();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<PatientProvider>(
      builder: (context, pp, _) {
        final patient = pp.patient;

        return Scaffold(
          backgroundColor: AppColors.background,
          appBar: AppBar(
            backgroundColor: Colors.white,
            elevation: 0,
            title: const Text(
              'Profile',
              style: TextStyle(color: AppColors.textPrimary),
            ),
          ),
          body: pp.isLoading && patient == null
              ? const Center(child: CircularProgressIndicator())
              : SingleChildScrollView(
                  child: Column(
                    children: [
                      // ── Profile Header ───────────────────────────────────
                      Container(
                        color: Colors.white,
                        padding: const EdgeInsets.all(24),
                        child: Column(
                          children: [
                            const CircleAvatar(
                              radius: 50,
                              backgroundColor: AppColors.primary,
                              child: Icon(Icons.person,
                                  size: 50, color: Colors.white),
                            ),
                            const SizedBox(height: 16),
                            Text(
                              patient?.name ?? '—',
                              style: Theme.of(context)
                                  .textTheme
                                  .headlineSmall
                                  ?.copyWith(fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 8),
                            // Patient ID chip – tap to copy
                            GestureDetector(
                              onTap: () {
                                Clipboard.setData(ClipboardData(
                                    text: patient?.patientNumber ?? ''));
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                      content: Text(
                                          'Patient ID copied to clipboard')),
                                );
                              },
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 16, vertical: 8),
                                decoration: BoxDecoration(
                                  color: AppColors.primary.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text(
                                      'Patient ID: ${patient?.patientNumber ?? '—'}',
                                      style: const TextStyle(
                                        color: AppColors.primary,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    const Icon(Icons.copy,
                                        size: 16, color: AppColors.primary),
                                  ],
                                ),
                              ),
                            ),
                            const SizedBox(height: 12),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 16, vertical: 8),
                              decoration: BoxDecoration(
                                color: AppColors.emergency.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(
                                'Blood Group: ${patient?.bloodGroup.isNotEmpty == true ? patient!.bloodGroup : '—'}',
                                style: const TextStyle(
                                  color: AppColors.emergency,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),

                      // ── Personal Information ─────────────────────────────
                      _buildSection(context,
                          title: 'Personal Information',
                          children: [
                            _buildInfoTile(context, 'Date of Birth',
                                patient?.dob.isNotEmpty == true
                                    ? patient!.dob
                                    : '—'),
                            _buildInfoTile(
                                context, 'Gender', patient?.gender ?? '—'),
                            _buildInfoTile(
                                context,
                                'Blood Group',
                                patient?.bloodGroup.isNotEmpty == true
                                    ? patient!.bloodGroup
                                    : '—'),
                            _buildInfoTile(context, 'Marital Status',
                                patient?.maritalStatus ?? '—'),
                            _buildInfoTile(context, 'Nationality',
                                patient?.nationality ?? '—'),
                          ]),

                      // ── Contact Information ──────────────────────────────
                      _buildSection(context,
                          title: 'Contact Information',
                          children: [
                            _buildInfoTile(
                                context,
                                'Phone Number',
                                patient?.phoneNumber.isNotEmpty == true
                                    ? '+91 ${patient!.phoneNumber}'
                                    : '—'),
                            _buildInfoTile(
                                context, 'Address', patient?.address ?? '—'),
                          ]),

                      // ── Emergency Contacts ───────────────────────────────
                      _buildSection(context,
                          title: 'Emergency Contacts',
                          children: [
                            _buildInfoTile(
                              context,
                              'Emergency Contact',
                              patient != null &&
                                      patient.emergencyContactName.isNotEmpty
                                  ? '${patient.emergencyContactName} – ${patient.emergencyContactNumber}'
                                  : '—',
                            ),
                            _buildInfoTile(
                                context,
                                'Guardian Phone',
                                patient?.guardianPhone.isNotEmpty == true
                                    ? patient!.guardianPhone
                                    : '—'),
                          ]),

                      // ── Medical Profile ──────────────────────────────────
                      _buildSection(context,
                          title: 'Medical Profile',
                          children: [
                            _buildExpandableTile(
                              context,
                              title: 'Allergies',
                              items: patient != null &&
                                      patient.allergies.isNotEmpty
                                  ? patient.allergies
                                      .map((a) =>
                                          '${a.allergyName}${a.severity.isNotEmpty ? " (${a.severity})" : ""}')
                                      .toList()
                                  : ['No allergies on record'],
                            ),
                            _buildExpandableTile(
                              context,
                              title: 'Chronic Conditions',
                              items: patient != null &&
                                      patient.chronicConditions.isNotEmpty
                                  ? patient.chronicConditions
                                      .map((c) => c.conditionName)
                                      .toList()
                                  : ['No conditions on record'],
                            ),
                          ]),

                      // ── Settings ─────────────────────────────────────────
                      _buildSection(context,
                          title: 'Settings',
                          children: [
                            _buildActionTile(
                                context, 'Notifications', Icons.notifications),
                            _buildActionTile(
                                context, 'Privacy & Security', Icons.security),
                            _buildActionTile(
                                context, 'Help & Support', Icons.help),
                          ]),

                      // ── Logout ───────────────────────────────────────────
                      Padding(
                        padding: const EdgeInsets.all(16),
                        child: SizedBox(
                          width: double.infinity,
                          height: 50,
                          child: OutlinedButton(
                            onPressed: () async {
                              final patientProvider =
                                  context.read<PatientProvider>();
                              await context
                                  .read<AuthProvider>()
                                  .logout(patientProvider: patientProvider);
                              if (context.mounted) {
                                Navigator.pushReplacement(
                                  context,
                                  MaterialPageRoute(
                                      builder: (context) =>
                                          const LoginScreen()),
                                );
                              }
                            },
                            style: OutlinedButton.styleFrom(
                              foregroundColor: AppColors.error,
                              side: const BorderSide(color: AppColors.error),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            child: const Text(
                              'Logout',
                              style: TextStyle(
                                  fontSize: 16, fontWeight: FontWeight.w600),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
        );
      },
    );
  }

  Widget _buildSection(
    BuildContext context, {
    required String title,
    required List<Widget> children,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      color: Colors.white,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Text(
              title,
              style: Theme.of(context)
                  .textTheme
                  .titleMedium
                  ?.copyWith(fontWeight: FontWeight.bold),
            ),
          ),
          ...children,
        ],
      ),
    );
  }

  Widget _buildInfoTile(BuildContext context, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: Theme.of(context)
                .textTheme
                .bodyMedium
                ?.copyWith(color: AppColors.textSecondary),
          ),
          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.right,
              style: Theme.of(context)
                  .textTheme
                  .bodyMedium
                  ?.copyWith(fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildExpandableTile(
    BuildContext context, {
    required String title,
    required List<String> items,
  }) {
    return ExpansionTile(
      title: Text(title),
      children: items
          .map((item) => Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Row(
                  children: [
                    const Icon(Icons.circle,
                        size: 8, color: AppColors.primary),
                    const SizedBox(width: 12),
                    Expanded(child: Text(item)),
                  ],
                ),
              ))
          .toList(),
    );
  }

  Widget _buildActionTile(
      BuildContext context, String title, IconData icon) {
    return ListTile(
      leading: Icon(icon, color: AppColors.primary),
      title: Text(title),
      trailing:
          const Icon(Icons.chevron_right, color: AppColors.textSecondary),
      onTap: () {},
    );
  }
}
