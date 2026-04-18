import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
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

  Patient? get patient => _patient;
  List<Appointment> get appointments => _appointments;
  List<Visit> get visits => _visits;
  List<Bill> get bills => _bills;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // ---------------------------------------------------------------------------
  // Load patient from the data persisted during OTP verification
  // (falls back to a network call if not cached)
  // ---------------------------------------------------------------------------
  Future<void> fetchProfile() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // 1. Try cached patient data first (set during OTP verify)
      final prefs = await SharedPreferences.getInstance();
      final cached = prefs.getString('patient_data');
      if (cached != null) {
        final json = jsonDecode(cached) as Map<String, dynamic>;
        _patient = _patientFromTransformed(json);
        _isLoading = false;
        notifyListeners();
        return;
      }

      // 2. Fallback: fetch from API
      final response = await ApiService.get(ApiConfig.profileEndpoint);
      final data = response['data'] as Map<String, dynamic>?;
      if (data != null) {
        _patient = Patient.fromJson(data);
        // Cache it
        await prefs.setString('patient_data', jsonEncode(data));
      }
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  /// Clears cached patient data (call on logout)
  Future<void> clearPatient() async {
    _patient = null;
    _appointments = [];
    _visits = [];
    _bills = [];
    _error = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('patient_data');
    notifyListeners();
  }

  Future<void> fetchAppointments() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final endpoint = _patient != null 
          ? '${ApiConfig.appointmentsEndpoint}?patient_id=${_patient!.patientId}'
          : ApiConfig.appointmentsEndpoint;
      final response = await ApiService.get(endpoint);
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
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final endpoint = _patient != null 
          ? '${ApiConfig.visitsEndpoint}?patient_id=${_patient!.patientId}'
          : ApiConfig.visitsEndpoint;
      final response = await ApiService.get(endpoint);
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
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final endpoint = _patient != null 
          ? '${ApiConfig.billsEndpoint}?patient_id=${_patient!.patientId}'
          : ApiConfig.billsEndpoint;
      final response = await ApiService.get(endpoint);
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
      final responseData = response['data'] as Map<String, dynamic>?;
      if (responseData != null) {
        _patient = Patient.fromJson(responseData);
        // Update cache
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('patient_data', jsonEncode(responseData));
      }
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

  // ---------------------------------------------------------------------------
  // Helper: converts the server's "transformed" patient format
  // (camelCase keys from PatientService.transformPatient) into a Patient model.
  // ---------------------------------------------------------------------------
  Patient _patientFromTransformed(Map<String, dynamic> t) {
    return Patient(
      patientId: t['patientId'] ?? t['patient_id'] ?? '',
      patientNumber: t['patientNumber'] ?? t['patient_number'] ?? '',
      userId: t['userId'] ?? t['user_id'] ?? '',
      name: t['name'] ?? '',
      dob: t['dateOfBirth'] ?? t['dob'] ?? '',
      gender: t['gender'] ?? '',
      bloodGroup: t['bloodGroup'] ?? t['blood_group'] ?? '',
      phoneNumber: t['phoneNumber'] ?? t['phone_number'] ?? '',
      address: t['address'] ?? '',
      emergencyContactName:
          t['emergencyContactName'] ?? t['emergency_contact_name'] ?? '',
      emergencyContactNumber:
          t['emergencyContactNumber'] ?? t['emergency_contact_number'] ?? '',
      guardianPhone: t['guardianPhone'] ?? t['guardian_phone'] ?? '',
      maritalStatus: t['maritalStatus'] ?? t['marital_status'] ?? '',
      spouseName: t['spouseName'] ?? t['spouse_name'],
      caste: t['caste'],
      religion: t['religion'],
      nationality: t['nationality'] ?? '',
      nfcCardLinked: t['nfcCardLinked'] ?? t['nfc_card_linked'] ?? false,
      allergies: _parseAllergies(t['allergies']),
      chronicConditions: _parseConditions(t['chronicConditions'] ?? t['chronic_conditions']),
    );
  }

  List<Allergy> _parseAllergies(dynamic raw) {
    if (raw == null) return [];
    if (raw is List) {
      return raw.map((e) {
        if (e is String) return Allergy(allergyId: '', allergyName: e, severity: '');
        return Allergy.fromJson(e as Map<String, dynamic>);
      }).toList();
    }
    return [];
  }

  List<ChronicCondition> _parseConditions(dynamic raw) {
    if (raw == null) return [];
    if (raw is List) {
      return raw.map((e) {
        if (e is String) return ChronicCondition(conditionId: '', conditionName: e, diagnosedDate: '');
        return ChronicCondition.fromJson(e as Map<String, dynamic>);
      }).toList();
    }
    return [];
  }
}
