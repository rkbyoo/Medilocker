import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';

class RecordsScreen extends StatefulWidget {
  const RecordsScreen({super.key});

  @override
  State<RecordsScreen> createState() => _RecordsScreenState();
}

class _RecordsScreenState extends State<RecordsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
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
          'Medical Records',
          style: TextStyle(color: AppColors.textPrimary),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.search, color: AppColors.textPrimary),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.filter_list, color: AppColors.textPrimary),
            onPressed: () {},
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.primary,
          unselectedLabelColor: AppColors.textSecondary,
          indicatorColor: AppColors.primary,
          tabs: const [
            Tab(text: 'Visits'),
            Tab(text: 'Reports'),
            Tab(text: 'Prescriptions'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildVisitsTab(),
          _buildReportsTab(),
          _buildPrescriptionsTab(),
        ],
      ),
    );
  }

  Widget _buildVisitsTab() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: 5,
      itemBuilder: (context, index) {
        return _buildVisitCard(
          context,
          date: '${index + 1} days ago',
          hospital: 'City Hospital',
          doctor: 'Dr. John Smith',
          department: 'Cardiology',
          visitType: 'Follow-up',
          hasPrescription: true,
          reportsCount: 2,
        );
      },
    );
  }

  Widget _buildReportsTab() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: 8,
      itemBuilder: (context, index) {
        return _buildReportCard(
          context,
          title: 'Blood Test Report',
          date: '${index + 1} days ago',
          hospital: 'City Hospital',
          type: 'Lab Test',
        );
      },
    );
  }

  Widget _buildPrescriptionsTab() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: 4,
      itemBuilder: (context, index) {
        return _buildPrescriptionCard(
          context,
          doctor: 'Dr. Sarah Johnson',
          date: '${index + 1} days ago',
          medicationsCount: 3,
        );
      },
    );
  }

  Widget _buildVisitCard(
    BuildContext context, {
    required String date,
    required String hospital,
    required String doctor,
    required String department,
    required String visitType,
    required bool hasPrescription,
    required int reportsCount,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
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
                  color: AppColors.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  visitType,
                  style: const TextStyle(
                    color: AppColors.primary,
                    fontWeight: FontWeight.w600,
                    fontSize: 12,
                  ),
                ),
              ),
              Text(
                date,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: AppColors.textSecondary,
                    ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            hospital,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
          ),
          const SizedBox(height: 4),
          Text(
            '$doctor • $department',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppColors.textSecondary,
                ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              if (hasPrescription)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.success.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.medication, size: 16, color: AppColors.success),
                      SizedBox(width: 4),
                      Text(
                        'Prescription',
                        style: TextStyle(
                          color: AppColors.success,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
              if (hasPrescription && reportsCount > 0) const SizedBox(width: 8),
              if (reportsCount > 0)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.warning.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.description, size: 16, color: AppColors.warning),
                      const SizedBox(width: 4),
                      Text(
                        '$reportsCount Reports',
                        style: const TextStyle(
                          color: AppColors.warning,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildReportCard(
    BuildContext context, {
    required String title,
    required String date,
    required String hospital,
    required String type,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.warning.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.description, color: AppColors.warning),
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
                const SizedBox(height: 4),
                Text(
                  '$date • $hospital',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppColors.textSecondary,
                      ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Text(
              'PDF',
              style: TextStyle(
                color: AppColors.primary,
                fontSize: 12,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPrescriptionCard(
    BuildContext context, {
    required String doctor,
    required String date,
    required int medicationsCount,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
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
              Text(
                doctor,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              Text(
                date,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: AppColors.textSecondary,
                    ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            '$medicationsCount medications prescribed',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppColors.textSecondary,
                ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () {},
                  icon: const Icon(Icons.download, size: 18),
                  label: const Text('Download'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.primary,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () {},
                  icon: const Icon(Icons.share, size: 18),
                  label: const Text('Share'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.primary,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
