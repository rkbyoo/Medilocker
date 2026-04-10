import 'package:flutter/material.dart';
import '../config/api_config.dart';
import '../models/patient.dart';
import '../models/appointment.dart';
import '../models/visit.dart';
import '../models/bill.dart';
import '../services/api_service.dart';

class PatientProvider with ChangeNotifier {
  Patient? _patient;
  List<Appointment> _appointments = [];
  List<Visit> _visits = [];
  List<Bill> _bills = [];
  bool _isLoading = false;
  String? _error;
  bool _isDemoMode = false;

  Patient? get patient => _patient;
  List<Appointment> get appointments => _appointments;
  List<Visit> get visits => _visits;
  List<Bill> get bills => _bills;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isDemoMode => _isDemoMode;

  void setDemoMode(bool isDemo) {
    _isDemoMode = isDemo;
    if (isDemo) {
      // Load demo data - simplified for now
      _patient = null; // Will be loaded when needed
      _appointments = [];
      _visits = [];
      _bills = [];
    }
    notifyListeners();
  }

  void loadDemoData() {
    // Simplified - just set demo mode flag
    notifyListeners();
  }

  Future<void> fetchProfile() async {
    if (_isDemoMode) {
      // Demo mode - set null for now
      _patient = null;
      notifyListeners();
      return;
    }

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await ApiService.get(ApiConfig.profileEndpoint);
      _patient = Patient.fromJson(response['data']);
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> fetchAppointments() async {
    if (_isDemoMode) {
      _appointments = [];
      notifyListeners();
      return;
    }

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await ApiService.get(ApiConfig.appointmentsEndpoint);
      _appointments = (response['data'] as List)
          .map((json) => Appointment.fromJson(json))
          .toList();
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> fetchVisits() async {
    if (_isDemoMode) {
      _visits = [];
      notifyListeners();
      return;
    }

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await ApiService.get(ApiConfig.visitsEndpoint);
      _visits = (response['data'] as List)
          .map((json) => Visit.fromJson(json))
          .toList();
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> fetchBills() async {
    if (_isDemoMode) {
      _bills = [];
      notifyListeners();
      return;
    }

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await ApiService.get(ApiConfig.billsEndpoint);
      _bills = (response['data'] as List)
          .map((json) => Bill.fromJson(json))
          .toList();
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<bool> updateProfile(Map<String, dynamic> data) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await ApiService.put(ApiConfig.profileEndpoint, data);
      _patient = Patient.fromJson(response['data']);
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }
}
