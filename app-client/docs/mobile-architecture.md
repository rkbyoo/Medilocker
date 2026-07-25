# Mobile Application — Architecture & Developer Guide (MediLocker)

> **Location:** `app-client/`
> **Stack:** Flutter + Dart + Provider + Firebase Messaging + GoRouter

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Startup & Initialization](#startup--initialization)
4. [Tech Stack Deep Dive](#tech-stack-deep-dive)
5. [State Management — Provider Pattern](#state-management--provider-pattern)
6. [Navigation — GoRouter](#navigation--gorouter)
7. [API Communication](#api-communication)
8. [Authentication & Secure Storage](#authentication--secure-storage)
9. [Push Notifications (FCM)](#push-notifications-fcm)
10. [PDF Generation & Viewing](#pdf-generation--viewing)
11. [QR Code Generation](#qr-code-generation)
12. [Biometric Authentication](#biometric-authentication)
13. [Screens Reference](#screens-reference)
14. [Data Models](#data-models)
15. [Environment Variables](#environment-variables)
16. [Build & Release](#build--release)

---

## Overview

**MediLocker** is the patient-facing mobile application for the Hospital Management System. It gives patients a secure, always-accessible view of their medical world:

- View upcoming and past appointments
- Read full visit records (diagnosis, notes, advice)
- View and download prescriptions as PDF
- See bills and payment status
- Receive real-time push notifications for every hospital action
- Generate a QR code for quick reception check-in
- Access emergency contacts without logging in

The app is built with **Flutter**, allowing a single Dart codebase to produce native-quality apps for both Android and iOS.

---

## Project Structure

```
app-client/
├── lib/
│   ├── main.dart                    ← App entry point
│   │
│   ├── core/                        ← Shared, app-wide code
│   │   ├── config/
│   │   │   ├── api_config.dart      ← Base URL and all endpoint paths
│   │   │   └── app_config.dart      ← General app constants
│   │   │
│   │   ├── constants/
│   │   │   ├── app_colors.dart      ← Design system colors
│   │   │   └── app_strings.dart     ← Text constants
│   │   │
│   │   ├── models/                  ← Dart data models (from JSON)
│   │   │   ├── patient_model.dart
│   │   │   ├── appointment_model.dart
│   │   │   ├── visit_model.dart
│   │   │   ├── prescription_model.dart
│   │   │   ├── notification_model.dart
│   │   │   └── bill_model.dart
│   │   │
│   │   ├── providers/               ← State management
│   │   │   ├── auth_provider.dart              ← Login, logout, token
│   │   │   ├── patient_provider.dart           ← Patient data, records, appointments
│   │   │   ├── notification_provider.dart      ← Notification list + badge count
│   │   │   └── notification_preferences_provider.dart
│   │   │
│   │   ├── services/                ← Business logic + external calls
│   │   │   ├── api_service.dart                ← Base HTTP client (Dio)
│   │   │   ├── auth_service.dart               ← Auth API calls
│   │   │   ├── push_notification_service.dart  ← FCM setup + token registration
│   │   │   ├── notification_service.dart       ← Notification API calls
│   │   │   ├── notification_preferences_service.dart
│   │   │   ├── bill_pdf_service.dart           ← PDF bill generation
│   │   │   └── demo_data_service.dart
│   │   │
│   │   └── widgets/                 ← Shared UI widgets
│   │
│   └── screens/                     ← Feature screens
│       ├── auth/
│       │   └── login_screen.dart
│       ├── home/
│       │   └── main_screen.dart     ← Bottom navigation shell
│       ├── appointments/
│       ├── records/
│       ├── bills/
│       ├── notifications/
│       ├── profile/
│       └── emergency/
│
├── android/                         ← Android native project
├── ios/                             ← iOS native project
├── assets/
│   └── icon/                        ← App icons
├── pubspec.yaml                     ← Dependencies
└── docs/
    └── mobile-architecture.md       ← This file
```

---

## Startup & Initialization

The `main.dart` file orchestrates the app startup in a specific order:

```dart
Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();   // 1. Initialize Flutter

  await dotenv.load(fileName: ".env");          // 2. Load API URL from .env

  // 3. Initialize Firebase (non-fatal if config missing)
  try {
    await Firebase.initializeApp();
    await PushNotificationService.initialize(); // 4. Setup FCM, get token
  } catch (e) {
    debugPrint('[Main] Firebase initialization skipped: $e');
  }

  runApp(const MyHealthApp());                  // 5. Start the app
}
```

### Provider Setup
The root widget wraps the entire app in a `MultiProvider`. This is how state is made globally available:

```dart
MultiProvider(
  providers: [
    ChangeNotifierProvider(create: (_) => AuthProvider()),
    ChangeNotifierProvider(create: (_) => PatientProvider()),
    ChangeNotifierProvider(create: (_) => NotificationProvider()),
    ChangeNotifierProvider(create: (_) => NotificationPreferencesProvider()),
  ],
  child: MaterialApp(...)
)
```

---

## Tech Stack Deep Dive

### Flutter & Dart
Flutter renders its own UI using the **Skia/Impeller graphics engine** — it does not use native Android/iOS widgets. This means:
- **Identical UI on both platforms** (no platform divergence).
- **High performance:** UI runs at 60fps with compiled Dart code.
- **Hot Reload:** UI changes appear in under 1 second during development.

### Provider
Provider is Flutter's recommended, lightweight state management solution. It uses `ChangeNotifier` classes to hold state and `Consumer` / `context.watch<T>()` to rebuild widgets when state changes.

Chosen over BLoC because:
- Simpler to understand and onboard contributors.
- Sufficient for this app's complexity level.
- Less boilerplate than BLoC/Cubit.

### GoRouter 13
Declarative URL-based routing. Key benefit: supports **deep linking** (opening the app to a specific screen from a push notification tap) and **nested navigation**.

### Dio 5
A powerful HTTP client with:
- **Interceptors:** Used to automatically attach the JWT `Authorization` header to every request.
- **Error handling:** Network errors and API errors are caught and formatted consistently.
- Timeout configuration.

### SharedPreferences & FlutterSecureStorage
- **SharedPreferences:** Non-sensitive key-value storage for user preferences (e.g., notification settings, last viewed tab).
- **FlutterSecureStorage:** Encrypted storage backed by Android Keystore / iOS Keychain. The JWT token is stored here and is never accessible to other apps.

---

## State Management — Provider Pattern

Each provider is a `ChangeNotifier` that holds state and exposes methods to modify it. When state changes, `notifyListeners()` is called, which causes all listening widgets to rebuild.

### AuthProvider (`auth_provider.dart`)
Holds: current user info, JWT token, loading state.
Methods: `login(email, password)`, `logout()`, `checkAuthStatus()`.

```dart
class AuthProvider extends ChangeNotifier {
  User? _user;
  bool _isLoading = false;

  User? get user => _user;
  bool get isAuthenticated => _user != null;

  Future<void> login(String email, String password) async {
    _isLoading = true;
    notifyListeners();
    try {
      final response = await AuthService.login(email, password);
      _user = response.user;
      await FlutterSecureStorage().write(key: 'jwt', value: response.token);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
```

### PatientProvider (`patient_provider.dart`)
This is the most data-heavy provider. It holds:
- Patient profile (`_patient`)
- Appointments list (`_appointments`)
- Visits/records list (`_visits`)
- Bills list (`_bills`)
- Selected filters

It fetches all patient data on demand and caches it in memory. The main screen fetches data once on load.

### NotificationProvider (`notification_provider.dart`)
Holds the list of notifications and the unread count (shown as a badge on the Notifications tab). It listens to the `PushNotificationService` stream to increment the badge when a new push notification arrives while the app is open.

---

## Navigation — GoRouter

Routes are defined declaratively. GoRouter supports **redirect guards** to enforce authentication:

```dart
// Redirect unauthenticated users to login
redirect: (context, state) {
  final isAuthenticated = context.read<AuthProvider>().isAuthenticated;
  final isLoginRoute = state.matchedLocation == '/login';
  if (!isAuthenticated && !isLoginRoute) return '/login';
  if (isAuthenticated && isLoginRoute) return '/home';
  return null; // no redirect
},
```

**Deep linking from notifications:** When a user taps a push notification (e.g., "Your appointment is confirmed"), GoRouter navigates directly to `/appointments/:id` with the appointment ID from the notification payload.

---

## API Communication

All API calls go through `api_service.dart`, which wraps Dio and handles auth headers automatically:

```dart
class ApiService {
  static final Dio _dio = Dio(BaseOptions(
    baseUrl: dotenv.env['API_BASE_URL'] ?? 'http://localhost:4000/api',
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
  ));

  // Auth interceptor: attach JWT to every request
  static void _setupInterceptors() {
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await getToken();
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onError: (DioException e, handler) {
        // Handle 401 (token expired) → redirect to login
        if (e.response?.statusCode == 401) {
          // Trigger logout in AuthProvider
        }
        return handler.next(e);
      },
    ));
  }

  static Future<dynamic> get(String path) async {
    final response = await _dio.get(path);
    return response.data;
  }

  static Future<dynamic> post(String path, Map<String, dynamic> body) async {
    final response = await _dio.post(path, data: body);
    return response.data;
  }
}
```

### API Endpoints Config (`api_config.dart`)
All endpoint strings are centralized:
```dart
class ApiConfig {
  static String get baseUrl => dotenv.env['API_BASE_URL']!;
  static String get notificationsEndpoint => '/notifications';
  static String get patientsEndpoint => '/patients';
  static String get appointmentsEndpoint => '/appointments';
  static String get visitsEndpoint => '/visits';
}
```

---

## Authentication & Secure Storage

### Login Flow
1. User enters email and password on `LoginScreen`.
2. `AuthProvider.login()` calls `AuthService.login()`.
3. On success, the JWT access token is stored in `FlutterSecureStorage`.
4. `AuthProvider` sets `_user` and calls `notifyListeners()`.
5. GoRouter's redirect guard sees `isAuthenticated = true` and navigates to `/home`.

### Token Storage
```dart
// Write
await const FlutterSecureStorage().write(key: 'access_token', value: token);

// Read (used in ApiService interceptor)
static Future<String?> getToken() async {
  return await const FlutterSecureStorage().read(key: 'access_token');
}

// Delete on logout
await const FlutterSecureStorage().delete(key: 'access_token');
```

`FlutterSecureStorage` stores data in:
- **Android:** Android Keystore (hardware-backed encryption on modern devices)
- **iOS:** iOS Keychain (encrypted by the OS)

---

## Push Notifications (FCM)

This is the real-time communication channel from the hospital to the patient's phone.

### Setup Flow (on app start)

```dart
class PushNotificationService {
  static Future<void> initialize() async {
    // 1. Request permission
    await FirebaseMessaging.instance.requestPermission(
      alert: true, badge: true, sound: true,
    );

    // 2. Get the device's unique FCM token
    final token = await FirebaseMessaging.instance.getToken();

    // 3. Register token with backend
    // → POST /api/notifications/device-token { fcm_token, platform }
    await _sendTokenToBackend(token);

    // 4. Listen for token refreshes (tokens rotate periodically)
    FirebaseMessaging.instance.onTokenRefresh.listen(_sendTokenToBackend);

    // 5. Handle notifications when app is opened from background/terminated
    FirebaseMessaging.onMessageOpenedApp.listen(_handleNotificationTap);
    final initialMessage = await FirebaseMessaging.instance.getInitialMessage();
    if (initialMessage != null) _handleNotificationTap(initialMessage);
  }
}
```

### Three Message States
| State | Behavior |
|-------|----------|
| **Foreground** | `FirebaseMessaging.onMessage` fires. App can show an in-app banner (Snackbar/Dialog). |
| **Background** | OS displays a system notification. Tapping it fires `onMessageOpenedApp`. |
| **Terminated** | OS displays a system notification. When user taps it, `getInitialMessage()` returns the message on next app launch. |

### Backend Send
The server's `PushNotificationService.sendToPatient()` looks up all FCM tokens for a patient and sends to all of them simultaneously via `sendEachForMulticast`. This means if a patient has an Android phone and an iPad, both get the notification.

---

## PDF Generation & Viewing

Patients can view and download their prescriptions as PDFs.

### PDF Generation (`bill_pdf_service.dart`)
Uses the `pdf` Dart package to programmatically create a PDF document:

```dart
final pdf = pw.Document();

pdf.addPage(pw.Page(
  build: (context) => pw.Column(children: [
    pw.Text('Prescription', style: pw.TextStyle(fontSize: 24, fontWeight: pw.FontWeight.bold)),
    pw.Text('Dr. ${visit.doctorName}'),
    pw.Text('Date: ${visit.visitDate}'),
    pw.Divider(),
    ...visit.prescription.medications.map((med) => pw.Row(children: [
      pw.Text(med.drugName),
      pw.Text(med.dosage),
      pw.Text(med.frequency),
    ])),
  ]),
));

// Save to device
final file = File('${dir.path}/prescription_${visit.visitId}.pdf');
await file.writeAsBytes(await pdf.save());
```

### PDF Viewing
The `Syncfusion Flutter PDF Viewer` widget renders PDFs directly in the app with pinch-to-zoom, text selection, and page navigation.

### PDF Sharing
The `share_plus` package allows patients to share the PDF file via any app on their phone (WhatsApp, email, files, etc.).

### Printing
The `printing` package integrates with the platform's native print dialog for physical prescriptions.

---

## QR Code Generation

Each patient's profile screen shows a QR code containing their **10-digit patient number**. This is used at hospital reception: the receptionist can scan the QR code with a secondary scanner app to instantly look up the patient, in addition to the NFC card approach.

```dart
// Generated using qr_flutter
QrImageView(
  data: patient.patientNumber,  // e.g., "0000000042"
  version: QrVersions.auto,
  size: 200.0,
  backgroundColor: Colors.white,
)
```

---

## Biometric Authentication

The `local_auth` package enables fingerprint / Face ID unlock. This is an additional layer of security so that if someone picks up an unlocked phone, they cannot open MediLocker without the patient's biometric.

```dart
final localAuth = LocalAuthentication();

// Check if biometrics are available
final canCheckBiometrics = await localAuth.canCheckBiometrics;
final availableBiometrics = await localAuth.getAvailableBiometrics();

// Authenticate
final didAuthenticate = await localAuth.authenticate(
  localizedReason: 'Please authenticate to access MediLocker',
  options: const AuthenticationOptions(biometricOnly: false),
);
```

If biometric auth fails or is not available, the user falls back to their device PIN.

---

## Screens Reference

### `main_screen.dart`
The root scaffold with a **bottom navigation bar** with four tabs:
- 🏠 Home
- 📅 Appointments
- 📋 Records
- 🔔 Notifications

### `login_screen.dart`
- Email and password text fields.
- "Forgot password?" placeholder.
- On login, calls `AuthProvider.login()`.

### Home Screen
Dashboard summary showing:
- The next upcoming appointment (if any) as a card.
- A preview of the most recent visit record.
- Quick-access buttons to Records, Bills, Profile.

### Appointments Screen
A scrollable list of all appointments. Each card shows:
- Doctor name and department.
- Date and time.
- Status badge (color-coded: blue=Scheduled, green=Completed, red=Cancelled).

Tapping an appointment opens a detailed view with full information.

### Records Screen
A list of all visit records, sorted by date (newest first). Each card shows the visit date, doctor name, and a summary of the diagnosis. Tapping opens the full visit detail:
- Full diagnosis text.
- Doctor's notes and advice.
- Next visit date.
- Medications listed per prescription.

### Bills Screen
List of bills linked to each visit. Each bill shows:
- Total amount.
- Payment status (Pending/Paid/Failed) with color badge.
- Itemized sections (Consultation fee, Pharmacy, Lab tests).
- Option to generate a PDF of the bill.

### Profile Screen
Shows the patient's full profile and a **QR Code** of their patient number. Patients can update their contact information.

### Notifications Screen
A chronological list of all in-app notifications. Unread notifications are visually highlighted. Tapping a notification marks it as read and may navigate to a related screen (e.g., tapping an appointment notification goes to the appointment detail).

---

## Data Models

All data models are plain Dart classes with `fromJson` constructors to parse API responses:

```dart
// Example: Visit model
class Visit {
  final String visitId;
  final String doctorName;
  final DateTime visitDate;
  final VisitType visitType;
  final String? diagnosis;
  final String? notes;
  final String? advice;
  final DateTime? nextVisitDate;
  final Prescription? prescription;

  factory Visit.fromJson(Map<String, dynamic> json) {
    return Visit(
      visitId: json['visit_id'],
      doctorName: json['doctor']['full_name'],
      visitDate: DateTime.parse(json['visit_date']),
      visitType: VisitType.values.byName(json['visit_type']),
      diagnosis: json['diagnosis'],
      // ...
    );
  }
}
```

---

## Environment Variables

The app uses `flutter_dotenv` to load configuration from an `.env` file bundled with the app:

```env
# app-client/.env
API_BASE_URL=http://192.168.1.100:4000/api
```

> The `.env` file is listed in `pubspec.yaml` as an asset so Flutter includes it in the app bundle:
> ```yaml
> flutter:
>   assets:
>     - .env
> ```

**Note for production:** Replace the local IP with the deployed server's domain (e.g., `https://api.yourhospital.com`).

---

## Build & Release

### Development

```bash
# Connect a device or start an emulator, then:
flutter run

# For web (limited functionality, no push notifications):
flutter run -d chrome
```

### Android Release Build

```bash
flutter build apk --release          # Produces a universal APK
flutter build appbundle --release    # Produces an AAB for Play Store
```
The output APK is at `build/app/outputs/flutter-apk/app-release.apk`.

### iOS Release Build

```bash
flutter build ios --release
# Then open Xcode to archive and upload to App Store Connect
```

### Icons
Icons are generated from `assets/icon/medilocker_icon.webp` using `flutter_launcher_icons`:
```bash
flutter pub run flutter_launcher_icons:main
```
This updates native icons in `android/` and `ios/` directories automatically.
