import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/providers/auth_provider.dart';
import '../auth/login_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: const Text(
          'Profile',
          style: TextStyle(color: AppColors.textPrimary),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit, color: AppColors.primary),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Profile Header
            Container(
              color: Colors.white,
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  const CircleAvatar(
                    radius: 50,
                    backgroundColor: AppColors.primary,
                    child: Icon(Icons.person, size: 50, color: Colors.white),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'John Doe',
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Text(
                          'Patient ID: 1234567890',
                          style: TextStyle(
                            color: AppColors.primary,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Icon(
                          Icons.copy,
                          size: 16,
                          color: AppColors.primary,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: AppColors.emergency.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Text(
                      'Blood Group: O+',
                      style: TextStyle(
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
            
            // Personal Information
            _buildSection(
              context,
              title: 'Personal Information',
              children: [
                _buildInfoTile(context, 'Date of Birth', 'Jan 15, 1990'),
                _buildInfoTile(context, 'Gender', 'Male'),
                _buildInfoTile(context, 'Blood Group', 'O+'),
              ],
            ),
            
            // Contact Information
            _buildSection(
              context,
              title: 'Contact Information',
              children: [
                _buildInfoTile(context, 'Phone Number', '+91 9876543210'),
                _buildInfoTile(context, 'Address', '123 Main Street, City, State - 123456'),
              ],
            ),
            
            // Emergency Contacts
            _buildSection(
              context,
              title: 'Emergency Contacts',
              children: [
                _buildInfoTile(context, 'Emergency Contact', 'Jane Doe - +91 9876543211'),
                _buildInfoTile(context, 'Guardian Phone', '+91 9876543212'),
              ],
            ),
            
            // Medical Profile
            _buildSection(
              context,
              title: 'Medical Profile',
              children: [
                _buildExpandableTile(
                  context,
                  title: 'Allergies',
                  items: ['Penicillin (Severe)', 'Peanuts (Moderate)'],
                ),
                _buildExpandableTile(
                  context,
                  title: 'Chronic Conditions',
                  items: ['Hypertension (Since 2018)', 'Diabetes Type 2 (Since 2020)'],
                ),
              ],
            ),
            
            // Settings
            _buildSection(
              context,
              title: 'Settings',
              children: [
                _buildActionTile(context, 'Change Language', Icons.language),
                _buildActionTile(context, 'Notifications', Icons.notifications),
                _buildActionTile(context, 'Privacy & Security', Icons.security),
                _buildActionTile(context, 'Help & Support', Icons.help),
              ],
            ),
            
            // Logout
            Padding(
              padding: const EdgeInsets.all(16),
              child: SizedBox(
                width: double.infinity,
                height: 50,
                child: OutlinedButton(
                  onPressed: () async {
                    await context.read<AuthProvider>().logout();
                    if (context.mounted) {
                      Navigator.pushReplacement(
                        context,
                        MaterialPageRoute(builder: (context) => const LoginScreen()),
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
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
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
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
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
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppColors.textSecondary,
                ),
          ),
          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.right,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
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
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Row(
                  children: [
                    const Icon(Icons.circle, size: 8, color: AppColors.primary),
                    const SizedBox(width: 12),
                    Expanded(child: Text(item)),
                  ],
                ),
              ))
          .toList(),
    );
  }

  Widget _buildActionTile(BuildContext context, String title, IconData icon) {
    return ListTile(
      leading: Icon(icon, color: AppColors.primary),
      title: Text(title),
      trailing: const Icon(Icons.chevron_right, color: AppColors.textSecondary),
      onTap: () {},
    );
  }
}
