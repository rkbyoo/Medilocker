import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_strings.dart';
import '../../core/providers/auth_provider.dart';
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
      final authProvider = context.read<AuthProvider>();
      final patientProvider = context.read<PatientProvider>();
      
      // If in demo mode, load demo data
      if (authProvider.isDemoMode) {
        patientProvider.setDemoMode(true);
      } else {
        // Load real data from API
        patientProvider.fetchProfile();
        patientProvider.fetchAppointments();
        patientProvider.fetchVisits();
        patientProvider.fetchBills();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        type: BottomNavigationBarType.fixed,
        selectedItemColor: AppColors.primary,
        unselectedItemColor: AppColors.textSecondary,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: AppStrings.home,
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.calendar_today),
            label: AppStrings.appointments,
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.emergency, size: 32),
            label: AppStrings.emergency,
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.folder_open),
            label: AppStrings.records,
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: AppStrings.profile,
          ),
        ],
      ),
    );
  }
}
