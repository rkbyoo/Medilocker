import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/providers/patient_provider.dart';
import '../../main.dart';
import '../../core/widgets/custom_notification.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        // Fetch profile using standard cache TTL (no force check on tab switch)
        context.read<PatientProvider>().fetchProfile();
      }
    });
  }

  void _showNotificationSettings() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) => SettingsDetailSheet(
        title: 'NOTIFICATIONS',
        items: [
          SettingToggle(title: 'Appointment Reminders', initialValue: true),
          SettingToggle(title: 'Prescription Alerts', initialValue: true),
          SettingToggle(title: 'Lab Report Notifications', initialValue: false),
          SettingToggle(title: 'Emergency Alerts', initialValue: true),
        ],
      ),
    );
  }

  void _showPrivacySettings() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) => SettingsDetailSheet(
        title: 'PRIVACY & SECURITY',
        items: [
          SettingNavigation(
            title: 'Manage Health Data Privacy',
            icon: Icons.lock_outline,
          ),
          SettingNavigation(
            title: 'Two-Factor Authentication',
            icon: Icons.phonelink_lock_rounded,
          ),
          SettingNavigation(
            title: 'Active Sessions',
            icon: Icons.devices_other_rounded,
          ),
          SettingNavigation(
            title: 'Delete My Data',
            icon: Icons.delete_outline,
            isDestructive: true,
          ),
        ],
      ),
    );
  }

  void _showHelpSupport() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) => SettingsDetailSheet(
        title: 'HELP & SUPPORT',
        items: [
          SettingNavigation(
            title: 'Contact Medical Support',
            icon: Icons.support_agent_rounded,
          ),
          SettingNavigation(
            title: 'FAQs',
            icon: Icons.question_answer_outlined,
          ),
          SettingNavigation(
            title: 'App Feedback',
            icon: Icons.rate_review_outlined,
          ),
          SettingNavigation(
            title: 'Terms of Service',
            icon: Icons.description_outlined,
          ),
        ],
      ),
    );
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
            centerTitle: true,
            title: Text(
              'Profile',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
          ),
          body: pp.isLoading && patient == null
              ? const Center(child: CircularProgressIndicator())
              : RefreshIndicator(
                  onRefresh: () async {
                    await context.read<PatientProvider>().fetchProfile(forceRefresh: true);
                  },
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 24,
                      vertical: 20,
                    ),
                    child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Center(
                        child: Column(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(4),
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: AppColors.textPrimary,
                                  width: 1.5,
                                ),
                              ),
                              child: CircleAvatar(
                                radius: 52,
                                backgroundColor: const Color(0xFFF8FAFC),
                                child: Text(
                                  patient?.name.isNotEmpty == true
                                      ? patient!.name[0].toUpperCase()
                                      : '?',
                                  style: const TextStyle(
                                    fontSize: 32,
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.textPrimary,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(height: 16),
                            Text(
                              patient?.name ?? '—',
                              textAlign: TextAlign.center,
                              style: const TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                                letterSpacing: -0.5,
                              ),
                            ),
                            const SizedBox(height: 8),
                            GestureDetector(
                              onTap: () {
                                Clipboard.setData(
                                  ClipboardData(
                                    text: patient?.patientNumber ?? '',
                                  ),
                                );
                                CustomNotification.show(context, 'Patient ID copied to clipboard');
                              },
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 14,
                                  vertical: 6,
                                ),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFF1F5F9),
                                  borderRadius: BorderRadius.circular(30),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text(
                                      'ID: ${patient?.patientNumber ?? '—'}',
                                      style: const TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w600,
                                        color: AppColors.textSecondary,
                                      ),
                                    ),
                                    const SizedBox(width: 6),
                                    const Icon(
                                      Icons.copy_rounded,
                                      size: 10,
                                      color: AppColors.textSecondary,
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 48),

                      Row(
                        children: [
                          _buildVitalTag(
                            'BLOOD GROUP',
                            patient?.bloodGroup ?? '—',
                          ),
                          const SizedBox(width: 12),
                          _buildVitalTag(
                            'NATIONALITY',
                            patient?.nationality ?? '—',
                          ),
                        ],
                      ),
                      const SizedBox(height: 40),

                      _buildSectionTitle('HEALTH STATUS'),
                      const SizedBox(height: 16),
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.03),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Column(
                          children: [
                            _buildMedicalSection(
                              'ALLERGIES',
                              patient?.allergies
                                      .map(
                                        (a) =>
                                            '${a.allergyName}${a.severity.isNotEmpty ? " (${a.severity})" : ""}',
                                      )
                                      .toList() ??
                                  [],
                            ),
                            const SizedBox(height: 24),
                            _buildMedicalSection(
                              'CHRONIC CONDITIONS',
                              patient?.chronicConditions
                                      .map((c) => c.conditionName)
                                      .toList() ??
                                  [],
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 48),

                      _buildSectionTitle('PERSONAL RECORDS'),
                      const SizedBox(height: 16),
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.03),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Column(
                          children: [
                            _buildInfoRow('BIRTH DATE', patient?.dob ?? '—'),
                            const Divider(height: 1, color: AppColors.divider),
                            _buildInfoRow('GENDER', patient?.gender ?? '—'),
                            const Divider(height: 1, color: AppColors.divider),
                            _buildInfoRow(
                              'MARITAL STATUS',
                              patient?.maritalStatus ?? '—',
                            ),
                            const Divider(height: 1, color: AppColors.divider),
                            _buildInfoRow('LOCATION', patient?.address ?? '—'),
                            const Divider(height: 1, color: AppColors.divider),
                            _buildInfoRow(
                              'EMERGENCY CONTACT',
                              patient != null
                                  ? '${patient.emergencyContactName} • ${patient.emergencyContactNumber}'
                                  : '—',
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 48),

                      _buildSectionTitle('PREFERENCES'),
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 4),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.03),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Column(
                          children: [
                            _buildSettingItem(
                              'NOTIFICATIONS',
                              Icons.notifications_active_outlined,
                              _showNotificationSettings,
                            ),
                            const Divider(height: 1, color: AppColors.divider, indent: 56),
                            _buildSettingItem(
                              'PRIVACY & SECURITY',
                              Icons.health_and_safety_outlined,
                              _showPrivacySettings,
                            ),
                            const Divider(height: 1, color: AppColors.divider, indent: 56),
                            _buildSettingItem(
                              'HELP & SUPPORT',
                              Icons.help_center_outlined,
                              _showHelpSupport,
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 60),

                      Center(
                        child: TextButton.icon(
                          onPressed: () async {
                            final patientProvider = context
                                .read<PatientProvider>();
                            await context.read<AuthProvider>().logout(
                              patientProvider: patientProvider,
                            );
                            if (context.mounted) {
                              Navigator.pushAndRemoveUntil(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => const AuthWrapper(),
                                ),
                                (route) => false,
                              );
                            }
                          },
                          icon: const Icon(Icons.logout_rounded, color: Color(0xFFEF4444), size: 18),
                          label: const Text(
                            'Sign Out of Account',
                            style: TextStyle(
                              color: Color(0xFFEF4444),
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                          ),
                          style: TextButton.styleFrom(
                            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                              side: BorderSide(color: const Color(0xFFEF4444).withValues(alpha: 0.1)),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 40),
                    ],
                  ),
                ),
                ),
        );
      },
    );
  }

  Widget _buildVitalTag(String label, String value) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: AppColors.textSecondary.withValues(alpha: 0.7),
                letterSpacing: 0.2,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              value,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: Theme.of(context).textTheme.titleSmall?.copyWith(
        fontWeight: FontWeight.bold,
        color: AppColors.textPrimary,
        letterSpacing: 0.5,
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 14),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: AppColors.textSecondary.withValues(alpha: 0.8),
            ),
          ),
          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.right,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMedicalSection(String title, List<String> items) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.w600,
            color: AppColors.textSecondary.withValues(alpha: 0.7),
            letterSpacing: 0.2,
          ),
        ),
        const SizedBox(height: 12),
        if (items.isEmpty || items.every((i) => i.contains('No ')))
          const Text(
            'Not Specified',
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: Color(0xFFCBD5E1),
            ),
          )
        else
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: items
                .map(
                  (item) => Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      border: Border.all(
                        color: AppColors.textPrimary.withValues(alpha: 0.1),
                      ),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      item,
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary,
                      ),
                    ),
                  ),
                )
                .toList(),
          ),
      ],
    );
  }

  Widget _buildSettingItem(String title, IconData icon, VoidCallback onTap) {
    return ListTile(
      onTap: onTap,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 2),
      leading: Icon(icon, size: 22, color: AppColors.textPrimary.withValues(alpha: 0.7)),
      title: Text(
        title,
        style: const TextStyle(
          fontSize: 15,
          fontWeight: FontWeight.w600,
          color: AppColors.textPrimary,
        ),
      ),
      trailing: const Icon(
        Icons.chevron_right_rounded,
        size: 20,
        color: Color(0xFFCBD5E1),
      ),
    );
  }
}

