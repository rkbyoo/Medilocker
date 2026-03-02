import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';

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

  static Future<dynamic> post(String endpoint, Map<String, dynamic> body) async {
    final headers = await getHeaders();
    final response = await http.post(
      Uri.parse(endpoint),
      headers: headers,
      body: jsonEncode(body),
    );
    return _handleResponse(response);
  }

  static Future<dynamic> put(String endpoint, Map<String, dynamic> body) async {
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
    final response = await http.delete(Uri.parse(endpoint), headers: headers);
    return _handleResponse(response);
  }

  static dynamic _handleResponse(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return jsonDecode(response.body);
    } else {
      throw Exception('API Error: ${response.statusCode} - ${response.body}');
    }
  }
}
