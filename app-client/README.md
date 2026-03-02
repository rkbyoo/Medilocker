# MediLocker Mobile App (Flutter)

A comprehensive mobile application for patients to access their medical records, manage appointments, view bills, and handle emergency situations. Built with Flutter for cross-platform support (Android, iOS, Web).

---

## 📱 Overview

MediLocker is a patient-facing mobile application that provides secure access to:
- Personal health records and medical history
- Appointment scheduling and management
- Medical bills and payment tracking
- Emergency contact and information
- Visit history and prescriptions
- Lab reports and medical documents

---

## 🏗️ Project Structure

```
app-client/
├── lib/
│   ├── core/                      # Core functionality and shared code
│   │   ├── config/               # Configuration files
│   │   │   └── api_config.dart   # API endpoints configuration
│   │   ├── constants/            # App-wide constants
│   │   │   ├── app_colors.dart   # Color palette
│   │   │   └── app_strings.dart  # Text strings
│   │   ├── models/               # Data models
│   │   │   ├── patient.dart      # Patient data model
│   │   │   ├── appointment.dart  # Appointment model
│   │   │   ├── visit.dart        # Visit/consultation model
│   │   │   └── bill.dart         # Billing model
│   │   ├── providers/            # State management (Provider pattern)
│   │   │   ├── auth_provider.dart    # Authentication state
│   │   │   └── patient_provider.dart # Patient data state
│   │   └── services/             # Business logic and API calls
│   │       ├── api_service.dart      # HTTP client wrapper
│   │       ├── auth_service.dart     # Authentication logic
│   │       └── demo_data_service.dart # Demo/mock data
│   ├── screens/                  # UI screens
│   │   ├── auth/                 # Authentication screens
│   │   │   ├── login_screen.dart     # Phone + Patient ID login
│   │   │   └── otp_screen.dart       # OTP verification
│   │   ├── home/                 # Home/Dashboard screens
│   │   │   ├── main_screen.dart      # Bottom navigation wrapper
│   │   │   └── dashboard_screen.dart # Main dashboard
│   │   ├── appointments/         # Appointment management
│   │   │   └── appointments_screen.dart
│   │   ├── records/              # Medical records
│   │   │   └── records_screen.dart
│   │   ├── bills/                # Billing screens
│   │   │   └── bills_screen.dart
│   │   ├── emergency/            # Emergency information
│   │   │   └── emergency_screen.dart
│   │   └── profile/              # User profile
│   │       └── profile_screen.dart
│   └── main.dart                 # App entry point
├── android/                      # Android-specific code
├── ios/                          # iOS-specific code
├── web/                          # Web-specific code
├── assets/                       # Images, icons, fonts
├── pubspec.yaml                  # Dependencies and configuration
└── README.md                     # This file
```

---

## 🎨 Architecture Overview

### **Architecture Pattern: Provider (State Management)**

The app follows a clean architecture with separation of concerns:

```
┌─────────────────────────────────────────────────┐
│                   UI Layer                      │
│              (Screens/Widgets)                  │
└────────────────┬────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────┐
│              State Management                   │
│         (Providers - ChangeNotifier)            │
│  • AuthProvider                                 │
│  • PatientProvider                              │
└────────────────┬────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────┐
│              Business Logic                     │
│                (Services)                       │
│  • AuthService                                  │
│  • ApiService                                   │
└────────────────┬────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────┐
│              Data Layer                         │
│         (Models + API/Storage)                  │
│  • Patient, Appointment, Visit, Bill models     │
│  • HTTP requests to backend                     │
│  • SharedPreferences for local storage          │
└─────────────────────────────────────────────────┘
```

---

## 🔌 API Integration

### **API Configuration**

Location: `lib/core/config/api_config.dart`

```dart
Base URL: http://localhost:3000/api/mobile
```

### **API Endpoints**

#### Authentication
- `POST /auth/validate` - Validate patient credentials
- `POST /auth/send-otp` - Send OTP to phone
- `POST /auth/verify-otp` - Verify OTP and login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user

#### Patient Profile
- `GET /patient/profile` - Get patient profile
- `PUT /patient/profile` - Update patient profile
- `GET /patient/allergies` - Get patient allergies
- `GET /patient/conditions` - Get chronic conditions

#### Appointments
- `GET /appointments` - List all appointments
- `POST /appointments` - Book new appointment
- `GET /appointments/slots` - Get available slots
- `PUT /appointments/:id` - Update appointment
- `DELETE /appointments/:id` - Cancel appointment

