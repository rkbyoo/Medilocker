class ApiConfig {
  // LAN IP of your development machine (run `ipconfig` to confirm)
  // Physical device must be on the same Wi-Fi network as this machine.
  static const baseUrl = 'http://172.20.72.66:4000/api';

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
