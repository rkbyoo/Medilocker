import 'dart:convert';
import 'dart:developer' as developer;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';
import 'api_service.dart';

class AuthService {
  Future<void> sendOtp(String phoneNumber, String patientNumber) async {
    await ApiService.post(ApiConfig.sendOtpEndpoint, {
      'phone': phoneNumber,
      'patient_number': patientNumber,
    });
  }

  Future<void> verifyOtp(
      String phoneNumber, String patientNumber, String otp) async {
    final response = await ApiService.post(ApiConfig.verifyOtpEndpoint, {
      'phone': phoneNumber,
      'patient_number': patientNumber,
      'code': otp,
    });

    // Server returns { success: true, data: { access_token, refresh_token, patient, user } }
    final data = response['data'] as Map<String, dynamic>?;
    final accessToken = data?['access_token'] as String?;
    if (accessToken == null) {
      throw Exception('Server did not return an access token.');
    }

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', accessToken);

    final refreshToken = data?['refresh_token'] as String?;
    if (refreshToken != null) {
      await prefs.setString('refresh_token', refreshToken);
    }

    // Persist patient data so PatientProvider can load it without an extra request
    final patientData = data?['patient'];
    if (patientData != null) {
      await prefs.setString('patient_data', jsonEncode(patientData));
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    final refreshToken = prefs.getString('refresh_token');
    if (refreshToken != null) {
      try {
        await ApiService.post(ApiConfig.logoutEndpoint, {
          'refresh_token': refreshToken,
        });
      } catch (e) {
        developer.log('Logout API call failed (ignored): $e', name: 'AuthService');
      }
    }
    // Remove only auth-related data — preserve any future app settings
    await prefs.remove('auth_token');
    await prefs.remove('refresh_token');
    await prefs.remove('patient_data');
  }

  Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token') != null;
  }
}
