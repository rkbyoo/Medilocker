import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

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

  static Future<dynamic> get(String endpoint) async {
    final headers = await getHeaders();
    debugPrint('\n=====================================\n[REQ] GET $endpoint\nHeaders: $headers\n=====================================');
    final response = await http.get(Uri.parse(endpoint), headers: headers);
    debugPrint('\n=====================================\n[RES] GET $endpoint\nStatus: ${response.statusCode}\nBody: ${response.body}\n=====================================');
    return _handleResponse(response);
  }

  static Future<dynamic> post(
      String endpoint, Map<String, dynamic> body) async {
    final headers = await getHeaders();
    debugPrint('\n=====================================\n[REQ] POST $endpoint\nHeaders: $headers\nBody: ${jsonEncode(body)}\n=====================================');
    final response = await http.post(
      Uri.parse(endpoint),
      headers: headers,
      body: jsonEncode(body),
    );
    debugPrint(
        '\n=====================================\n[RES] POST $endpoint\nStatus: ${response.statusCode}\nBody: ${response.body}\n=====================================');
    return _handleResponse(response);
  }

  static Future<dynamic> put(
      String endpoint, Map<String, dynamic> body) async {
    final headers = await getHeaders();
    debugPrint('\n=====================================\n[REQ] PUT $endpoint\nHeaders: $headers\nBody: ${jsonEncode(body)}\n=====================================');
    final response = await http.put(
      Uri.parse(endpoint),
      headers: headers,
      body: jsonEncode(body),
    );
    debugPrint('\n=====================================\n[RES] PUT $endpoint\nStatus: ${response.statusCode}\nBody: ${response.body}\n=====================================');
    return _handleResponse(response);
  }

  static Future<dynamic> delete(String endpoint) async {
    final headers = await getHeaders();
    debugPrint('\n=====================================\n[REQ] DELETE $endpoint\nHeaders: $headers\n=====================================');
    final response =
        await http.delete(Uri.parse(endpoint), headers: headers);
    debugPrint('\n=====================================\n[RES] DELETE $endpoint\nStatus: ${response.statusCode}\nBody: ${response.body}\n=====================================');
    return _handleResponse(response);
  }

  static dynamic _handleResponse(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return jsonDecode(response.body);
    }

    if (response.statusCode == 401) {
      onUnauthenticated?.call();
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

    throw ApiException(response.statusCode, serverMessage);
  }
}
