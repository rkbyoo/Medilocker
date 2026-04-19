class ApiConfig {
  /// Set to true to use the hosted cloud server. 
  /// Set to false to use your local development server.
  static const bool useCloud = true;

  static const String _cloudUrl = 'http://140.238.163.158:8080/api';
  
  /// For Android Emulator, use '10.0.2.2'. 
  /// For iOS Simulator or Web, use 'localhost'. 
  /// For Physical Devices, use your computer's LAN IP (e.g., 192.168.x.x).
  static const String _localUrl = 'http://10.0.2.2:4000/api'; 

  static const String baseUrl = useCloud ? _cloudUrl : _localUrl;

  // Auth endpoints  → /api/auth/otp/send  |  /api/auth/otp/verify
  static const sendOtpEndpoint    = '$baseUrl/auth/otp/send';
  static const verifyOtpEndpoint  = '$baseUrl/auth/otp/verify';
  static const refreshEndpoint    = '$baseUrl/auth/refresh';
  static const logoutEndpoint     = '$baseUrl/auth/logout';

  // Patient endpoints (protected – requires Bearer token)
  static const profileEndpoint    = '$baseUrl/patients/me';
  static const allergiesEndpoint  = '$baseUrl/patients/me/allergies';
  static const conditionsEndpoint = '$baseUrl/patients/me/conditions';

  // Visits endpoints
  static const visitsEndpoint     = '$baseUrl/visits';

  // Bills endpoints
  static const billsEndpoint      = '$baseUrl/bills';

  // Appointments endpoints
  static const appointmentsEndpoint = '$baseUrl/appointments';
  static const slotsEndpoint        = '$baseUrl/appointments/slots';

  // Notifications endpoints
  static const notificationsEndpoint = '$baseUrl/notifications';
}
