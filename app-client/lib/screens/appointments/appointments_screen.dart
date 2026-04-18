import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../core/constants/app_colors.dart';
import '../../core/providers/patient_provider.dart';

class AppointmentsScreen extends StatefulWidget {
  const AppointmentsScreen({super.key});

  @override
  State<AppointmentsScreen> createState() => _AppointmentsScreenState();
}

class _AppointmentsScreenState extends State<AppointmentsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        context.read<PatientProvider>().fetchAppointments();
      }
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: const Text(
          'Appointments',
          style: TextStyle(color: AppColors.textPrimary),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.add, color: AppColors.primary),
            onPressed: () {},
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.primary,
          unselectedLabelColor: AppColors.textSecondary,
          indicatorColor: AppColors.primary,
          tabs: const [
            Tab(text: 'Upcoming'),
            Tab(text: 'Past'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildUpcomingTab(),
          _buildPastTab(),
        ],
      ),
    );
  }

  Widget _buildUpcomingTab() {
    return Consumer<PatientProvider>(
      builder: (context, provider, child) {
        final now = DateTime.now();
        final upcomingAppts = provider.appointments.where((a) {
          if (a.scheduledDateTime.isEmpty) return false;
          if (a.status.toLowerCase() == 'completed' || a.status.toLowerCase() == 'cancelled') return false;
          try {
            return DateTime.parse(a.scheduledDateTime).toLocal().isAfter(now);
          } catch (_) {
            return false;
          }
        }).toList()
          ..sort((a, b) => a.scheduledDateTime.compareTo(b.scheduledDateTime));

        if (upcomingAppts.isEmpty) {
          return const Center(child: Text("No upcoming appointments found"));
        }

        return ListView.builder(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
          itemCount: upcomingAppts.length,
          itemBuilder: (context, index) {
            final appt = upcomingAppts[index];
            DateTime dt = DateTime.parse(appt.scheduledDateTime).toLocal();
            final timeStr = DateFormat('MMM dd, yyyy - hh:mm a').format(dt);

            return _buildAppointmentCard(
              context,
              doctorName: appt.doctor.fullName.isNotEmpty ? appt.doctor.fullName : 'Unknown Doctor',
              department: appt.department,
              hospital: appt.hospital.name,
              dateTime: timeStr,
              status: appt.status.toUpperCase(),
              statusColor: AppColors.success,
            );
          },
        );
      },
    );
  }

  Widget _buildPastTab() {
    return Consumer<PatientProvider>(
      builder: (context, provider, child) {
        final now = DateTime.now();
        final pastAppts = provider.appointments.where((a) {
          if (a.scheduledDateTime.isEmpty) return false;
          // Completed or cancelled are always past, otherwise check timer
          if (a.status.toLowerCase() == 'completed' || a.status.toLowerCase() == 'cancelled') return true;
          try {
            return DateTime.parse(a.scheduledDateTime).toLocal().isBefore(now);
          } catch (_) {
            return false;
          }
        }).toList()
          ..sort((a, b) => b.scheduledDateTime.compareTo(a.scheduledDateTime));

        if (pastAppts.isEmpty) {
          return const Center(child: Text("No past appointments found"));
        }

        return ListView.builder(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
          itemCount: pastAppts.length,
          itemBuilder: (context, index) {
            final appt = pastAppts[index];
            DateTime dt = DateTime.parse(appt.scheduledDateTime).toLocal();
            final timeStr = DateFormat('MMM dd, yyyy - hh:mm a').format(dt);

            return _buildAppointmentCard(
              context,
              doctorName: appt.doctor.fullName.isNotEmpty ? appt.doctor.fullName : 'Unknown Doctor',
              department: appt.department,
              hospital: appt.hospital.name,
              dateTime: timeStr,
              status: appt.status.toUpperCase(),
              statusColor: AppColors.textSecondary,
            );
          },
        );
      },
    );
  }

  Widget _buildAppointmentCard(
    BuildContext context, {
    required String doctorName,
    required String department,
    required String hospital,
    required String dateTime,
    required String status,
    required Color statusColor,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
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
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: statusColor.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  status,
                  style: TextStyle(
                    color: statusColor,
                    fontWeight: FontWeight.w600,
                    fontSize: 12,
                  ),
                ),
              ),
              Text(
                dateTime,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: AppColors.textSecondary,
                    ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            doctorName,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
          ),
          const SizedBox(height: 4),
          Text(
            '$department • $hospital',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppColors.textSecondary,
                ),
          ),
        ],
      ),
    );
  }
}
