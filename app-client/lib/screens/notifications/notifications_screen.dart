import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../core/constants/app_colors.dart';
import '../../core/models/notification.dart';
import '../../core/providers/notification_provider.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<NotificationProvider>().fetchNotifications();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        centerTitle: false,
        titleSpacing: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Notifications',
          style: TextStyle(
            fontWeight: FontWeight.w700,
            fontSize: 22,
            letterSpacing: -0.5,
            color: AppColors.textPrimary,
          ),
        ),
        actions: [
          Consumer<NotificationProvider>(
            builder: (context, provider, _) {
              if (provider.unreadCount == 0) return const SizedBox();
              return TextButton(
                onPressed: () => provider.markAllRead(),
                child: const Text(
                  'Mark all read',
                  style: TextStyle(
                    color: AppColors.primary,
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                  ),
                ),
              );
            },
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: Consumer<NotificationProvider>(
        builder: (context, provider, _) {
          if (provider.isLoading && !provider.hasLoaded) {
            return const Center(child: CircularProgressIndicator.adaptive());
          }

          if (provider.notifications.isEmpty) {
            return _buildEmpty();
          }

          return RefreshIndicator.adaptive(
            onRefresh: () => provider.fetchNotifications(),
            child: ListView.separated(
              padding: const EdgeInsets.only(top: 12, bottom: 32),
              itemCount: provider.notifications.length,
              separatorBuilder: (context, index) => const Divider(
                height: 1,
                indent: 72,
                endIndent: 24,
                color: Color(0xFFF1F5F9),
              ),
              itemBuilder: (context, index) {
                final n = provider.notifications[index];
                return _NotificationTile(
                  notification: n,
                  onTap: () => provider.markRead(n.id),
                );
              },
            ),
          );
        },
      ),
    );
  }

  Widget _buildEmpty() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.notifications_none_rounded,
            size: 64,
            color: AppColors.textSecondary.withValues(alpha: 0.2),
          ),
          const SizedBox(height: 16),
          const Text(
            'Quiet for now',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'We\'ll notify you when there\'s something new.',
            style: TextStyle(
              color: AppColors.textSecondary.withValues(alpha: 0.6),
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }
}

class _NotificationTile extends StatelessWidget {
  final AppNotification notification;
  final VoidCallback onTap;

  const _NotificationTile({
    required this.notification,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final info = _typeInfo(notification.type);

    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
        color: notification.isRead ? Colors.transparent : AppColors.primary.withValues(alpha: 0.02),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Minimalist Icon
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: info.color.withValues(alpha: 0.08),
                shape: BoxShape.circle,
              ),
              child: Icon(info.icon, color: info.color, size: 22),
            ),
            const SizedBox(width: 16),

            // Content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          notification.title,
                          style: TextStyle(
                            fontWeight: notification.isRead ? FontWeight.w600 : FontWeight.w700,
                            fontSize: 15,
                            color: AppColors.textPrimary,
                            letterSpacing: -0.2,
                          ),
                        ),
                      ),
                      if (!notification.isRead)
                        Container(
                          width: 6,
                          height: 6,
                          decoration: const BoxDecoration(
                            color: AppColors.primary,
                            shape: BoxShape.circle,
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    notification.body,
                    style: TextStyle(
                      fontSize: 14,
                      color: AppColors.textSecondary.withValues(alpha: 0.8),
                      height: 1.4,
                      fontWeight: notification.isRead ? FontWeight.w400 : FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _formatTime(notification.createdAt),
                    style: TextStyle(
                      fontSize: 12,
                      color: AppColors.textSecondary.withValues(alpha: 0.4),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatTime(DateTime dt) {
    final now = DateTime.now();
    final diff = now.difference(dt);

    if (diff.inMinutes < 1) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m';
    if (diff.inHours < 24) return '${diff.inHours}h';
    if (diff.inDays == 1) return 'Yesterday';
    if (diff.inDays < 7) return '${diff.inDays}d';
    return DateFormat('MMM d').format(dt);
  }

  _TypeInfo _typeInfo(String type) {
    switch (type) {
      case 'appointment_scheduled':
      case 'appointment_confirmed':
        return _TypeInfo(Icons.calendar_today_rounded, AppColors.primary);
      case 'appointment_cancelled':
        return _TypeInfo(Icons.event_busy_rounded, AppColors.error);
      case 'prescription_ready':
        return _TypeInfo(Icons.medication_rounded, const Color(0xFF8B5CF6));
      case 'visit_recorded':
      case 'appointment_completed':
        return _TypeInfo(Icons.assignment_rounded, AppColors.success);
      default:
        return _TypeInfo(Icons.notifications_active_rounded, AppColors.primary);
    }
  }
}

class _TypeInfo {
  final IconData icon;
  final Color color;
  const _TypeInfo(this.icon, this.color);
}
