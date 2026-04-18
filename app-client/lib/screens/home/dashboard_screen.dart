import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/providers/patient_provider.dart';
import 'package:intl/intl.dart';
import '../appointments/appointments_screen.dart';
import '../records/records_screen.dart';
import '../bills/bills_screen.dart';
import '../emergency/emergency_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final pp = context.read<PatientProvider>();
      if (pp.patient == null && !pp.isLoading) {
        pp.fetchProfile().then((_) {
          if (pp.patient != null) {
            pp.fetchAppointments();
            pp.fetchVisits();
            pp.fetchBills();
          }
        });
      } else if (pp.patient != null && !pp.isLoading) {
        if (pp.appointments.isEmpty) pp.fetchAppointments();
        if (pp.visits.isEmpty) pp.fetchVisits();
        if (pp.bills.isEmpty) pp.fetchBills();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<PatientProvider>();
    final patient = provider.patient;
    final patientName = patient?.name.split(' ').first ?? 'Patient';

    // 1. Next Appointment / Follow-up Logic
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    
    String formatDoc(String name) {
      if (name.isEmpty) return '';
      return name.toLowerCase().startsWith('dr') ? name : 'Dr. $name';
    }
    
    DateTime? nextDateTime;
    String nextApptSubtitle = 'No upcoming appointments';
    String nextApptDetail = 'Schedule one now';

    // Check formal appointments
    var upcomingAppts = provider.appointments.where((a) {
      if (a.scheduledDateTime.isEmpty) return false;
      if (a.status.toLowerCase() == 'completed' || a.status.toLowerCase() == 'cancelled') return false;
      try {
        return DateTime.parse(a.scheduledDateTime).toLocal().isAfter(now);
      } catch (e) {
        // Ignore parse errors
        return false;
      }
    }).toList();
    upcomingAppts.sort((a, b) => a.scheduledDateTime.compareTo(b.scheduledDateTime));

    if (upcomingAppts.isNotEmpty) {
      final a = upcomingAppts.first;
      nextDateTime = DateTime.parse(a.scheduledDateTime).toLocal();
      nextApptSubtitle = a.doctor.fullName.isNotEmpty ? formatDoc(a.doctor.fullName) : 'Upcoming Appointment';
      nextApptDetail = DateFormat('MMM d, h:mm a').format(nextDateTime);
    }

    // Include next_visit_date from visits if it's sooner or no appointment exists
    for (var v in provider.visits) {
      if (v.nextVisitDate != null && v.nextVisitDate!.isNotEmpty) {
        try {
          DateTime nvDate = DateTime.parse(v.nextVisitDate!).toLocal();
          DateTime nvDay = DateTime(nvDate.year, nvDate.month, nvDate.day);
          
          // Constraint: keep showing if today, hide if crossed (greater or crossed then no appointments)
          if (!nvDay.isBefore(today)) {
            // Pick the earliest available date
            if (nextDateTime == null || nvDate.isBefore(nextDateTime)) {
              nextDateTime = nvDate;
              nextApptSubtitle = v.doctor.fullName.isNotEmpty ? formatDoc(v.doctor.fullName) : 'Follow-up Visit';
              nextApptDetail = DateFormat('MMM d, yyyy').format(nvDate);
            }
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    }

    // 2. Recent Visit
    var visitsList = List.of(provider.visits);
    visitsList.sort((a, b) => b.visitDate.compareTo(a.visitDate));
    final recentVisit = visitsList.isNotEmpty ? visitsList.first : null;
    
    String recentVisitSubtitle = recentVisit != null ? (recentVisit.diagnosis.isNotEmpty ? recentVisit.diagnosis : 'Visit') : 'No visits';
    String recentVisitDetail = recentVisit != null 
        ? DateFormat('MMM d, yyyy').format(DateTime.parse(recentVisit.visitDate)) 
        : 'No history';

    // 3. Pending Bills
    var pendingBills = provider.bills.where((b) => b.paymentStatus.toLowerCase() == 'pending').toList();
    double totalPending = pendingBills.fold(0.0, (sum, b) => sum + b.totalAmount);
    String pendingBillSubtitle = '${pendingBills.length} Bills';
    String pendingBillDetail = '₹${totalPending.toStringAsFixed(0)}';

    // 4. Recent Activity (Latest reports, bills)
    List<Widget> recentActivityWidgets = [];
    var allReports = provider.visits.expand((v) => v.reports).toList();
    allReports.sort((a, b) => b.uploadedAt.compareTo(a.uploadedAt));
    if (allReports.isNotEmpty) {
      final r = allReports.first;
      recentActivityWidgets.add(_buildActivityItem(
        context,
        icon: Icons.description,
        title: 'Report Available',
        subtitle: '${r.reportType} - ${r.title}',
        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const RecordsScreen())),
      ));
    }
    if (pendingBills.isNotEmpty) {
      final b = pendingBills.first;
      recentActivityWidgets.add(_buildActivityItem(
        context,
        icon: Icons.receipt_long,
        title: 'New Bill Generated',
        subtitle: '₹${b.totalAmount.toStringAsFixed(0)} - Action Required',
        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const BillsScreen())),
      ));
    }
    if (provider.appointments.isNotEmpty) {
      var pastAppts = List.of(provider.appointments);
      pastAppts.sort((a, b) => b.scheduledDateTime.compareTo(a.scheduledDateTime));
      final a = pastAppts.first;
      recentActivityWidgets.add(_buildActivityItem(
        context,
        icon: Icons.event_available,
        title: 'Appointment Status',
        subtitle: '${formatDoc(a.doctor.fullName)} - ${a.status}',
        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AppointmentsScreen())),
      ));
    }
    if (recentActivityWidgets.isEmpty) {
      recentActivityWidgets.add(
        const Padding(
          padding: EdgeInsets.all(16.0),
          child: Text('No recent activities.', style: TextStyle(color: Colors.grey)),
        )
      );
    }

    return Scaffold(

      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.person, color: AppColors.primary, size: 20),
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Hello, $patientName',
                  style: const TextStyle(
                      color: AppColors.textPrimary,
                      fontSize: 16,
                      fontWeight: FontWeight.bold),
                ),
                Text(
                  'MediLocker Health',
                  style: TextStyle(
                      color: AppColors.textSecondary.withValues(alpha: 0.7), 
                      fontSize: 11,
                      letterSpacing: 0.5,
                  ),
                ),
              ],
            ),
          ],
        ),

        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined, color: AppColors.textPrimary),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Quick Summary Cards
            SizedBox(
              height: 180,
              child: ListView(
                scrollDirection: Axis.horizontal,
                children: [
                  _buildSummaryCard(
                    context,
                    icon: Icons.calendar_today,
                    title: 'Next Appointment',
                    subtitle: nextApptSubtitle,
                    detail: nextApptDetail,
                    color: AppColors.primary,
                  ),
                  _buildSummaryCard(
                    context,
                    icon: Icons.medical_services,
                    title: 'Recent Visit',
                    subtitle: recentVisitSubtitle,
                    detail: recentVisitDetail,
                    color: AppColors.success,
                  ),
                  _buildSummaryCard(
                    context,
                    icon: Icons.receipt,
                    title: 'Pending Bills',
                    subtitle: pendingBillSubtitle,
                    detail: pendingBillDetail,
                    color: AppColors.warning,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            
            // Quick Actions
            Text(
              'Quick Actions',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 16),
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              mainAxisSpacing: 16,
              crossAxisSpacing: 16,
              children: [
                _buildActionCard(
                  context,
                  icon: Icons.calendar_month,
                  title: 'Book Appointment',
                  color: AppColors.primary,
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const AppointmentsScreen()),
                  ),
                ),
                _buildActionCard(
                  context,
                  icon: Icons.folder_shared,
                  title: 'Medical Records',
                  color: AppColors.success,
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const RecordsScreen()),
                  ),
                ),
                _buildActionCard(
                  context,
                  icon: Icons.payments,
                  title: 'My Bills',
                  color: AppColors.warning,
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const BillsScreen()),
                  ),
                ),
                _buildActionCard(
                  context,
                  icon: Icons.medical_services,
                  title: 'Emergency',
                  color: AppColors.emergency,
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const EmergencyScreen()),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            
            // Recent Activity
            Text(
              'Recent Activity',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 16),
            ...recentActivityWidgets,
            const SizedBox(height: 100),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryCard(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required String detail,
    required Color color,
  }) {
    return Container(
      width: 240,
      margin: const EdgeInsets.only(right: 16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            color,
            color.withValues(alpha: 0.8),
          ],
        ),
        boxShadow: [
          BoxShadow(
            color: color.withValues(alpha: 0.3),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Stack(
        children: [
          Positioned(
            right: -20,
            top: -20,
            child: Icon(
              icon,
              size: 100,
              color: Colors.white.withValues(alpha: 0.1),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(icon, color: Colors.white, size: 24),
                ),
                const Spacer(),
                Text(
                  title,
                  style: const TextStyle(
                    color: Colors.white70,
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  detail,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionCard(
    BuildContext context, {
    required IconData icon,
    required String title,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Container(
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
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(icon, color: color, size: 48),
                const SizedBox(height: 12),
                Text(
                  title,
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildActivityItem(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ListTile(
        onTap: onTap,
        contentPadding: const EdgeInsets.all(12),
        leading: Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: AppColors.primary.withValues(alpha: 0.04),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(icon, color: AppColors.primary, size: 24),
        ),
        title: Text(
          title,
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
        ),
        subtitle: Text(
          subtitle,
          style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
        ),
        trailing: const Icon(Icons.chevron_right, size: 20),
      ),
    );
  }
}
