# MediLocker Flutter App - Architecture Guide

## 🗺️ Quick Navigation: Where is Everything?

### 📍 **API Logic Location**

All API-related code is in the `lib/core/` directory:

```
lib/core/
├── config/
│   └── api_config.dart          ← API ENDPOINTS DEFINED HERE
├── services/
│   ├── api_service.dart         ← HTTP CLIENT (GET, POST, PUT, DELETE)
│   └── auth_service.dart        ← AUTHENTICATION API CALLS
└── providers/
    ├── auth_provider.dart       ← AUTH STATE + API INTEGRATION
    └── patient_provider.dart    ← PATIENT DATA + API INTEGRATION
```

#### **1. API Configuration** 
**File:** `lib/core/config/api_config.dart`

This is where ALL API endpoints are defined:

```dart
class ApiConfig {
  static const baseUrl = 'http://localhost:3000/api';
  static const mobileBaseUrl = '$baseUrl/mobile';
  
  // All endpoints defined here
  static const sendOtpEndpoint = '$mobileBaseUrl/auth/send-otp';
  static const verifyOtpEndpoint = '$mobileBaseUrl/auth/verify-otp';
  static const profileEndpoint = '$mobileBaseUrl/patient/profile';
  // ... more endpoints
}
```

**To change the server URL:** Edit the `baseUrl` constant in this file.

---

#### **2. HTTP Client** 
**File:** `lib/core/services/api_service.dart`

This is the HTTP client that makes all API calls:

```dart
class ApiService {
  // GET request
  static Future<dynamic> get(String endpoint)
  
  // POST request
  static Future<dynamic> post(String endpoint, Map<String, dynamic> body)
  
  // PUT request
  static Future<dynamic> put(String endpoint, Map<String, dynamic> body)
  
  // DELETE request
  static Future<dynamic> delete(String endpoint)
}
```

**Features:**
- Automatically adds authentication token to headers
- Handles JSON encoding/decoding
- Error handling
- Response parsing

**Example Usage:**
```dart
// In any service file
final response = await ApiService.get(ApiConfig.profileEndpoint);
final data = await ApiService.post(ApiConfig.sendOtpEndpoint, {
  'phone_number': phone,
  'patient_number': patientId,
});
```

---

#### **3. Authentication Service**
**File:** `lib/core/services/auth_service.dart`

Handles all authentication-related API calls:

```dart
class AuthService {
  Future<bool> sendOtp(String phoneNumber, String patientNumber)
  Future<bool> verifyOtp(String phoneNumber, String patientNumber, String otp)
  Future<void> logout()
  Future<bool> isLoggedIn()
}
```

**What it does:**
- Calls authentication endpoints
- Stores/retrieves auth tokens
- Manages login state

---

#### **4. State Management with API Integration**

**File:** `lib/core/providers/auth_provider.dart`

Manages authentication state and connects UI to API:

```dart
class AuthProvider with ChangeNotifier {
  // State
  bool _isAuthenticated = false;
  bool _isLoading = false;
  
  // API Methods
  Future<bool> sendOtp(String phoneNumber, String patientNumber) {
    // Calls AuthService.sendOtp()
    // Updates UI state
  }
  
  Future<bool> verifyOtp(...) {
    // Calls AuthService.verifyOtp()
    // Updates authentication state
  }
}
```

**File:** `lib/core/providers/patient_provider.dart`

Manages patient data and connects UI to API:

```dart
class PatientProvider with ChangeNotifier {
  // State
  Patient? _patient;
  List<Appointment> _appointments = [];
  List<Visit> _visits = [];
  List<Bill> _bills = [];
  
  // API Methods
  Future<void> fetchProfile() {
    // Calls ApiService.get(ApiConfig.profileEndpoint)
    // Updates _patient state
  }
  
  Future<void> fetchAppointments() {
    // Calls ApiService.get(ApiConfig.appointmentsEndpoint)
    // Updates _appointments state
  }
  
  Future<void> fetchVisits() {
    // Calls ApiService.get(ApiConfig.visitsEndpoint)
    // Updates _visits state
  }
  
  Future<void> fetchBills() {
    // Calls ApiService.get(ApiConfig.billsEndpoint)
    // Updates _bills state
  }
}
```

