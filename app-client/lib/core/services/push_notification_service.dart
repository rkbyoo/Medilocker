import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import '../services/api_service.dart';
import '../config/api_config.dart';
import 'dart:io';

class PushNotificationService {
  static FirebaseMessaging get _fcm => FirebaseMessaging.instance;

  static bool _isFirebaseInitialized() {
    try {
      Firebase.app();
      return true;
    } catch (_) {
      return false;
    }
  }

  static Future<void> initialize() async {
    if (!_isFirebaseInitialized()) return;
    // 1. Request permissions (especially for iOS and Android 13+)
    NotificationSettings settings = await _fcm.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      debugPrint('[PushNotificationService] User granted permission');
    }

    // 2. Get the FCM token and register it with our backend
    await registerDevice();

    // 3. Listen for token refreshes
    _fcm.onTokenRefresh.listen((token) async {
      await _sendTokenToBackend(token);
    });
  }

  static Future<String?> getToken() async {
    if (!_isFirebaseInitialized()) return null;
    return await _fcm.getToken();
  }

  static Future<void> registerDevice() async {
    if (!_isFirebaseInitialized()) return;
    try {
      String? token = await _fcm.getToken();
      if (token != null) {
        await _sendTokenToBackend(token);
      }
    } catch (e) {
      debugPrint('[PushNotificationService] Error getting token: $e');
    }
  }

  static Future<void> _sendTokenToBackend(String token) async {
    try {
      // Check if user is logged in before sending token
      final authToken = await ApiService.getToken();
      if (authToken == null) return;

      await ApiService.post('${ApiConfig.notificationsEndpoint}/device-token', {
        'fcm_token': token,
        'platform': Platform.isAndroid ? 'android' : 'ios',
      });
      debugPrint('[PushNotificationService] FCM Token registered with backend');
    } catch (e) {
      debugPrint('[PushNotificationService] Error registering token with backend: $e');
    }
  }

  static Stream<RemoteMessage> get onMessage {
    if (!_isFirebaseInitialized()) return const Stream.empty();
    return FirebaseMessaging.onMessage;
  }
}
