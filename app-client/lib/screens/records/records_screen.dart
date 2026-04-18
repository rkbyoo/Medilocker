import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../core/constants/app_colors.dart';
import '../../core/providers/patient_provider.dart';
import '../../core/models/visit.dart';
import 'prescription_detail_screen.dart';

class RecordsScreen extends StatefulWidget {
  const RecordsScreen({super.key});

  @override
  State<RecordsScreen> createState() => _RecordsScreenState();
}

class _RecordsScreenState extends State<RecordsScreen> {
  String _activeFilter = 'ALL';
  final TextEditingController _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  List<Visit> _getFilteredVisits(List<Visit> visits) {
    List<Visit> filtered = List<Visit>.from(visits);

    if (_activeFilter == 'REPORTS') {
      filtered = filtered.where((v) => v.reports.isNotEmpty).toList();
    } else if (_activeFilter == 'MEDS') {
      filtered = filtered.where((v) => v.prescriptions.isNotEmpty).toList();
    } else if (_activeFilter == 'VISITS') {
      filtered = filtered
          .where((v) => v.visitType.toUpperCase().contains('CONSULT'))
          .toList();
      if (filtered.isEmpty) filtered = List<Visit>.from(visits);
    }

    final query = _searchController.text.toLowerCase();
    if (query.isNotEmpty) {
      filtered = filtered.where((v) {
        return v.diagnosis.toLowerCase().contains(query) ||
            v.doctor.fullName.toLowerCase().contains(query) ||
            v.hospital.name.toLowerCase().contains(query);
      }).toList();
    }

    filtered.sort((a, b) => b.visitDate.compareTo(a.visitDate));
    return filtered;
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => FocusScope.of(context).unfocus(),
      child: Scaffold(
        backgroundColor: Colors.white,
        body: Consumer<PatientProvider>(
          builder: (context, provider, child) {
            final filteredVisits = _getFilteredVisits(provider.visits);

            return CustomScrollView(
              slivers: [
                _buildSliverAppBar(),
                _buildPersistentSearch(),
                _buildFilterChips(),
                if (filteredVisits.isEmpty)
                  const SliverFillRemaining(
                    hasScrollBody: false,
                    child: _EmptyState(isSearch: true),
                  )
                else
                  SliverPadding(
                    padding: const EdgeInsets.fromLTRB(24, 32, 24, 32),
                    sliver: SliverList(
                      delegate: SliverChildBuilderDelegate((context, index) {
                        return _buildTimelineEvent(
                          context,
                          filteredVisits[index],
                        );
                      }, childCount: filteredVisits.length),
                    ),
                  ),
                const SliverToBoxAdapter(child: SizedBox(height: 100)),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _buildSliverAppBar() {
    return SliverAppBar(
      expandedHeight: 80, // Tighter height for top-left alignment
      backgroundColor: Colors.white,
      elevation: 0,
      pinned: true,
      centerTitle: false,
      flexibleSpace: const FlexibleSpaceBar(
        titlePadding: EdgeInsets.fromLTRB(24, 0, 24, 12),
        title: Text(
          'CLINICAL HISTORY',
          style: TextStyle(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w900,
            fontSize: 16,
            letterSpacing: 2,
          ),
        ),
      ),
    );
  }

  Widget _buildPersistentSearch() {
    return SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          decoration: BoxDecoration(
            color: const Color(0xFFF1F5F9),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Theme(
            data: Theme.of(context).copyWith(
              colorScheme: ColorScheme.fromSwatch().copyWith(
                primary: AppColors.textPrimary,
              ),
            ),
            child: TextField(
              controller: _searchController,
              onChanged: (value) => setState(() {}),
              cursorColor: AppColors.textPrimary,
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
              decoration: InputDecoration(
                hintText: 'Search diagnosis, doctor, or hub...',
                hintStyle: TextStyle(
                  fontSize: 12,
                  color: AppColors.textSecondary.withValues(alpha: 0.5),
                ),
                icon: const Icon(
                  Icons.search_rounded,
                  size: 20,
                  color: AppColors.textSecondary,
                ),
                suffixIcon: _searchController.text.isNotEmpty
                    ? GestureDetector(
                        onTap: () {
                          _searchController.clear();
                          setState(() {});
                        },
                        child: const Padding(
                          padding: EdgeInsets.only(right: 6),
                          child: Icon(
                            Icons.cancel_rounded,
                            size: 18,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      )
                    : null,
                suffixIconConstraints: const BoxConstraints(
                  minWidth: 0,
                  minHeight: 0,
                ),
                border: InputBorder.none,
                focusedBorder: InputBorder.none,
                enabledBorder: InputBorder.none,
                errorBorder: InputBorder.none,
                disabledBorder: InputBorder.none,
                isDense: true,
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildFilterChips() {
    final filters = ['ALL', 'VISITS', 'REPORTS', 'MEDS'];
    return SliverToBoxAdapter(
      child: Container(
        height: 40,
        margin: const EdgeInsets.only(top: 20),
        child: ListView.builder(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: 24),
          itemCount: filters.length,
          itemBuilder: (context, index) {
            final filter = filters[index];
            final isActive = _activeFilter == filter;
            return GestureDetector(
              onTap: () => setState(() => _activeFilter = filter),
              child: Container(
                margin: const EdgeInsets.only(right: 12),
                padding: const EdgeInsets.symmetric(horizontal: 22),
                decoration: BoxDecoration(
                  color: isActive ? AppColors.textPrimary : Colors.transparent,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: isActive ? AppColors.textPrimary : AppColors.divider,
                    width: 1,
                  ),
                ),
                child: Center(
                  child: Text(
                    filter,
                    style: TextStyle(
                      color: isActive ? Colors.white : AppColors.textSecondary,
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 1,
                    ),
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildTimelineEvent(BuildContext context, Visit visit) {
    final date = DateTime.tryParse(visit.visitDate) ?? DateTime.now();
    final dayStr = DateFormat('dd').format(date);
    final monthStr = DateFormat('MMM').format(date).toUpperCase();

    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 50,
            child: Column(
              children: [
                Text(
                  dayStr,
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w900,
                    color: AppColors.textPrimary,
                  ),
                ),
                Text(
                  monthStr,
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textSecondary.withValues(alpha: 0.6),
                    letterSpacing: 1,
                  ),
                ),
              ],
            ),
          ),
          SizedBox(
            width: 32,
            child: Column(
              children: [
                Container(
                  width: 12,
                  height: 12,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: AppColors.textPrimary,
                      width: 2.5,
                    ),
                  ),
                ),
                Expanded(
                  child: Container(width: 1.5, color: AppColors.divider),
                ),
              ],
            ),
          ),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildClinicalCard(context, visit),
                const SizedBox(height: 32),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildClinicalCard(BuildContext context, Visit visit) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: AppColors.divider.withValues(alpha: 0.5),
          width: 0.5,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.textPrimary,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  visit.visitType.toUpperCase(),
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 8,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 1,
                  ),
                ),
              ),
              const Spacer(),
              Icon(
                Icons.more_horiz,
                color: AppColors.textSecondary.withValues(alpha: 0.4),
                size: 18,
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            visit.diagnosis.isEmpty ? 'General Consultation' : visit.diagnosis,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            '${visit.doctor.fullName} • ${visit.hospital.name}',
            style: TextStyle(
              fontSize: 12,
              color: AppColors.textSecondary.withValues(alpha: 0.7),
              fontWeight: FontWeight.w500,
            ),
          ),

          if (visit.prescriptions.isNotEmpty || visit.reports.isNotEmpty) ...[
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 16),
              child: Divider(height: 1, thickness: 0.5),
            ),
            Row(
              children: [
                if (visit.prescriptions.isNotEmpty)
                  _buildAssetPill(
                    Icons.medication_outlined,
                    'PRESCRIPTION',
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => PrescriptionDetailScreen(
                            prescription: visit.prescriptions.first,
                            doctorName: visit.doctor.fullName,
                          ),
                        ),
                      );
                    },
                  ),
                if (visit.prescriptions.isNotEmpty && visit.reports.isNotEmpty)
                  const SizedBox(width: 8),
                if (visit.reports.isNotEmpty)
                  _buildAssetPill(
                    Icons.description_outlined,
                    '${visit.reports.length} REPORTS',
                  ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildAssetPill(IconData icon, String label, {VoidCallback? onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.divider, width: 0.5),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.03),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 14, color: AppColors.textPrimary),
            const SizedBox(width: 6),
            Text(
              label,
              style: const TextStyle(
                fontSize: 9,
                fontWeight: FontWeight.w800,
                color: AppColors.textPrimary,
                letterSpacing: 0.5,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  final bool isSearch;
  const _EmptyState({this.isSearch = false});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            isSearch ? Icons.search_off_rounded : Icons.history_edu_rounded,
            size: 64,
            color: AppColors.divider,
          ),
          const SizedBox(height: 24),
          Text(
            isSearch ? 'NO RESULTS FOUND' : 'NO CLINICAL HISTORY',
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w900,
              color: AppColors.textSecondary,
              letterSpacing: 2,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            isSearch
                ? 'Try a different search query or filter.'
                : 'Your medical journey will appear here.',
            style: TextStyle(
              fontSize: 14,
              color: AppColors.textSecondary.withValues(alpha: 0.5),
            ),
          ),
        ],
      ),
    );
  }
}
