import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';
import '../models/patient.dart';
import '../models/appointment.dart';
import '../models/visit.dart';
import '../models/bill.dart';
import '../services/api_service.dart';

import 'dart:async';

class PatientProvider with ChangeNotifier {
  Patient? _patient;
  List<Appointment> _appointments = [];
  List<Visit> _visits = [];
  List<Bill> _bills = [];

  // Per-resource loading states — granular so the UI can show targeted skeletons
  bool _isLoadingProfile = false;
  bool _isLoadingAppointments = false;
  bool _isLoadingVisits = false;
  bool _isLoadingBills = false;
  bool _isOffline = false;

  String? _error;

  // Cache timestamps for stale-while-revalidate
  DateTime? _profileFetchedAt;
  DateTime? _appointmentsFetchedAt;
  DateTime? _visitsFetchedAt;
  DateTime? _billsFetchedAt;

  // 5-minute TTL — data older than this triggers a background refresh
  static const _ttl = Duration(minutes: 5);

  // ── Getters ──────────────────────────────────────────────────────────────────
  Patient? get patient => _patient;
  List<Appointment> get appointments => _appointments;
  List<Visit> get visits => _visits;
  List<Bill> get bills => _bills;
  String? get error => _error;
  bool get isOffline => _isOffline;

  // Unified loading flag — true if ANY resource is loading (backward compat)
  bool get isLoading =>
      _isLoadingProfile ||
      _isLoadingAppointments ||
      _isLoadingVisits ||
      _isLoadingBills;

  bool get isLoadingProfile => _isLoadingProfile;
  bool get isLoadingAppointments => _isLoadingAppointments;
  bool get isLoadingVisits => _isLoadingVisits;
  bool get isLoadingBills => _isLoadingBills;

  bool _isStale(DateTime? ts) {
    if (ts == null) return true;
    return DateTime.now().difference(ts) > _ttl;
  }

  // ── fetchAll ─────────────────────────────────────────────────────────────────
  /// Runs all fetches in parallel. Use this at app boot for maximum speed.
  Future<void> fetchAll({bool forceRefresh = false}) async {
    // Fetches sequentially to avoid 4 concurrent requests timing out on weak networks
    await fetchProfile(forceRefresh: forceRefresh);
    await fetchAppointments(forceRefresh: forceRefresh);
    await fetchVisits(forceRefresh: forceRefresh);
    await fetchBills(forceRefresh: forceRefresh);
  }

  // ── fetchProfile ──────────────────────────────────────────────────────────────
  /// Strategy:
  ///  (1) If in-memory data is fresh — return immediately (instant).
  ///  (2) If in-memory data is stale — serve it instantly & refresh in background.
  ///  (3) If no in-memory data but SharedPreferences cache exists — hydrate from it
  ///      instantly, then kick off a background network refresh.
  ///  (4) No cache at all — blocking network fetch.
  Future<void> fetchProfile({bool forceRefresh = false}) async {
    if (!forceRefresh && _patient != null && !_isStale(_profileFetchedAt)) {
      return; // ① fresh, nothing to do
    }

    if (!forceRefresh && _patient != null && _isStale(_profileFetchedAt)) {
      _backgroundRefreshProfile(); // ② stale: serve existing, refresh silently
      return;
    }

    _isLoadingProfile = true;
    _error = null;
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      final cached = prefs.getString('patient_data');

      if (!forceRefresh && cached != null && _patient == null) {
        // ③ Hydrate from disk immediately
        _patient = _patientFromTransformed(
            jsonDecode(cached) as Map<String, dynamic>);
        _profileFetchedAt = DateTime.now();
        _isLoadingProfile = false;
        notifyListeners();
        _backgroundRefreshProfile(); // then update from network
        return;
      }

      // ④ Cold start / forced refresh
      await _networkFetchProfile();
      _isOffline = false;
    } catch (e) {
      if (e.toString().contains('SocketException') || e.toString().contains('Timeout')) {
        _error = 'Please check your internet connection.';
        _isOffline = true;
      } else {
        _error = e.toString();
      }
    }