---

### 📍 **UI Location**

All UI code is in the `lib/screens/` directory:

```
lib/screens/
├── auth/
│   ├── login_screen.dart        ← LOGIN PAGE (Phone + Patient ID)
│   └── otp_screen.dart          ← OTP VERIFICATION PAGE
├── home/
│   ├── main_screen.dart         ← BOTTOM NAVIGATION WRAPPER
│   └── dashboard_screen.dart    ← HOME/DASHBOARD PAGE
├── appointments/
│   └── appointments_screen.dart ← APPOINTMENTS LIST PAGE
├── records/
│   └── records_screen.dart      ← MEDICAL RECORDS PAGE
├── bills/
│   └── bills_screen.dart        ← BILLS LIST PAGE
├── emergency/
│   └── emergency_screen.dart    ← EMERGENCY INFO PAGE
└── profile/
    └── profile_screen.dart      ← USER PROFILE PAGE
```

---

## 🔄 Data Flow: How API Connects to UI

### **Example: Login Flow**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER ENTERS PHONE + PATIENT ID                          │
│    File: lib/screens/auth/login_screen.dart                │
│    Widget: LoginScreen                                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓ User taps "Send OTP"
┌─────────────────────────────────────────────────────────────┐
│ 2. UI CALLS PROVIDER                                        │
│    authProvider.sendOtp(phone, patientId)                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. PROVIDER CALLS SERVICE                                   │
│    File: lib/core/providers/auth_provider.dart             │
│    Method: sendOtp()                                        │
│    → Calls AuthService.sendOtp()                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. SERVICE MAKES API CALL                                   │
│    File: lib/core/services/auth_service.dart               │
│    → ApiService.post(ApiConfig.sendOtpEndpoint, data)      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. HTTP CLIENT SENDS REQUEST                                │
│    File: lib/core/services/api_service.dart                │
│    → POST http://localhost:3000/api/mobile/auth/send-otp   │
│    → Headers: Content-Type: application/json               │
│    → Body: { phone_number, patient_number }                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓ Backend processes request
┌─────────────────────────────────────────────────────────────┐
│ 6. RESPONSE RECEIVED                                        │
│    → Success: { success: true, message: "OTP sent" }       │
│    → Error: { success: false, error: "..." }               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. PROVIDER UPDATES STATE                                   │
│    → _isLoading = false                                     │
│    → notifyListeners() (triggers UI rebuild)               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. UI UPDATES                                               │
│    → Navigate to OTP screen (if success)                   │
│    → Show error message (if failed)                        │
└─────────────────────────────────────────────────────────────┘
```

---

### **Example: Fetching Patient Profile**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER LOGS IN SUCCESSFULLY                                │
│    File: lib/screens/home/main_screen.dart                 │
│    Widget: MainScreen (initState)                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. FETCH PATIENT DATA                                       │
│    patientProvider.fetchProfile()                          │
│    patientProvider.fetchAppointments()                     │
│    patientProvider.fetchVisits()                           │
│    patientProvider.fetchBills()                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. PROVIDER MAKES API CALLS                                 │
│    File: lib/core/providers/patient_provider.dart          │
│    → ApiService.get(ApiConfig.profileEndpoint)             │
│    → ApiService.get(ApiConfig.appointmentsEndpoint)        │
│    → ApiService.get(ApiConfig.visitsEndpoint)              │
│    → ApiService.get(ApiConfig.billsEndpoint)               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. HTTP CLIENT ADDS AUTH TOKEN                              │
│    File: lib/core/services/api_service.dart                │
│    → Gets token from SharedPreferences                     │
│    → Adds to headers: Authorization: Bearer <token>        │
│    → GET http://localhost:3000/api/mobile/patient/profile  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓ Backend validates token & returns data
┌─────────────────────────────────────────────────────────────┐
│ 5. RESPONSE PARSED TO MODEL                                 │
│    → JSON response converted to Patient object             │
│    → Patient.fromJson(response['data'])                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. PROVIDER UPDATES STATE                                   │
│    → _patient = Patient.fromJson(...)                      │
│    → _appointments = [...]                                  │
│    → _isLoading = false                                     │
│    → notifyListeners()                                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. UI REBUILDS WITH DATA                                    │
│    → Dashboard shows patient name                          │
│    → Appointments list populated                           │
│    → Profile screen shows details                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 How to Add a New Feature

### **Example: Add "Lab Reports" Feature**

#### **Step 1: Define API Endpoint**

**File:** `lib/core/config/api_config.dart`

```dart
class ApiConfig {
  // ... existing endpoints
  
