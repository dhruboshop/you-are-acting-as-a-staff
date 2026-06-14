// ignore_for_file: avoid_print

import 'dart:async';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

import '../../config/app_config.dart';
import '../../services/api_client.dart';
import '../../services/auth_service.dart';
import '../../services/shop_service.dart';
import '../auth/login_screen.dart';
import '../shops/shops_screen.dart';

class StartupStatus {
  const StartupStatus({
    required this.supabaseConfigured,
    required this.supabaseInitialized,
    this.supabaseError,
  });

  final bool supabaseConfigured;
  final bool supabaseInitialized;
  final Object? supabaseError;

  String get supabaseLabel {
    if (!supabaseConfigured) return 'Not configured';
    if (supabaseInitialized) return 'Initialized';
    return 'Unavailable';
  }
}

class StartupDiagnosticScreen extends StatefulWidget {
  const StartupDiagnosticScreen({required this.status, super.key});

  final StartupStatus status;

  @override
  State<StartupDiagnosticScreen> createState() => _StartupDiagnosticScreenState();
}

class _StartupDiagnosticScreenState extends State<StartupDiagnosticScreen> {
  String _apiStatus = 'Not checked';

  @override
  void initState() {
    super.initState();
    print('ROUTE_LOADED');
    print('HOME_SCREEN_RENDERED');
    unawaited(_checkApi());
  }

  @override
  Widget build(BuildContext context) {
    print('AUTH_STATE');
    final authStatus = widget.status.supabaseInitialized
        ? AppConfig.googleConfigured
            ? 'Ready'
            : 'Google client missing'
        : 'Unavailable';
    return Scaffold(
      appBar: AppBar(title: const Text('Startup Diagnostic')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            ElevatedButton(
              onPressed: () {},
              child: const Text('Test Button'),
            ),
            const SizedBox(height: 16),
            _StatusTile(label: 'Supabase status', value: widget.status.supabaseLabel),
            _StatusTile(label: 'API status', value: _apiStatus),
            _StatusTile(label: 'Auth status', value: authStatus),
            const _StatusTile(label: 'Current route', value: 'StartupDiagnosticScreen'),
            if (widget.status.supabaseError != null)
              Padding(
                padding: const EdgeInsets.only(top: 12),
                child: Text(
                  widget.status.supabaseError.toString(),
                  style: TextStyle(color: Theme.of(context).colorScheme.error),
                ),
              ),
            const SizedBox(height: 16),
            FilledButton.icon(
              onPressed: _openApp,
              icon: const Icon(Icons.arrow_forward),
              label: Text(widget.status.supabaseInitialized ? 'Continue' : 'Continue offline'),
            ),
            const SizedBox(height: 8),
            OutlinedButton.icon(
              onPressed: _checkApi,
              icon: const Icon(Icons.refresh),
              label: const Text('Retry API check'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _checkApi() async {
    setState(() => _apiStatus = 'Checking');
    try {
      final response = await http
          .get(Uri.parse('${AppConfig.apiBaseUrl}/health'))
          .timeout(const Duration(seconds: 4));
      if (!mounted) return;
      setState(() => _apiStatus = 'HTTP ${response.statusCode}');
    } catch (_) {
      if (!mounted) return;
      setState(() => _apiStatus = 'Unavailable');
    }
  }

  void _openApp() {
    if (!widget.status.supabaseInitialized) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Supabase is unavailable. Configure Supabase to sign in.')),
      );
      return;
    }

    final api = ApiClient();
    final auth = AuthService();
    final shops = ShopService(api);
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => _AuthenticatedHome(auth: auth, shops: shops, api: api),
      ),
    );
  }
}

class _AuthenticatedHome extends StatelessWidget {
  const _AuthenticatedHome({required this.auth, required this.shops, required this.api});

  final AuthService auth;
  final ShopService shops;
  final ApiClient api;

  @override
  Widget build(BuildContext context) {
    return StreamBuilder(
      stream: auth.authStateChanges,
      builder: (context, _) {
        print('AUTH_STATE');
        final signedIn = auth.currentUser != null;
        return signedIn ? ShopsScreen(auth: auth, shops: shops, api: api) : LoginScreen(auth: auth);
      },
    );
  }
}

class _StatusTile extends StatelessWidget {
  const _StatusTile({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      title: Text(label),
      subtitle: Text(value),
    );
  }
}
