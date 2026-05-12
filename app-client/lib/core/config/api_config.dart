import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter/foundation.dart';

class ApiConfig {
  static String get baseUrl {
    final env = dotenv.get('APP_ENV', fallback: 'development');
    final cloudUrl = dotenv.get('CLOUD_API_URL', fallback: 'http://140.238.163.158:8080/api');
    final localUrl = dotenv.get('LOCAL_API_URL', fallback: 'http://10.0.2.2:4000/api');
    
    final url = env == 'production' ? cloudUrl : localUrl;
    
    // Only print in debug mode
    if (kDebugMode) {
      debugPrint('[ApiConfig] Environment: $env');
      debugPrint('[ApiConfig] Using Base URL: $url');
    }
    
    return url;
  }

  // Auth endpoints  → /api/auth/otp/send  |  /api/auth/otp/verify
  static String get sendOtpEndpoint    => '$baseUrl/auth/otp/send';
  static String get verifyOtpEndpoint  => '$baseUrl/auth/otp/verify';
  static String get refreshEndpoint    => '$baseUrl/auth/refresh';
  static String get logoutEndpoint     => '$baseUrl/auth/logout';

  // Patient endpoints (protected – requires Bearer token)
  static String get profileEndpoint    => '$baseUrl/patients/me';
  static String get allergiesEndpoint  => '$baseUrl/patients/me/allergies';
  static String get conditionsEndpoint => '$baseUrl/patients/me/conditions';

  // Visits endpoints
  static String get visitsEndpoint     => '$baseUrl/visits';

  // Bills endpoints
  static String get billsEndpoint      => '$baseUrl/bills';

  // Appointments endpoints
  static String get appointmentsEndpoint => '$baseUrl/appointments';
  static String get slotsEndpoint        => '$baseUrl/appointments/slots';

  // Notifications endpoints
  static String get notificationsEndpoint => '$baseUrl/notifications';
}
