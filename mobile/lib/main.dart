import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'config/app_config.dart';
import 'screens/auth/login_screen.dart';
import 'screens/shops/shops_screen.dart';
import 'services/api_client.dart';
import 'services/auth_service.dart';
import 'services/shop_service.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  AppConfig.validate();
  await Supabase.initialize(url: AppConfig.supabaseUrl, publishableKey: AppConfig.supabaseAnonKey);
  runApp(const LoyaltyApp());
}

class LoyaltyApp extends StatelessWidget {
  const LoyaltyApp({super.key});

  @override
  Widget build(BuildContext context) {
    final api = ApiClient();
    final auth = AuthService();
    final shops = ShopService(api);
    return MaterialApp(
      title: AppConfig.appName,
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xff146c5f)),
        useMaterial3: true,
      ),
      home: StreamBuilder<AuthState>(
        stream: auth.authStateChanges,
        builder: (context, snapshot) {
          final signedIn = Supabase.instance.client.auth.currentSession != null;
          return signedIn ? ShopsScreen(auth: auth, shops: shops, api: api) : LoginScreen(auth: auth);
        },
      ),
    );
  }
}
