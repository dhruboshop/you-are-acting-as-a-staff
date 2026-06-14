import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';
import 'features/auth/providers/auth_provider.dart';

class LoyaltyPilotApp extends ConsumerWidget {
  const LoyaltyPilotApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = ref.watch(businessThemeProvider);
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'LoyaltyPilot',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.buildTheme(theme),
      routerConfig: router,
    );
  }
}