#### Visits
- `GET /visits` - List all visits/consultations
- `GET /visits/:id` - Get visit details
- `GET /visits/:id/prescription` - Get prescription

#### Bills
- `GET /bills` - List all bills
- `GET /bills/:id` - Get bill details
- `POST /bills/:id/pay` - Make payment

#### Notifications
- `GET /notifications` - Get notifications
- `PUT /notifications/:id/read` - Mark as read

### **API Service Implementation**

Location: `lib/core/services/api_service.dart`

The `ApiService` class handles all HTTP requests:

```dart
// GET request
ApiService.get(endpoint)

// POST request
ApiService.post(endpoint, body)

// PUT request
ApiService.put(endpoint, body)

// DELETE request
ApiService.delete(endpoint)
```

**Features:**
- Automatic token injection from SharedPreferences
- JSON encoding/decoding
- Error handling
- Response parsing

---

## 🎯 State Management (Provider Pattern)

### **AuthProvider**

Location: `lib/core/providers/auth_provider.dart`

**Responsibilities:**
- Manage authentication state
- Handle login/logout
- Store authentication tokens
- Demo mode support

**Key Methods:**
```dart
checkAuthStatus()           // Check if user is logged in
sendOtp(phone, patientId)   // Send OTP
verifyOtp(phone, id, otp)   // Verify OTP and login
logout()                    // Logout user
```

**State:**
```dart
bool isAuthenticated        // Login status
bool isLoading             // Loading state
bool isDemoMode            // Demo mode flag
```

### **PatientProvider**

Location: `lib/core/providers/patient_provider.dart`

**Responsibilities:**
- Manage patient data
- Fetch appointments, visits, bills
- Update profile
- Handle demo data

**Key Methods:**
```dart
fetchProfile()              // Get patient profile
fetchAppointments()         // Get appointments
fetchVisits()              // Get visit history
fetchBills()               // Get bills
updateProfile(data)        // Update profile
setDemoMode(bool)          // Enable demo mode
```

**State:**
```dart
Patient? patient           // Patient profile
List<Appointment> appointments
List<Visit> visits
List<Bill> bills
bool isLoading
String? error
```

---

## 📊 Data Models

### **Patient Model**

Location: `lib/core/models/patient.dart`

```dart
class Patient {
  String patientId
  String patientNumber       // 10-digit unique ID
  String name
  String dob                 // Date of birth
  String gender
  String bloodGroup
  String phoneNumber
  String address
  String emergencyContactName
  String emergencyContactNumber
  String maritalStatus
  bool nfcCardLinked
  List<Allergy> allergies
  List<ChronicCondition> chronicConditions
}
```

### **Appointment Model**

Location: `lib/core/models/appointment.dart`

```dart
class Appointment {
  String appointmentId
  String patientId
  String scheduledDateTime
  String status              // SCHEDULED, CONFIRMED, COMPLETED, CANCELLED
  String department
  String reason
  Doctor doctor
  Hospital hospital
}
```

### **Visit Model**

Location: `lib/core/models/visit.dart`

```dart
class Visit {
  String visitId
  String patientId
  String visitDate
  String chiefComplaint
  String diagnosis
  String treatment
  List<Prescription> prescriptions
  List<Report> reports
  Doctor doctor
}
```

### **Bill Model**

Location: `lib/core/models/bill.dart`

```dart
class Bill {
  String billId
  String visitId
  double totalAmount
  double paidAmount
  double dueAmount
  String status              // PENDING, PAID, PARTIALLY_PAID
  String generatedDate
  String? paidDate
  List<BillItem> items
}
```

---

## 🖼️ UI Screens

### **1. Authentication Flow**

#### Login Screen (`screens/auth/login_screen.dart`)
- Phone number input (+91 prefix)
- Patient number input (10 digits)
- Send OTP button
- Form validation
- Demo mode support (9876543210 / 1234567890)

#### OTP Screen (`screens/auth/otp_screen.dart`)
- 6-digit OTP input
- Verify button
- Resend OTP option
- Auto-navigation on success

### **2. Main Navigation**

#### Main Screen (`screens/home/main_screen.dart`)
- Bottom navigation bar with 5 tabs:
  1. Home (Dashboard)
  2. Appointments
  3. Emergency (center, larger icon)
  4. Records
  5. Profile

