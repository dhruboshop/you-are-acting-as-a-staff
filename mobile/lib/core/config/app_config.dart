import 'package:flutter_dotenv/flutter_dotenv.dart';

class AppConfig {
  static bool get useFakeData => dotenv.env['USE_FAKE_DATA'] != 'false';
  static String get googleClientId => dotenv.env['GOOGLE_CLIENT_ID'] ?? '';
  static String get apiBaseUrl => dotenv.env['API_BASE_URL'] ?? 'http://localhost:8080';
}
