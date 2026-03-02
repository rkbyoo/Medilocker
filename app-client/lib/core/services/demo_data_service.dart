class DemoDataService {
  // Demo credentials
  static const String demoPhone = '9876543210';
  static const String demoPatientNumber = '1234567890';
  static const String demoOTP = '123456';

  // Check if credentials are demo
  static bool isDemoCredentials(String phone, String patientNumber) {
    return phone == demoPhone && patientNumber == demoPatientNumber;
  }

  // Verify demo OTP
  static bool verifyDemoOTP(String otp) {
    return otp == demoOTP;
  }
}
