import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/app_strings.dart';
import '../../../core/router/route_names.dart';
import '../../../core/theme/color_tokens.dart';
import '../../../core/theme/spacing_tokens.dart';
import '../../../core/theme/text_tokens.dart';
import '../providers/auth_provider.dart';

class GoogleLoginScreen extends ConsumerWidget {
  const GoogleLoginScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(googleSignInProvider);
    ref.listen(googleSignInProvider, (_, next) {
      if (next is AsyncData && !next.isLoading) context.go(RouteNames.connectWhatsapp);
    });
    return Scaffold(
      backgroundColor: AppColors.white,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: LPSpacing.px24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: LPSpacing.px40),
              Center(child: Icon(Icons.loyalty, size: 48, color: Theme.of(context).colorScheme.primary)),
              const Spacer(),
              const Text(AppStrings.loginHeadline, style: LPTextStyle.headlineLarge, textAlign: TextAlign.center),
              const SizedBox(height: LPSpacing.px8),
              const Text(AppStrings.loginSubtitle, style: LPTextStyle.bodyMedium, textAlign: TextAlign.center),
              const SizedBox(height: LPSpacing.px40),
              OutlinedButton.icon(
                onPressed: state.isLoading ? null : () => ref.read(googleSignInProvider.notifier).signIn(),
                icon: state.isLoading ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)) : const Text('G'),
                label: const Text(AppStrings.continueWithGoogle),
              ),
              if (state.hasError) ...[
                const SizedBox(height: LPSpacing.px16),
                const Text(AppStrings.loginError, textAlign: TextAlign.center, style: TextStyle(color: AppColors.error)),
              ],
              const Spacer(),
              TextButton(onPressed: () {}, child: const Text('${AppStrings.privacyPolicy} - ${AppStrings.terms}')),
              const SizedBox(height: LPSpacing.px24),
            ],
          ),
        ),
      ),
    );
  }
}