  // Add new endpoint
  static const labReportsEndpoint = '$mobileBaseUrl/lab-reports';
}
```

---

#### **Step 2: Create Data Model**

**File:** `lib/core/models/lab_report.dart` (create new file)

```dart
class LabReport {
  final String reportId;
  final String testName;
  final String reportDate;
  final String pdfUrl;
  final String status;

  LabReport({
    required this.reportId,
    required this.testName,
    required this.reportDate,
    required this.pdfUrl,
    required this.status,
  });

  factory LabReport.fromJson(Map<String, dynamic> json) {
    return LabReport(
      reportId: json['report_id'] ?? '',
      testName: json['test_name'] ?? '',
      reportDate: json['report_date'] ?? '',
      pdfUrl: json['pdf_url'] ?? '',
      status: json['status'] ?? '',
    );
  }
}
```

---

#### **Step 3: Add to Provider**

**File:** `lib/core/providers/patient_provider.dart`

```dart
class PatientProvider with ChangeNotifier {
  // ... existing state
  
  // Add new state
  List<LabReport> _labReports = [];
  List<LabReport> get labReports => _labReports;
  
  // Add new method
  Future<void> fetchLabReports() async {
    if (_isDemoMode) {
      _labReports = [];
      notifyListeners();
      return;
    }

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await ApiService.get(ApiConfig.labReportsEndpoint);
      _labReports = (response['data'] as List)
          .map((json) => LabReport.fromJson(json))
          .toList();
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }
}
```

---

#### **Step 4: Create UI Screen**

**File:** `lib/screens/lab_reports/lab_reports_screen.dart` (create new file)

```dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/providers/patient_provider.dart';

class LabReportsScreen extends StatefulWidget {
  const LabReportsScreen({super.key});

  @override
  State<LabReportsScreen> createState() => _LabReportsScreenState();
}

