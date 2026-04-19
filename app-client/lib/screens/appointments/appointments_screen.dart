import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../core/constants/app_colors.dart';
import '../../core/providers/patient_provider.dart';
import '../../core/models/appointment.dart';
import 'appointment_detail_screen.dart';

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
        final pp = context.read<PatientProvider>();
        // Fetch only if empty — MainScreen already loads on boot.
        // forceRefresh=false means cache/TTL logic in provider applies.
        if (pp.appointments.isEmpty) {
          pp.fetchAppointments();
        }
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
        title: const Text('My Appointments', style: TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold)),
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.primary,
          unselectedLabelColor: AppColors.textSecondary,
          indicatorColor: AppColors.primary,
          indicatorWeight: 3,
          indicatorSize: TabBarIndicatorSize.label,
          labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
          tabs: const [
            Tab(text: 'Upcoming'),
            Tab(text: 'History'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildAppointmentList(isUpcoming: true),
          _buildAppointmentList(isUpcoming: false),
        ],
      ),
    );
  }

  Widget _buildAppointmentList({required bool isUpcoming}) {
    return Consumer<PatientProvider>(
      builder: (context, provider, child) {
        // Show spinner only on initial load (no data yet)
        if (provider.isLoadingAppointments && provider.appointments.isEmpty) {
          return const Center(child: CircularProgressIndicator());
        }

        final now = DateTime.now();
        var appointments = provider.appointments.where((a) {
          if (a.scheduledDateTime.isEmpty) return false;
          DateTime? dt;
          try { dt = DateTime.parse(a.scheduledDateTime).toLocal(); } catch (_) { return false; }
          final isPast = a.status.toLowerCase() == 'completed' ||
                        a.status.toLowerCase() == 'cancelled' ||
                        dt.isBefore(now);
          return isUpcoming ? !isPast : isPast;
        }).toList();

        if (isUpcoming) {
          appointments.sort((a, b) => a.scheduledDateTime.compareTo(b.scheduledDateTime));
        } else {
          appointments.sort((a, b) => b.scheduledDateTime.compareTo(a.scheduledDateTime));
        }

        if (appointments.isEmpty) {
          return RefreshIndicator(
            onRefresh: () => provider.fetchAppointments(forceRefresh: true),
            child: ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              children: [
                SizedBox(
                  height: 400,
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.event_busy_rounded, size: 64, color: Colors.grey.shade300),
                        const SizedBox(height: 16),
                        Text(
                          isUpcoming ? "No upcoming appointments" : "No past appointments",
                          style: TextStyle(color: Colors.grey.shade500, fontSize: 16),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          );
        }

        return RefreshIndicator(
          onRefresh: () => provider.fetchAppointments(forceRefresh: true),
          child: ListView.builder(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
            itemCount: appointments.length,
            itemBuilder: (context, index) {
              final appt = appointments[index];
              return _buildAppointmentTicket(context, appt);
            },
          ),
        );
      },
    );
  }

  Widget _buildAppointmentTicket(BuildContext context, Appointment appt) {
    DateTime? dt;
    try {
      dt = DateTime.parse(appt.scheduledDateTime).toLocal();
    } catch (_) {}

    final dateDay = dt != null ? DateFormat('dd').format(dt) : '--';
    final dateMonth = dt != null ? DateFormat('MMM').format(dt).toUpperCase() : '---';
    final timeStr = dt != null ? DateFormat('hh:mm a').format(dt) : 'TBD';

    return GestureDetector(
      onTap: () => Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => AppointmentDetailScreen(appointment: appt)),
      ),
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: IntrinsicHeight(
          child: Row(
            children: [
              // Ticket Left Side (Date)
              Container(
                width: 80,
                padding: const EdgeInsets.symmetric(vertical: 20),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.05),
                  borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(16),
                    bottomLeft: Radius.circular(16),
                  ),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      dateMonth,
                      style: const TextStyle(
                        color: AppColors.primary,
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                    Text(
                      dateDay,
                      style: const TextStyle(
                        color: AppColors.primary,
                        fontWeight: FontWeight.w800,
                        fontSize: 24,
                      ),
                    ),
                  ],
                ),
              ),
              // Ticket Divider
              const VerticalDivider(width: 1, thickness: 1, color: AppColors.background),
              // Ticket Right Side (Details)
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            timeStr,
                            style: const TextStyle(
                              color: AppColors.textPrimary,
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                          ),
                          _buildMiniBadge(appt.status),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        appt.doctor.fullName.isNotEmpty ? appt.doctor.fullName : 'Checkup',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${appt.department} • ${appt.hospital.name}',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: AppColors.textSecondary,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMiniBadge(String status) {
    status = status.toLowerCase();
    Color color = AppColors.primary;
    if (status == 'confirmed') color = AppColors.success;
    if (status == 'cancelled') color = AppColors.emergency;
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        status.toUpperCase(),
        style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 9),
      ),
    );
  }
}