    _isLoadingProfile = false;
    notifyListeners();
  }

  Future<void> _backgroundRefreshProfile() async {
    try {
      await _networkFetchProfile();
      _isOffline = false;
      notifyListeners();
    } catch (_) {
      _isOffline = true;
      notifyListeners();
    }
  }

  Future<void> _networkFetchProfile() async {
    final response = await ApiService.get(ApiConfig.profileEndpoint);
    final data = response['data'] as Map<String, dynamic>?;
    if (data != null) {
      _patient = Patient.fromJson(data);
      _profileFetchedAt = DateTime.now();
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('patient_data', jsonEncode(data));
      notifyListeners();
    }
  }

  // ── fetchAppointments ─────────────────────────────────────────────────────────
  Future<void> fetchAppointments({bool forceRefresh = false}) async {
    if (!forceRefresh && _appointments.isNotEmpty && !_isStale(_appointmentsFetchedAt)) {
      return;
    }

    if (!forceRefresh && _appointments.isNotEmpty && _isStale(_appointmentsFetchedAt)) {
      _backgroundRefreshAppointments();
      return;
    }

    _isLoadingAppointments = true;
    _error = null;
    notifyListeners();

    try {
      await _networkFetchAppointments();
      _isOffline = false;
    } catch (e) {
      if (e.toString().contains('SocketException') || e.toString().contains('Timeout')) {
        _error = 'Please check your internet connection.';
        _isOffline = true;
      } else {
        _error = e.toString();
      }
    }

    _isLoadingAppointments = false;
    notifyListeners();
  }

  Future<void> _backgroundRefreshAppointments() async {
    try {
      await _networkFetchAppointments();
      _isOffline = false;
      notifyListeners();
    } catch (_) {
      _isOffline = true;
      notifyListeners();
    }
  }

  Future<void> _networkFetchAppointments() async {
    // Securely hits the endpoint without exposing patient_id in query
    final endpoint = ApiConfig.appointmentsEndpoint;

    final response = await ApiService.get(endpoint);
    _appointments = (response['data'] as List)
        .map((json) => Appointment.fromJson(json))
        .toList();
    _appointmentsFetchedAt = DateTime.now();
    notifyListeners();
  }

  // ── fetchVisits ───────────────────────────────────────────────────────────────
  Future<void> fetchVisits({bool forceRefresh = false}) async {
    if (!forceRefresh && _visits.isNotEmpty && !_isStale(_visitsFetchedAt)) {
      return;
    }

    if (!forceRefresh && _visits.isNotEmpty && _isStale(_visitsFetchedAt)) {
      _backgroundRefreshVisits();
      return;
    }

    _isLoadingVisits = true;
    _error = null;
    notifyListeners();

    try {
      await _networkFetchVisits();
      _isOffline = false;
    } catch (e) {
      if (e.toString().contains('SocketException') || e.toString().contains('Timeout')) {
        _error = 'Please check your internet connection.';
        _isOffline = true;
      } else {
        _error = e.toString();
      }
    }

    _isLoadingVisits = false;
    notifyListeners();
  }

  Future<void> _backgroundRefreshVisits() async {
    try {
      await _networkFetchVisits();
      _isOffline = false;
      notifyListeners();
    } catch (_) {
      _isOffline = true;
      notifyListeners();
    }
  }

  Future<void> _networkFetchVisits() async {
    final endpoint = ApiConfig.visitsEndpoint;

    final response = await ApiService.get(endpoint);
    _visits = (response['data'] as List)
        .map((json) => Visit.fromJson(json))
        .toList();
    _visitsFetchedAt = DateTime.now();
    notifyListeners();
  }

  // ── fetchBills ────────────────────────────────────────────────────────────────
  Future<void> fetchBills({bool forceRefresh = false}) async {
    if (!forceRefresh && _bills.isNotEmpty && !_isStale(_billsFetchedAt)) {
      return;
    }

    if (!forceRefresh && _bills.isNotEmpty && _isStale(_billsFetchedAt)) {
      _backgroundRefreshBills();
      return;
    }

    _isLoadingBills = true;
    _error = null;
    notifyListeners();

    try {
      await _networkFetchBills();
      _isOffline = false;
    } catch (e) {
      if (e.toString().contains('SocketException') || e.toString().contains('Timeout')) {
        _error = 'Please check your internet connection.';
        _isOffline = true;
      } else {
        _error = e.toString();
      }
    }

    _isLoadingBills = false;
    notifyListeners();
  }

  Future<void> _backgroundRefreshBills() async {
    try {
      await _networkFetchBills();
      _isOffline = false;
      notifyListeners();
    } catch (_) {
      _isOffline = true;
      notifyListeners();
    }
  }

  Future<void> _networkFetchBills() async {
    final endpoint = ApiConfig.billsEndpoint;

    final response = await ApiService.get(endpoint);
    _bills = (response['data'] as List)
        .map((json) => Bill.fromJson(json))
        .toList();
    _billsFetchedAt = DateTime.now();
    notifyListeners();
  }

  // ── updateProfile ─────────────────────────────────────────────────────────────
  Future<bool> updateProfile(Map<String, dynamic> data) async {
    _isLoadingProfile = true;
    _error = null;
    notifyListeners();

    try {
      final response = await ApiService.put(ApiConfig.profileEndpoint, data);
      final responseData = response['data'] as Map<String, dynamic>?;
      if (responseData != null) {
        _patient = Patient.fromJson(responseData);
        _profileFetchedAt = DateTime.now();
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('patient_data', jsonEncode(responseData));
      }
      _isLoadingProfile = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _isLoadingProfile = false;
      notifyListeners();
      return false;
    }
  }

  // ── clearPatient ──────────────────────────────────────────────────────────────
  /// Call on logout to wipe all in-memory and disk data.
  Future<void> clearPatient() async {
    _patient = null;
    _appointments = [];
    _visits = [];
    _bills = [];
    _error = null;
    _profileFetchedAt = null;
    _appointmentsFetchedAt = null;
    _visitsFetchedAt = null;
    _billsFetchedAt = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('patient_data');
    notifyListeners();
  }

  // ── Helpers ───────────────────────────────────────────────────────────────────
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
      chronicConditions:
          _parseConditions(t['chronicConditions'] ?? t['chronic_conditions']),
    );
  }

  List<Allergy> _parseAllergies(dynamic raw) {
    if (raw == null) return [];
    if (raw is List) {
      return raw.map((e) {
        if (e is String) {
          return Allergy(allergyId: '', allergyName: e, severity: '');
        }
        return Allergy.fromJson(e as Map<String, dynamic>);
      }).toList();
    }
    return [];
  }

  List<ChronicCondition> _parseConditions(dynamic raw) {
    if (raw == null) return [];
    if (raw is List) {
      return raw.map((e) {
        if (e is String) {
          return ChronicCondition(
              conditionId: '', conditionName: e, diagnosedDate: '');
        }
        return ChronicCondition.fromJson(e as Map<String, dynamic>);
      }).toList();
    }
    return [];
  }
}
