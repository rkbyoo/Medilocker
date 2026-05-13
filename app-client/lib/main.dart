import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/constants/app_colors.dart';
import 'core/providers/auth_provider.dart';
import 'core/providers/notification_provider.dart';
import 'core/providers/notification_preferences_provider.dart';
import 'core/providers/patient_provider.dart';
import 'core/services/api_service.dart';
import 'screens/auth/login_screen.dart';
import 'screens/home/main_screen.dart';
import 'screens/notifications/notifications_screen.dart';

import 'package:flutter_dotenv/flutter_dotenv.dart';

import 'package:firebase_core/firebase_core.dart';
import 'core/services/push_notification_service.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: ".env");

  // Initialize Firebase
  try {
    await Firebase.initializeApp();
    await PushNotificationService.initialize();
  } catch (e) {
    debugPrint('[Main] Firebase initialization skipped: $e');
  }

  runApp(const MyHealthApp());
}

class MyHealthApp extends StatelessWidget {
  const MyHealthApp({super.key});

  static final GlobalKey<NavigatorState> navigatorKey =
      GlobalKey<NavigatorState>();

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => PatientProvider()),
        ChangeNotifierProvider(create: (_) => NotificationProvider()),
        ChangeNotifierProvider(create: (_) => NotificationPreferencesProvider()),
      ],
      child: MaterialApp(
        title: 'MediLocker',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          primaryColor: AppColors.primary,
          scaffoldBackgroundColor: AppColors.background,
          colorScheme: ColorScheme.fromSeed(
            seedColor: AppColors.primary,
            primary: AppColors.primary,
            secondary: AppColors.success,
            error: AppColors.error,
          ),
          appBarTheme: const AppBarTheme(
            backgroundColor: Colors.white,
            elevation: 0,
            iconTheme: IconThemeData(color: AppColors.textPrimary),
            titleTextStyle: TextStyle(
              color: AppColors.textPrimary,
              fontSize: 20,
              fontWeight: FontWeight.w600,
            ),
          ),
          elevatedButtonTheme: ElevatedButtonThemeData(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
          inputDecorationTheme: InputDecorationTheme(
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: AppColors.divider),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: AppColors.divider),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: AppColors.primary, width: 2),
            ),
          ),
          cardTheme: CardThemeData(
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            color: Colors.white,
          ),
          useMaterial3: true,
        ),
        navigatorKey: MyHealthApp.navigatorKey,
        home: const AuthWrapper(),
      ),
    );
  }
}

class AuthWrapper extends StatefulWidget {
  const AuthWrapper({super.key});

  @override
  State<AuthWrapper> createState() => _AuthWrapperState();
}

class _AuthWrapperState extends State<AuthWrapper> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final authProvider = context.read<AuthProvider>();
      final patientProvider = context.read<PatientProvider>();
      final notificationProvider = context.read<NotificationProvider>();

      authProvider.checkAuthStatus();

      // Auto-logout on 401 Unauthorized globally
      ApiService.onUnauthenticated = () {
        authProvider.logout(patientProvider: patientProvider);
      };

      // Listen for real-time notifications to update the red dot
      PushNotificationService.onMessage.listen((message) {
        debugPrint(
          '[AuthWrapper] Real-time notification received: ${message.notification?.title}',
        );
        notificationProvider.refreshUnreadCount();
      });

      // Listen for notification taps
      PushNotificationService.onTap.listen((message) {
        debugPrint(
          '[AuthWrapper] Notification tapped: ${message.notification?.title}',
        );
        _navigateToNotifications();
      });
    });
  }

  void _navigateToNotifications() {
    final context = MyHealthApp.navigatorKey.currentContext;
    if (context != null) {
      // Check if we are already on the notifications screen
      bool isNotificationsAlreadyOpen = false;
      Navigator.popUntil(context, (route) {
        if (route.settings.name == '/notifications') {
          isNotificationsAlreadyOpen = true;
        }
        return true;
      });

      if (!isNotificationsAlreadyOpen) {
        Navigator.push(
          context,
          MaterialPageRoute(
            settings: const RouteSettings(name: '/notifications'),
            builder: (_) => const NotificationsScreen(),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, _) {
        // Only block UI during the one-time startup token check.
        // isLoading (sendOtp/verifyOtp) must NOT replace the current screen.
        if (authProvider.isCheckingAuth) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }

        return authProvider.isAuthenticated
            ? const MainScreen()
            : const LoginScreen();
      },
    );
  }
}
