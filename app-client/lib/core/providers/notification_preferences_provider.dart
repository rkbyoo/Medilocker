import 'package:flutter/foundation.dart';
import '../services/notification_preferences_service.dart';

class NotificationPreferencesProvider extends ChangeNotifier {
  Map<String, bool> _prefs = {};
  bool _isLoaded = false;

  bool get isLoaded => _isLoaded;

  bool isEnabled(String key) {
    final pref = NotificationPreferencesService.preferences
        .firstWhere((p) => p.key == key);
    return _prefs[key] ?? pref.defaultValue;
  }

  Future<void> load() async {
    _prefs = await NotificationPreferencesService.loadAll();
    _isLoaded = true;
    notifyListeners();
    // Sync FCM topics in background
    NotificationPreferencesService.syncAllFcmTopics();
  }

  Future<void> toggle(String key, bool enabled) async {
    _prefs[key] = enabled;
    notifyListeners(); // Optimistic UI update
    await NotificationPreferencesService.setPreference(key, enabled);
  }

  void reset() {
    _prefs = {};
    _isLoaded = false;
    notifyListeners();
  }
}
