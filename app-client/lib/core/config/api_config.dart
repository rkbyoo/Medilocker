class ApiConfig {
  static const baseUrl = 'http://localhost:3000/api';
  static const mobileBaseUrl = '$baseUrl/mobile';
  
  // Auth endpoints
  static const validateEndpoint = '$mobileBaseUrl/auth/validate';
  static const sendOtpEndpoint = '$mobileBaseUrl/auth/send-otp';
  static const verifyOtpEndpoint = '$mobileBaseUrl/auth/verify-otp';
  static const refreshEndpoint = '$mobileBaseUrl/auth/refresh';
  static const logoutEndpoint = '$mobileBaseUrl/auth/logout';
  
  // Patient endpoints
  static const profileEndpoint = '$mobileBaseUrl/patient/profile';
  static const allergiesEndpoint = '$mobileBaseUrl/patient/allergies';
  static const conditionsEndpoint = '$mobileBaseUrl/patient/conditions';
  
  // Visits endpoints
  static const visitsEndpoint = '$mobileBaseUrl/visits';
  
  // Bills endpoints
  static const billsEndpoint = '$mobileBaseUrl/bills';
  
  // Appointments endpoints
  static const appointmentsEndpoint = '$mobileBaseUrl/appointments';
  static const slotsEndpoint = '$mobileBaseUrl/appointments/slots';
  
  // Notifications endpoints
  static const notificationsEndpoint = '$mobileBaseUrl/notifications';
}
