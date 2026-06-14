class AppConfig {
  static const appName = String.fromEnvironment('APP_NAME', defaultValue: 'Retail Loyalty');
  static const apiBaseUrl = String.fromEnvironment('API_BASE_URL', defaultValue: 'http://localhost:8080');
  static const supabaseUrl = String.fromEnvironment('SUPABASE_URL');
  static const supabaseAnonKey = String.fromEnvironment('SUPABASE_ANON_KEY');
  static const googleClientId = String.fromEnvironment('GOOGLE_CLIENT_ID');

  static void validate() {
    final missing = <String>[
      if (supabaseUrl.isEmpty) 'SUPABASE_URL',
      if (supabaseAnonKey.isEmpty) 'SUPABASE_ANON_KEY',
      if (googleClientId.isEmpty) 'GOOGLE_CLIENT_ID',
    ];
    if (missing.isNotEmpty) {
      throw StateError('Missing dart defines: ${missing.join(', ')}');
    }
  }
}
