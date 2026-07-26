# Patient Mobile Application (MediLocker)

## Overview
**Flutter-based** mobile application for patients to access their digital health records, view upcoming appointments, read prescriptions, receive real-time push notifications, and generate a QR code for quick hospital check-in.

> **Location:** `app-client/`
> **📖 [Full Mobile App Documentation →](./mobile-architecture.md)**

## Features
- Personal medical records access (visit history, diagnoses, prescriptions)
- Appointment history with status tracking
- Bill viewing with itemized sections
- Real-time push notifications via Firebase Cloud Messaging (FCM)
- PDF prescription generation and viewing
- QR code of patient number for hospital check-in
- Biometric authentication (fingerprint / Face ID)
- OTP-based login via Twilio SMS
- Emergency contact information (accessible without full authentication)
- Cross-platform support (Android & iOS)

## Technology Stack
| Layer | Technology |
|-------|------------|
| Framework | Flutter + Dart |
| State Management | Provider |
| Navigation | GoRouter 13 |
| HTTP Client | Dio 5 |
| Local Storage | SharedPreferences |
| Secure Storage | flutter_secure_storage |
| Push Notifications | firebase_messaging (FCM) |
| PDF | `pdf` + `printing` + Syncfusion PDF Viewer |
| Biometrics | local_auth |
| QR Code | qr_flutter |

## Core Architecture

The app follows a clean **Provider + Service** pattern:

```
lib/
├── core/
│   ├── config/      → API endpoints, environment config
│   ├── constants/   → App colors, text styles
│   ├── models/      → Dart data models (Patient, Appointment, Visit, etc.)
│   ├── providers/   → AuthProvider, PatientProvider, NotificationProvider
│   ├── services/    → ApiService, PushNotificationService, BillPdfService
│   └── widgets/     → Shared UI widgets
└── screens/
    ├── auth/         → OTP login screen
    ├── home/         → Main tab scaffold
    ├── appointments/ → Appointment list + detail
    ├── records/      → Visit history + record detail
    ├── bills/        → Bill summary + payment status
    ├── notifications/→ Notification inbox
    ├── profile/      → Patient profile + QR code
    └── emergency/    → Emergency contact info
```

## Startup & Initialization (`main.dart`)
1. Flutter bindings are initialized.
2. **dotenv** loads the `.env` file for the API base URL.
3. **Firebase** is initialized via `Firebase.initializeApp()`.
4. **PushNotificationService** requests notification permissions and retrieves the device's FCM token.
5. The FCM token is sent to the backend and stored in the `device_tokens` table.
6. The app checks `AuthProvider` to route to Login or the Main screen.

## Authentication Flow

The app uses **OTP (One-Time Password)** login — not email/password. Patients authenticate using their registered phone number:

1. Patient enters their phone number.
2. The server triggers **Twilio** to send an OTP SMS to that number.
3. Patient enters the OTP in the app.
4. On successful verification, the server issues a **JWT access token** and **refresh token**.
5. The JWT is stored securely using **flutter_secure_storage**.

```dart
// auth_service.dart
class AuthService {
  final Dio _dio;

  // Step 1: Request OTP
  Future<void> requestOtp(String phoneNumber) async {
    await _dio.post('/api/auth/request-otp', data: {'phoneNumber': phoneNumber});
  }

  // Step 2: Verify OTP and receive token
  Future<AuthResult> verifyOtp(String phoneNumber, String otp) async {
    final response = await _dio.post('/api/auth/verify-otp', data: {
      'phoneNumber': phoneNumber,
      'otp': otp,
    });
    return AuthResult.fromJson(response.data);
  }
}
```

## Medical Data Models

```dart
class Visit {
  final String visitId;
  final String diagnosis;
  final String notes;
  final String advice;
  final DateTime visitDate;
  final Doctor doctor;
  final Prescription? prescription;

  Visit({
    required this.visitId,
    required this.diagnosis,
    required this.notes,
    required this.advice,
    required this.visitDate,
    required this.doctor,
    this.prescription,
  });
}

class Prescription {
  final String prescriptionId;
  final List<Medication> medications;

  Prescription({required this.prescriptionId, required this.medications});
}

class Medication {
  final String drugName;
  final String dosage;
  final String frequency;
  final String duration;

  Medication({
    required this.drugName,
    required this.dosage,
    required this.frequency,
    required this.duration,
  });
}
```

## FCM Push Notification Flow

```
Hospital Action (e.g., appointment scheduled)
    → Server: notification.service.ts saves a Notification record in DB
    → Server: push.service.ts calls Firebase Admin SDK (sendEachForMulticast)
    → Firebase: delivers push to all of the patient's registered devices
    → Flutter: firebase_messaging package receives the message
    → PushNotificationService: broadcasts via StreamController
    → NotificationProvider: updates the UI notification badge count
```

Device tokens are automatically re-registered on app startup and stale tokens are pruned from the backend after a failed send.

## Key Screens

| Screen | Description |
|--------|-------------|
| **Home** | Summary dashboard with upcoming appointment card and recent record highlights |
| **Appointments** | Full appointment history with status badges (Scheduled, Completed, Cancelled, No-Show) |
| **Records** | Visit history showing diagnosis, doctor's notes, advice, and medications per visit |
| **Bills** | Billing summary with itemized sections (Consultation, Pharmacy, Lab Tests, Imaging) |
| **Profile** | Patient profile with a generated **QR Code** of their patient number for quick hospital check-in |
| **Notifications** | In-app notification inbox with read/unread state |
| **Emergency** | Emergency contact information accessible without full authentication |

## API Integration

All API calls use **Dio** with an interceptor to attach the JWT token:

```dart
// api_service.dart
class ApiService {
  final Dio _dio;

  ApiService() : _dio = Dio(BaseOptions(baseUrl: AppConfig.apiBaseUrl)) {
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await _storage.read(key: 'access_token');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
    ));
  }

  Future<List<Appointment>> getAppointments() async {
    final response = await _dio.get('/appointments');
    return (response.data as List).map((e) => Appointment.fromJson(e)).toList();
  }
}
```

## Security Features
- **OTP Login**: No username/password stored — authentication via phone + Twilio OTP
- **JWT token storage**: `flutter_secure_storage` (iOS Keychain / Android Keystore)
- **Biometric authentication**: `local_auth` for fingerprint/Face ID app lock
- **HTTPS**: All API calls over TLS in production

## Configuration

```dart
// core/config/app_config.dart
class AppConfig {
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:4000/api',
  );
}
```

Environment file (`app-client/.env`):
```env
API_BASE_URL=http://your-server-ip:4000/api
```

> **Note for physical Android devices:** Use your machine's LAN IP (e.g., `http://192.168.1.100:4000/api`) instead of `localhost`.

## Running the App

```bash
cd app-client

# Install dependencies
flutter pub get

# Debug build on connected device/emulator
flutter run

# Release build
flutter run --release

# Build APK
flutter build apk --release
```