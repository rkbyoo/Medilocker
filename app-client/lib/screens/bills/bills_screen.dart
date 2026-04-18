import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../core/constants/app_colors.dart';
import '../../core/providers/patient_provider.dart';
import '../../core/models/bill.dart';
import 'bill_detail_screen.dart';

class BillsScreen extends StatefulWidget {
  const BillsScreen({super.key});

  @override
  State<BillsScreen> createState() => _BillsScreenState();
}

class _BillsScreenState extends State<BillsScreen> with SingleTickerProviderStateMixin {
  TabController? _tabController;
  final List<String> _tabs = ['All', 'Pending', 'Paid'];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _tabController?.addListener(_handleTabSelection);
    
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        context.read<PatientProvider>().fetchBills();
      }
    });
  }

  void _handleTabSelection() {
    if (_tabController != null && !_tabController!.indexIsChanging) {
      setState(() {});
    }
  }

  @override
  void dispose() {
    _tabController?.removeListener(_handleTabSelection);
    _tabController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<PatientProvider>(
      builder: (context, provider, child) {
        final allBills = provider.bills;
        
        if (_tabController == null) {
          return const Scaffold(body: Center(child: CircularProgressIndicator()));
        }
        
        return Scaffold(
          backgroundColor: AppColors.background,
          appBar: AppBar(
            backgroundColor: Colors.white,
            elevation: 0,
            title: const Text(
              'My Bills',
              style: TextStyle(color: AppColors.textPrimary),
            ),
          ),
          body: Column(
            children: [
              // Custom Sliding Segmented Control
              Container(
                color: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                child: Container(
                  height: 50,
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(25),
                  ),
                  child: AnimatedBuilder(
                    animation: _tabController!.animation!,
                    builder: (context, child) {
                      return Stack(
                        children: [
                          // Sliding Indicator (Now follows animation value for real-time response)
                          Align(
                            alignment: Alignment(
                              -1.0 + (_tabController!.animation!.value * 1.0),
                              0,
                            ),
                            child: FractionallySizedBox(
                              widthFactor: 1 / 3,
                              child: Container(
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(21),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withValues(alpha: 0.08),
                                      blurRadius: 8,
                                      offset: const Offset(0, 2),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                          // Tab Labels
                          Row(
                            children: _tabs.asMap().entries.map((entry) {
                              final idx = entry.key;
                              final label = entry.value;
                              // Check threshold for text color change
                              final isSelected = (_tabController!.animation!.value - idx).abs() < 0.5;
                              
                              int count = 0;
                              if (label == 'All') {
                                count = allBills.length;
                              } else if (label == 'Pending') {
                                count = allBills.where((b) => b.paymentStatus.toLowerCase() == 'pending').length;
                              } else if (label == 'Paid') {
                                count = allBills.where((b) => b.paymentStatus.toLowerCase() == 'paid').length;
                              }
    
                              return Expanded(
                                child: GestureDetector(
                                  onTap: () => _tabController!.animateTo(idx),
                                  behavior: HitTestBehavior.opaque,
                                  child: Center(
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Text(
                                          label,
                                          style: TextStyle(
                                            color: isSelected ? AppColors.primary : AppColors.textSecondary,
                                            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                                            fontSize: 14,
                                          ),
                                        ),
                                        if (count > 0) ...[
                                          const SizedBox(width: 4),
                                          Text(
                                            '($count)',
                                            style: TextStyle(
                                              color: isSelected ? AppColors.primary : AppColors.textSecondary.withValues(alpha: 0.6),
                                              fontSize: 10,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ],
                                      ],
                                    ),
                                  ),
                                ),
                              );
                            }).toList(),
                          ),
                        ],
                      );
                    },
                  ),
                ),
              ),
              
              // Swipeable Tab Content
              Expanded(
                child: TabBarView(
                  controller: _tabController!,
                  children: [
                    _buildBillList(context, provider, allBills),
                    _buildBillList(context, provider, allBills.where((b) => b.paymentStatus.toLowerCase() == 'pending').toList()),
                    _buildBillList(context, provider, allBills.where((b) => b.paymentStatus.toLowerCase() == 'paid').toList()),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildBillList(BuildContext context, PatientProvider provider, List<Bill> bills) {
    if (provider.isLoading && bills.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }
    
    if (bills.isEmpty) {
      return const Center(child: Text('No bills found'));
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: bills.length,
      itemBuilder: (context, index) {
        final bill = bills[index];
        final isPending = bill.paymentStatus.toLowerCase() == 'pending';
        
        String dateStr = bill.createdAt ?? bill.visitDate;
        try {
          DateTime dt = DateTime.parse(dateStr).toLocal();
          dateStr = DateFormat('MMM dd, yyyy').format(dt);
        } catch (e) {
          // Ignore parse errors
        }

        return _buildBillCard(
          context,
          bill: bill,
          billId: bill.billId,
          hospital: bill.hospital.name,
          date: dateStr,
          amount: bill.totalAmount,
          status: bill.paymentStatus,
          statusColor: isPending ? AppColors.warning : AppColors.success,
        );
      },
    );
  }



  Widget _buildBillCard(
    BuildContext context, {
    required Bill bill,
    required String billId,
    required String hospital,
    required String date,
    required double amount,
    required String status,
    required Color statusColor,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
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
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => BillDetailScreen(bill: bill),
              ),
            );
          },
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        hospital,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
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
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '#B-${billId.split('-').first.toUpperCase()}',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                  color: AppColors.textSecondary,
                                  fontWeight: FontWeight.bold,
                                ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            date,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                  color: AppColors.textSecondary,
                                ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      '₹${amount.toStringAsFixed(2)}',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: AppColors.textPrimary,
                          ),
                    ),
                  ],
                ),
                if (status == 'Pending') ...[
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () {
                        // Navigate to payment
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                      ),
                      child: const Text('Pay Now'),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
