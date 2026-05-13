import 'dart:developer' as developer;
import 'package:flutter/material.dart';
import 'package:medilocker/core/services/auth_service.dart';
import 'package:medilocker/core/services/api_service.dart';
import 'patient_provider.dart';
import 'package:medilocker/core/services/push_notification_service.dart';

class AuthProvider with ChangeNotifier {
  final AuthService _authService = AuthService();
  bool _isAuthenticated = false;
  bool _isLoading = false;          // button-level spinner (sendOtp / verifyOtp)
  bool _isCheckingAuth = true;      // startup-only: reading SharedPreferences
  String? _errorMessage;

  bool get isAuthenticated => _isAuthenticated;
  bool get isLoading => _isLoading;
  bool get isCheckingAuth => _isCheckingAuth;
  String? get errorMessage => _errorMessage;

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  Future<void> checkAuthStatus() async {
    _isCheckingAuth = true;
    notifyListeners();
    _isAuthenticated = await _authService.isLoggedIn();
    if (_isAuthenticated) {
      PushNotificationService.registerDevice();
    }
    _isCheckingAuth = false;
    notifyListeners();
  }

  Future<bool> sendOtp(String phoneNumber, String patientNumber) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _authService.sendOtp(phoneNumber, patientNumber);
      _isLoading = false;
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      developer.log('sendOtp [${e.statusCode}]: ${e.message}',
          name: 'AuthProvider');
      _errorMessage = e.message;
      _isLoading = false;
      notifyListeners();
      return false;
    } catch (e) {
      developer.log('sendOtp unexpected: $e', name: 'AuthProvider');
      _errorMessage = 'Could not reach server. Check your connection.';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> verifyOtp(
    String phoneNumber,
    String patientNumber,
    String otp, {
    PatientProvider? patientProvider,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _authService.verifyOtp(phoneNumber, patientNumber, otp);
      _isAuthenticated = true;
      patientProvider?.fetchProfile();
      PushNotificationService.registerDevice();
      _isLoading = false;
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      developer.log('verifyOtp [${e.statusCode}]: ${e.message}',
          name: 'AuthProvider');
      _errorMessage = e.message;
      _isLoading = false;
      notifyListeners();
      return false;
    } catch (e) {
      developer.log('verifyOtp unexpected: $e', name: 'AuthProvider');
      _errorMessage = 'Could not reach server. Check your connection.';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout({PatientProvider? patientProvider}) async {
    await _authService.logout();
    await patientProvider?.clearPatient();
    _isAuthenticated = false;
    _errorMessage = null;
    notifyListeners();
  }
}
