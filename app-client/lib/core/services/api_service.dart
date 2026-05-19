import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';

/// Thrown by [ApiService] for non-2xx responses.
class ApiException implements Exception {
  final int statusCode;
  final String message;
  ApiException(this.statusCode, this.message);

  @override
  String toString() => 'ApiException($statusCode): $message';
}

class ApiService {
  static void Function()? onUnauthenticated;

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }

  static Future<Map<String, String>> getHeaders() async {
    final token = await getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  static Future<bool> _attemptRefresh() async {
    final prefs = await SharedPreferences.getInstance();
    final refreshToken = prefs.getString('refresh_token');
    if (refreshToken == null) return false;

    try {
      final response = await http.post(
        Uri.parse(ApiConfig.refreshEndpoint),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'refresh_token': refreshToken}),
      ).timeout(const Duration(seconds: 15));

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = jsonDecode(response.body)['data'];
        if (data != null && data['access_token'] != null) {
          await prefs.setString('auth_token', data['access_token']);
          if (data['refresh_token'] != null) {
            await prefs.setString('refresh_token', data['refresh_token']);
          }
          return true;
        }
      }
    } catch (_) {
      // Ignore errors during refresh and fall through to return false
    }
    
    return false;
  }

  static Future<dynamic> get(String endpoint) async {
    var headers = await getHeaders();
    debugPrint('\n=====================================\n[REQ] GET $endpoint\nHeaders: $headers\n=====================================');
    var response = await http
        .get(Uri.parse(endpoint), headers: headers)
        .timeout(const Duration(seconds: 15));
        
    if (response.statusCode == 401 && !endpoint.contains('/auth/')) {
      if (await _attemptRefresh()) {
        headers = await getHeaders();
        response = await http.get(Uri.parse(endpoint), headers: headers).timeout(const Duration(seconds: 15));
      }
    }
    
    debugPrint('\n=====================================\n[RES] GET $endpoint\nStatus: ${response.statusCode}\nBody: ${response.body}\n=====================================');
    return _handleResponse(response, endpoint);
  }

  static Future<dynamic> post(
      String endpoint, Map<String, dynamic> body) async {
    var headers = await getHeaders();
    debugPrint('\n=====================================\n[REQ] POST $endpoint\nHeaders: $headers\nBody: ${jsonEncode(body)}\n=====================================');
    var response = await http
        .post(
          Uri.parse(endpoint),
          headers: headers,
          body: jsonEncode(body),
        )
        .timeout(const Duration(seconds: 15));
        
    if (response.statusCode == 401 && !endpoint.contains('/auth/')) {
      if (await _attemptRefresh()) {
        headers = await getHeaders();
        response = await http.post(Uri.parse(endpoint), headers: headers, body: jsonEncode(body)).timeout(const Duration(seconds: 15));
      }
    }
        
    debugPrint(
        '\n=====================================\n[RES] POST $endpoint\nStatus: ${response.statusCode}\nBody: ${response.body}\n=====================================');
    return _handleResponse(response, endpoint);
  }

  static Future<dynamic> put(
      String endpoint, Map<String, dynamic> body) async {
    var headers = await getHeaders();
    debugPrint('\n=====================================\n[REQ] PUT $endpoint\nHeaders: $headers\nBody: ${jsonEncode(body)}\n=====================================');
    var response = await http
        .put(
          Uri.parse(endpoint),
          headers: headers,
          body: jsonEncode(body),
        )
        .timeout(const Duration(seconds: 15));
        
    if (response.statusCode == 401 && !endpoint.contains('/auth/')) {
      if (await _attemptRefresh()) {
        headers = await getHeaders();
        response = await http.put(Uri.parse(endpoint), headers: headers, body: jsonEncode(body)).timeout(const Duration(seconds: 15));
      }
    }
        
    debugPrint('\n=====================================\n[RES] PUT $endpoint\nStatus: ${response.statusCode}\nBody: ${response.body}\n=====================================');
    return _handleResponse(response, endpoint);
  }

  static Future<dynamic> patch(
      String endpoint, Map<String, dynamic> body) async {
    var headers = await getHeaders();
    debugPrint('\\n=====================================\\n[REQ] PATCH $endpoint\\nHeaders: $headers\\nBody: ${jsonEncode(body)}\\n=====================================');
    var response = await http
        .patch(
          Uri.parse(endpoint),
          headers: headers,
          body: jsonEncode(body),
        )
        .timeout(const Duration(seconds: 15));

    if (response.statusCode == 401 && !endpoint.contains('/auth/')) {
      if (await _attemptRefresh()) {
        headers = await getHeaders();
        response = await http.patch(Uri.parse(endpoint), headers: headers, body: jsonEncode(body)).timeout(const Duration(seconds: 15));
      }
    }

    debugPrint('\\n=====================================\\n[RES] PATCH $endpoint\\nStatus: ${response.statusCode}\\nBody: ${response.body}\\n=====================================');
    return _handleResponse(response, endpoint);
  }

  static Future<dynamic> delete(String endpoint) async {

    var headers = await getHeaders();
    debugPrint('\n=====================================\n[REQ] DELETE $endpoint\nHeaders: $headers\n=====================================');
    var response = await http
        .delete(Uri.parse(endpoint), headers: headers)
        .timeout(const Duration(seconds: 15));
        
    if (response.statusCode == 401 && !endpoint.contains('/auth/')) {
      if (await _attemptRefresh()) {
        headers = await getHeaders();
        response = await http.delete(Uri.parse(endpoint), headers: headers).timeout(const Duration(seconds: 15));
      }
    }
        
    debugPrint('\n=====================================\n[RES] DELETE $endpoint\nStatus: ${response.statusCode}\nBody: ${response.body}\n=====================================');
    return _handleResponse(response, endpoint);
  }

  static dynamic _handleResponse(http.Response response, [String? endpoint]) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return jsonDecode(response.body);
    }

    // Try to extract a human-readable message from the JSON body
    String serverMessage = response.body;
    try {
      final json = jsonDecode(response.body) as Map<String, dynamic>;
      serverMessage = json['message'] as String? ??
          json['error'] as String? ??
          response.body;
    } catch (_) {
      // body wasn't JSON – keep the raw string
    }

    if (response.statusCode == 401) {
      bool isLoginOrOtp = endpoint != null && 
        (endpoint.contains('/auth/login') || endpoint.contains('/auth/send-otp') || endpoint.contains('/auth/verify-otp'));
      
      if (!isLoginOrOtp) {
        onUnauthenticated?.call();
      }
      // Use the server message if it's available and not just the raw HTML/body, otherwise fallback to session expired
      if (serverMessage.isNotEmpty && !serverMessage.startsWith('<')) {
        throw ApiException(401, serverMessage);
      }
      if (isLoginOrOtp) {
        throw ApiException(401, "Authentication failed. Please check your credentials.");
      }
      throw ApiException(401, "Session expired. Please log in again.");
    }

    throw ApiException(response.statusCode, serverMessage);
  }
}