### **3. Dashboard Screen**

#### Dashboard (`screens/home/dashboard_screen.dart`)

**Components:**
- **Summary Cards** (Horizontal scroll)
  - Next Appointment
  - Recent Visit
  - Pending Bills
  
- **Quick Actions Grid** (2x2)
  - Book Appointment
  - Medical Records
  - My Bills
  - Emergency

- **Recent Activity List**
  - Lab reports
  - Appointment confirmations
  - Bill notifications

### **4. Appointments Screen**

#### Appointments (`screens/appointments/appointments_screen.dart`)

**Features:**
- Tab view: Upcoming / Past
- Appointment cards showing:
  - Doctor name
  - Department
  - Hospital
  - Date/Time
  - Status badge
- Add appointment button
- Filter and search

### **5. Records Screen**

#### Medical Records (`screens/records/records_screen.dart`)

**Features:**
- Visit history list
- Prescription viewer
- Lab reports (PDF viewer)
- Download/share options
- Search and filter

### **6. Bills Screen**

#### Bills (`screens/bills/bills_screen.dart`)

**Features:**
- Bill list with status
- Payment history
- Download invoice
- Pay now button
- Filter by status

### **7. Emergency Screen**

#### Emergency (`screens/emergency/emergency_screen.dart`)

**Features:**
- Emergency contact display
- Quick call buttons
- Blood group and allergies
- Medical conditions
- Hospital location
- Ambulance call

### **8. Profile Screen**

#### Profile (`screens/profile/profile_screen.dart`)

**Features:**
- Patient information
- Edit profile
- NFC card status
- Settings
- Logout button

---

## 🎨 Design System

### **Colors**

Location: `lib/core/constants/app_colors.dart`

```dart
Primary: #2563EB (Blue)
Success: #10B981 (Green)
Warning: #F59E0B (Orange)
Error: #EF4444 (Red)
Emergency: #DC2626 (Dark Red)
Background: #F3F4F6 (Light Gray)
```

### **Typography**

- Headlines: Bold, 24-32px
- Titles: Semi-bold, 18-20px
- Body: Regular, 14-16px
- Captions: Regular, 12px

### **Components**

- **Cards**: White background, 12px border radius, subtle shadow
- **Buttons**: Primary color, 12px border radius, 50px height
- **Input Fields**: White background, 12px border radius, outlined
- **Bottom Navigation**: Fixed, 5 items, icon + label

---

## 📦 Dependencies

### **Core Dependencies**

```yaml
# UI
cupertino_icons: ^1.0.8        # iOS-style icons
google_fonts: ^6.1.0           # Custom fonts

# State Management
provider: ^6.1.1               # State management

# Network
http: ^1.2.0                   # HTTP client
dio: ^5.4.0                    # Advanced HTTP client

# Storage
shared_preferences: ^2.2.2     # Local key-value storage
flutter_secure_storage: ^10.0.0 # Secure storage for tokens

# Navigation
go_router: ^13.0.0             # Declarative routing

# Utils
intl: ^0.19.0                  # Internationalization
qr_flutter: ^4.1.0             # QR code generation
cached_network_image: ^3.3.1   # Image caching
flutter_svg: ^2.0.9            # SVG support

# PDF & Files
syncfusion_flutter_pdfviewer: ^27.2.5  # PDF viewer
path_provider: ^2.1.2          # File system paths

# Biometric
local_auth: ^2.1.8             # Fingerprint/Face ID
```

### **Dev Dependencies**

```yaml
flutter_test: sdk: flutter     # Testing framework
flutter_lints: ^6.0.0          # Linting rules
flutter_launcher_icons: ^0.13.1 # Icon generator
```

---

## 🚀 Getting Started

### **Prerequisites**

- Flutter SDK (3.10.4 or higher)
- Dart SDK (3.10.4 or higher)
- Android Studio / Xcode (for mobile development)
- VS Code / Android Studio (IDE)

### **Installation**

1. **Clone the repository**
```bash
cd app-client
```

2. **Install dependencies**
```bash
flutter pub get
```

3. **Configure API endpoint**

Edit `lib/core/config/api_config.dart`:
```dart
static const baseUrl = 'http://YOUR_SERVER_IP:3000/api';
```

For Android emulator: `http://10.0.2.2:3000/api`
For iOS simulator: `http://localhost:3000/api`
For physical device: `http://YOUR_COMPUTER_IP:3000/api`