class SettingsDetailSheet extends StatelessWidget {
  final String title;
  final List<Widget> items;

  const SettingsDetailSheet({
    super.key,
    required this.title,
    required this.items,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(32),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 24),
          ...items,
          const SizedBox(height: 20),
        ],
      ),
    );
  }
}

class SettingToggle extends StatefulWidget {
  final String title;
  final bool initialValue;
  const SettingToggle({
    super.key,
    required this.title,
    required this.initialValue,
  });

  @override
  State<SettingToggle> createState() => _SettingToggleState();
}

class _SettingToggleState extends State<SettingToggle> {
  late bool _value;
  @override
  void initState() {
    super.initState();
    _value = widget.initialValue;
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            widget.title,
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
          ),
          Switch(
            value: _value,
            activeThumbColor: AppColors.textPrimary,
            activeTrackColor: AppColors.textPrimary.withValues(alpha: 0.2),
            onChanged: (v) => setState(() => _value = v),
          ),
        ],
      ),
    );
  }
}

class SettingNavigation extends StatelessWidget {
  final String title;
  final IconData icon;
  final bool isDestructive;
  const SettingNavigation({
    super.key,
    required this.title,
    required this.icon,
    this.isDestructive = false,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: Icon(
        icon,
        color: isDestructive ? Colors.red : AppColors.textPrimary,
      ),
      title: Text(
        title,
        style: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w700,
          color: isDestructive ? Colors.red : AppColors.textPrimary,
        ),
      ),
      trailing: const Icon(Icons.chevron_right_rounded),
      onTap: () {
        Navigator.pop(context);
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Navigating to $title...')));
      },
    );
  }
}
