import 'dart:convert';
import 'dart:developer' as developer;
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
    final response = await http.get(Uri.parse(endpoint), headers: headers);
    return _handleResponse(response);
  }

  static Future<dynamic> post(
      String endpoint, Map<String, dynamic> body) async {
    final headers = await getHeaders();
    developer.log('POST $endpoint  body: ${jsonEncode(body)}',
        name: 'ApiService');
    final response = await http.post(
      Uri.parse(endpoint),
      headers: headers,
      body: jsonEncode(body),
    );
    developer.log(
        'POST $endpoint  status: ${response.statusCode}  body: ${response.body}',
        name: 'ApiService');
    return _handleResponse(response);
  }

  static Future<dynamic> put(
      String endpoint, Map<String, dynamic> body) async {
    final headers = await getHeaders();
    final response = await http.put(
      Uri.parse(endpoint),
      headers: headers,
      body: jsonEncode(body),
    );
    return _handleResponse(response);
  }

  static Future<dynamic> delete(String endpoint) async {
    final headers = await getHeaders();
    final response =
        await http.delete(Uri.parse(endpoint), headers: headers);
    return _handleResponse(response);
  }

  static dynamic _handleResponse(http.Response response) {
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

    throw ApiException(response.statusCode, serverMessage);
  }
}
