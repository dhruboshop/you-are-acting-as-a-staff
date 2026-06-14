import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/app_durations.dart';
import '../../../core/constants/app_strings.dart';
import '../../../core/router/route_names.dart';
import '../../../core/theme/text_tokens.dart';
import '../../auth/providers/auth_provider.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 800))..forward();

  @override
  void initState() {
    super.initState();
    unawaited(Future<void>.delayed(AppDurations.splash, _navigate));
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  void _navigate() {
    if (!mounted) return;
    final user = ref.read(authUserProvider);
    final business = ref.read(businessProvider).valueOrNull;
    if (user == null) {
      context.go(RouteNames.welcome);
    } else if (business == null) {
      context.go(RouteNames.businessSetup);
    } else {
      context.go(RouteNames.dashboard);
    }
  }

  @override
  Widget build(BuildContext context) {
    ref.watch(authStateProvider);
    ref.watch(businessProvider);
    final colors = Theme.of(context).colorScheme;
    return Scaffold(
      backgroundColor: colors.primary,
      body: SafeArea(
        child: Stack(
          fit: StackFit.expand,
          children: [
            Align(
              alignment: Alignment.center,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TweenAnimationBuilder<double>(
                    tween: Tween(begin: 0, end: 1),
                    duration: const Duration(milliseconds: 400),
                    builder: (_, scale, child) => Transform.scale(scale: scale, child: child),
                    child: Icon(Icons.loyalty, color: colors.onPrimary, size: 72),
                  ),
                  const SizedBox(height: 16),
                  FadeTransition(
                    opacity: CurvedAnimation(parent: _ctrl, curve: const Interval(0.3, 1)),
                    child: Text(AppStrings.appName, style: LPTextStyle.headlineLarge.copyWith(color: colors.onPrimary)),
                  ),
                  const SizedBox(height: 8),
                  FadeTransition(
                    opacity: CurvedAnimation(parent: _ctrl, curve: const Interval(0.5, 1)),
                    child: Text(AppStrings.splashTagline, style: LPTextStyle.bodyMedium.copyWith(color: colors.onPrimary.withValues(alpha: 0.7))),
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton(onPressed: _navigate, child: const Text('Test Button')),
                ],
              ),
            ),
            Positioned(
              left: 0,
              right: 0,
              bottom: 0,
              child: LinearProgressIndicator(backgroundColor: colors.onPrimary.withValues(alpha: 0.2), color: colors.secondary, minHeight: 3),
            ),
          ],
        ),
      ),
    );
  }
}
