import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';
import 'api_service.dart';

class AuthService {
  Future<bool> sendOtp(String phoneNumber, String patientNumber) async {
    try {
      await ApiService.post(ApiConfig.sendOtpEndpoint, {
        'phone_number': phoneNumber,
        'patient_number': patientNumber,
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<bool> verifyOtp(String phoneNumber, String patientNumber, String otp) async {
    try {
      final response = await ApiService.post(ApiConfig.verifyOtpEndpoint, {
        'phone_number': phoneNumber,
        'patient_number': patientNumber,
        'otp': otp,
      });
      
      final token = response['token'];
      if (token != null) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('auth_token', token);
        await prefs.setString('patient_number', patientNumber);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  Future<void> logout() async {
    try {
      await ApiService.post(ApiConfig.logoutEndpoint, {});
    } catch (e) {
      // Ignore error
    }
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
  }

  Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token') != null;
  }
}
