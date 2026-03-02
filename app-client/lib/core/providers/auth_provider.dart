import 'package:flutter/material.dart';
import 'package:medilocker/core/services/auth_service.dart';

class AuthProvider with ChangeNotifier {
  final AuthService _authService = AuthService();
  bool _isAuthenticated = false;
  bool _isLoading = false;
  bool _isDemoMode = false;

  // Demo credentials
  static const String _demoPhone = '9876543210';
  static const String _demoPatientNumber = '1234567890';
  static const String _demoOTP = '123456';

  bool get isAuthenticated => _isAuthenticated;
  bool get isLoading => _isLoading;
  bool get isDemoMode => _isDemoMode;

  Future<void> checkAuthStatus() async {
    _isLoading = true;
    notifyListeners();
    
    _isAuthenticated = await _authService.isLoggedIn();
    
    _isLoading = false;
    notifyListeners();
  }

  Future<bool> sendOtp(String phoneNumber, String patientNumber) async {
    _isLoading = true;
    notifyListeners();
    
    // Check if demo credentials
    if (phoneNumber == _demoPhone && patientNumber == _demoPatientNumber) {
      _isDemoMode = true;
      _isLoading = false;
      notifyListeners();
      return true;
    }
    
    final success = await _authService.sendOtp(phoneNumber, patientNumber);
    
    _isLoading = false;
    notifyListeners();
    
    return success;
  }

  Future<bool> verifyOtp(String phoneNumber, String patientNumber, String otp) async {
    _isLoading = true;
    notifyListeners();
    
    // Check if demo mode
    if (_isDemoMode && otp == _demoOTP) {
      _isAuthenticated = true;
      _isLoading = false;
      notifyListeners();
      return true;
    }
    
    final success = await _authService.verifyOtp(phoneNumber, patientNumber, otp);
    if (success) {
      _isAuthenticated = true;
    }
    
    _isLoading = false;
    notifyListeners();
    
    return success;
  }

  Future<void> logout() async {
    await _authService.logout();
    _isAuthenticated = false;
    _isDemoMode = false;
    notifyListeners();
  }
}