class _LabReportsScreenState extends State<LabReportsScreen> {
  @override
  void initState() {
    super.initState();
    // Fetch data when screen loads
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<PatientProvider>().fetchLabReports();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Lab Reports'),
      ),
      body: Consumer<PatientProvider>(
        builder: (context, provider, _) {
          // Show loading
          if (provider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }
          
          // Show error
          if (provider.error != null) {
            return Center(child: Text('Error: ${provider.error}'));
          }
          
          // Show empty state
          if (provider.labReports.isEmpty) {
            return const Center(child: Text('No lab reports found'));
          }
          
          // Show list
          return ListView.builder(
            itemCount: provider.labReports.length,
            itemBuilder: (context, index) {
              final report = provider.labReports[index];
              return ListTile(
                title: Text(report.testName),
                subtitle: Text(report.reportDate),
                trailing: const Icon(Icons.arrow_forward_ios),
                onTap: () {
                  // Open PDF viewer
                },
              );
            },
          );
        },
      ),
    );
  }
}
```

---

#### **Step 5: Add Navigation**

**File:** `lib/screens/home/dashboard_screen.dart`

```dart
// In the Quick Actions grid
_buildActionCard(
  context,
  icon: Icons.science,
  title: 'Lab Reports',
  color: AppColors.primary,
  onTap: () {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const LabReportsScreen()),
    );
  },
),
```

---

## 🔍 Finding Specific Code

### **"Where do I change the login UI?"**
→ `lib/screens/auth/login_screen.dart`

### **"Where do I add a new API endpoint?"**
→ `lib/core/config/api_config.dart`

### **"Where do I change the server URL?"**
→ `lib/core/config/api_config.dart` (line 2: `baseUrl`)

### **"Where is the HTTP client?"**
→ `lib/core/services/api_service.dart`

### **"Where do I add authentication logic?"**
→ `lib/core/services/auth_service.dart` (API calls)
→ `lib/core/providers/auth_provider.dart` (state management)

### **"Where do I fetch patient data?"**
→ `lib/core/providers/patient_provider.dart`

### **"Where are the data models?"**
→ `lib/core/models/` directory

### **"Where do I change colors?"**
→ `lib/core/constants/app_colors.dart`

### **"Where do I change text strings?"**
→ `lib/core/constants/app_strings.dart`

### **"Where is the bottom navigation?"**
→ `lib/screens/home/main_screen.dart`

### **"Where is the dashboard/home screen?"**
→ `lib/screens/home/dashboard_screen.dart`

---

## 📊 File Size Reference

### **Small Files (< 100 lines)**
- Models: `lib/core/models/*.dart`
- Config: `lib/core/config/*.dart`
- Constants: `lib/core/constants/*.dart`

### **Medium Files (100-300 lines)**
- Services: `lib/core/services/*.dart`
- Providers: `lib/core/providers/*.dart`
- Simple screens: `lib/screens/auth/*.dart`

### **Large Files (300+ lines)**
- Complex screens: `lib/screens/home/dashboard_screen.dart`
- Main navigation: `lib/screens/home/main_screen.dart`

---

## 🎨 UI Component Hierarchy

```
main.dart (App Entry)
└── MyHealthApp (MaterialApp)
    └── AuthWrapper (Checks login status)
        ├── LoginScreen (if not logged in)
        │   └── OtpScreen (after sending OTP)
        │
        └── MainScreen (if logged in)
            └── BottomNavigationBar (5 tabs)
                ├── DashboardScreen (Home)
                ├── AppointmentsScreen
                ├── EmergencyScreen
                ├── RecordsScreen
                └── ProfileScreen
```

---

## 🔐 Authentication Flow

```
1. User opens app
   → AuthWrapper checks SharedPreferences for token
   
2. No token found
   → Show LoginScreen
   
3. User enters phone + patient ID
   → AuthProvider.sendOtp()
   → AuthService.sendOtp()
   → ApiService.post(sendOtpEndpoint)
   
4. OTP sent successfully
   → Navigate to OtpScreen
   
5. User enters OTP
   → AuthProvider.verifyOtp()
   → AuthService.verifyOtp()
   → ApiService.post(verifyOtpEndpoint)
   
6. OTP verified
   → Save token to SharedPreferences
   → Set isAuthenticated = true
   → Navigate to MainScreen
   
7. Token saved
   → All future API calls include token in headers
   → ApiService.getHeaders() adds: Authorization: Bearer <token>
```

---

## 📝 Summary

### **API Logic is in:**
- `lib/core/config/api_config.dart` - Endpoints
- `lib/core/services/api_service.dart` - HTTP client
- `lib/core/services/auth_service.dart` - Auth API calls
- `lib/core/providers/*.dart` - State + API integration

### **UI is in:**
- `lib/screens/` - All screen files
- `lib/main.dart` - App entry point

### **Data Models are in:**
- `lib/core/models/` - Patient, Appointment, Visit, Bill, etc.

### **Constants are in:**
- `lib/core/constants/` - Colors, strings, etc.

---

**This guide should help you quickly navigate the codebase and understand where everything is located!**