4. **Run the app**
```bash
# Check connected devices
flutter devices

# Run on specific device
flutter run -d <device-id>

# Run in debug mode
flutter run

# Run in release mode
flutter run --release
```

### **Demo Mode**

For testing without backend:

**Credentials:**
- Phone: `9876543210`
- Patient Number: `1234567890`
- OTP: `123456`

---

## 🔧 Development

### **Running on Different Platforms**

```bash
# Android
flutter run -d android

# iOS
flutter run -d ios

# Web
flutter run -d chrome

# Windows
flutter run -d windows

# All connected devices
flutter run -d all
```

### **Building for Production**

```bash
# Android APK
flutter build apk --release

# Android App Bundle (for Play Store)
flutter build appbundle --release

# iOS
flutter build ios --release

# Web
flutter build web --release
```

### **Code Generation**

```bash
# Generate app icons
flutter pub run flutter_launcher_icons

# Clean build
flutter clean
flutter pub get
```

### **Testing**

```bash
# Run all tests
flutter test

# Run specific test
flutter test test/widget_test.dart

# Run with coverage
flutter test --coverage
```

---

## 🐛 Debugging

### **Common Issues**

1. **API Connection Failed**
   - Check if backend server is running
   - Verify API endpoint in `api_config.dart`
   - For Android emulator, use `10.0.2.2` instead of `localhost`

2. **Build Errors**
   ```bash
   flutter clean
   flutter pub get
   flutter run
   ```

3. **Hot Reload Not Working**
   - Press `r` in terminal for hot reload
   - Press `R` for hot restart
   - Restart the app completely if needed

4. **Package Conflicts**
   ```bash
   flutter pub cache repair
   flutter pub get
   ```

### **Logging**

```dart
// Add debug prints
print('Debug: $variable');

// Use debugPrint for large outputs
debugPrint('Large output: $data');

// Logger package (recommended)
import 'package:logger/logger.dart';
var logger = Logger();
logger.d('Debug message');
logger.e('Error message');
```

---

## 📱 Platform-Specific Configuration

### **Android**

**Minimum SDK:** 21 (Android 5.0)
**Target SDK:** 34 (Android 14)

**Permissions** (`android/app/src/main/AndroidManifest.xml`):
```xml
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.CAMERA"/>
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
```

**App Name:** Edit `android/app/src/main/AndroidManifest.xml`
```xml
<application android:label="MediLocker">
```

### **iOS**

**Minimum Version:** iOS 12.0

**Permissions** (`ios/Runner/Info.plist`):
```xml
<key>NSCameraUsageDescription</key>
<string>Camera access for QR code scanning</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>Photo library access for documents</string>
```

**App Name:** Edit `ios/Runner/Info.plist`
```xml
<key>CFBundleDisplayName</key>
<string>MediLocker</string>
```

---

## 🔐 Security

### **Token Storage**

- Access tokens stored in `SharedPreferences`
- Sensitive data in `FlutterSecureStorage`
- Automatic token injection in API calls
- Token refresh on expiry

### **Best Practices**

- Never commit API keys or secrets
- Use environment variables for configuration
- Implement certificate pinning for production
- Enable ProGuard/R8 for Android release builds
- Enable bitcode for iOS release builds

---

## 🎯 Features Roadmap

### **Implemented ✅**
- [x] OTP-based authentication
- [x] Patient profile viewing
- [x] Appointment listing
- [x] Visit history
- [x] Bill viewing
- [x] Emergency information
- [x] Demo mode

### **In Progress 🚧**
- [ ] Appointment booking
- [ ] PDF report viewer
- [ ] Payment integration
- [ ] Push notifications
- [ ] NFC card integration

### **Planned 📋**
- [ ] Biometric authentication
- [ ] Offline mode
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Health tracking
- [ ] Medication reminders
- [ ] Telemedicine integration

---

## 📄 License

This project is part of the MediLocker healthcare management system.

---

## 👥 Support

For issues and questions:
- Check the documentation
- Review existing issues
- Contact the development team

---

## 📚 Additional Resources

- [Flutter Documentation](https://docs.flutter.dev/)
- [Provider Package](https://pub.dev/packages/provider)
- [Material Design](https://material.io/design)
- [Flutter Cookbook](https://docs.flutter.dev/cookbook)

---

**Last Updated:** March 2026
**Version:** 1.0.0
**Flutter Version:** 3.10.4
