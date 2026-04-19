import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/providers/patient_provider.dart';
import 'dashboard_screen.dart';
import '../appointments/appointments_screen.dart';
import '../emergency/emergency_screen.dart';
import '../records/records_screen.dart';
import '../profile/profile_screen.dart';

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    const DashboardScreen(),
    const AppointmentsScreen(),
    const EmergencyScreen(),
    const RecordsScreen(),
    const ProfileScreen(),
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      // Fire all 4 fetches in parallel — fastest possible cold start
      context.read<PatientProvider>().fetchAll();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBody: false, 
      body: _screens[_currentIndex],
      bottomNavigationBar: SafeArea(
        child: Container(
          height: 64,
          margin: const EdgeInsets.fromLTRB(24, 0, 24, 16),
          padding: const EdgeInsets.symmetric(horizontal: 12),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(32),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.08),
                blurRadius: 20,
                offset: const Offset(0, 10),
              ),
            ],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildNavItem(0, Icons.grid_view_rounded, 'Home'),
              _buildNavItem(1, Icons.event_note_rounded, 'Schedule'),
              _buildNavItem(2, Icons.medical_services_rounded, 'SOS', isEmergency: true),
              _buildNavItem(3, Icons.description_rounded, 'Records'),
              _buildNavItem(4, Icons.person_rounded, 'Profile'),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(int index, IconData icon, String label, {bool isEmergency = false}) {
    final isSelected = _currentIndex == index;
    final baseColor = isEmergency ? AppColors.emergency : AppColors.primary;
    
    // Sophisticated selection color: Subtle Indigo for standard, Red for emergency
    final highlightColor = isEmergency 
        ? AppColors.emergency.withValues(alpha: 0.1)
        : AppColors.primary.withValues(alpha: 0.08);

    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _currentIndex = index),
        behavior: HitTestBehavior.opaque,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              curve: Curves.easeOutCubic,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isSelected ? highlightColor : Colors.transparent,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Icon(
                icon,
                color: isSelected ? baseColor : AppColors.textSecondary.withValues(alpha: 0.75),
                size: 24,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
