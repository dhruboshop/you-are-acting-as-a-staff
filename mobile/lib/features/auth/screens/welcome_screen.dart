import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/app_strings.dart';
import '../../../core/router/route_names.dart';
import '../../../core/theme/color_tokens.dart';
import '../../../core/theme/spacing_tokens.dart';
import '../../../core/theme/text_tokens.dart';
import '../../../shared/widgets/lp_button.dart';

class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.white,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Expanded(child: Center(child: Icon(Icons.storefront, size: 180, color: Theme.of(context).colorScheme.secondary))),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: LPSpacing.px24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text(AppStrings.welcomeHeadline, style: LPTextStyle.displayMedium, textAlign: TextAlign.center),
                  const SizedBox(height: LPSpacing.px12),
                  const Text(AppStrings.welcomeSubtitle, style: LPTextStyle.bodyLarge, textAlign: TextAlign.center),
                  const SizedBox(height: LPSpacing.px24),
                  LPButton(label: AppStrings.getStartedFree, onPressed: () => context.go(RouteNames.googleLogin)),
                  TextButton(onPressed: () => context.go(RouteNames.googleLogin), child: const Text(AppStrings.alreadyHaveAccount)),
                ],
              ),
            ),
            const SizedBox(height: LPSpacing.px32),
          ],
        ),
      ),
    );
  }
}
