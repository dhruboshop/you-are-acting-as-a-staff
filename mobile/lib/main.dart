// ignore_for_file: avoid_print

import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'config/app_config.dart';
import 'screens/startup/startup_diagnostic_screen.dart';

Future<void> main() async {
  print('APP_START');
  WidgetsFlutterBinding.ensureInitialized();

  final status = await _initializeStartup();
  runApp(LoyaltyApp(status: status));
}

Future<StartupStatus> _initializeStartup() async {
  final supabaseConfigured = AppConfig.supabaseConfigured;
  if (!supabaseConfigured) {
    print('SUPABASE_INIT');
    return const StartupStatus(supabaseConfigured: false, supabaseInitialized: false);
  }

  try {
    await Supabase.initialize(url: AppConfig.supabaseUrl, publishableKey: AppConfig.supabaseAnonKey);
    print('SUPABASE_INIT');
    return const StartupStatus(supabaseConfigured: true, supabaseInitialized: true);
  } catch (error) {
    print('SUPABASE_INIT');
    return StartupStatus(supabaseConfigured: true, supabaseInitialized: false, supabaseError: error);
  }
}

class LoyaltyApp extends StatelessWidget {
  const LoyaltyApp({required this.status, super.key});

  final StartupStatus status;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: AppConfig.appName,
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xff146c5f)),
        useMaterial3: true,
      ),
      home: StartupDiagnosticScreen(status: status),
    );
  }
}
