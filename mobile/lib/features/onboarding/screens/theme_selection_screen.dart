import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/router/route_names.dart';
import '../../../core/theme/business_theme.dart';
import '../../../core/theme/color_tokens.dart';
import '../../../core/theme/spacing_tokens.dart';
import '../../../core/theme/text_tokens.dart';
import '../../../shared/widgets/lp_bottom_action_bar.dart';
import '../../../shared/widgets/lp_onboarding_progress.dart';
import '../../../shared/widgets/lp_theme_card.dart';
import '../providers/onboarding_provider.dart';

class ThemeSelectionScreen extends ConsumerStatefulWidget {
  const ThemeSelectionScreen({super.key});

  @override
  ConsumerState<ThemeSelectionScreen> createState() => _ThemeSelectionScreenState();
}

class _ThemeSelectionScreenState extends ConsumerState<ThemeSelectionScreen> {
  BusinessThemeType? _selected = BusinessThemeType.luxury;

  Future<void> _complete() async {
    final selected = _selected;
    if (selected == null) return;
    ref.read(onboardingStateProvider.notifier).setTheme(selected);
    await ref.read(onboardingStateProvider.notifier).submit();
    if (mounted) context.go(RouteNames.connectWhatsapp);
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(onboardingStateProvider);
    return Scaffold(
      backgroundColor: AppColors.white,
      appBar: AppBar(title: const Text('Your Style')),
      body: Column(
        children: [
          const LPOnboardingProgress(totalSteps: 3, currentStep: 3),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(LPSpacing.px24),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                const Text('Choose your style', style: LPTextStyle.headlineMedium),
                const SizedBox(height: LPSpacing.px4),
                const Text('You can change this anytime.', style: TextStyle(color: AppColors.textSecondary)),
                const SizedBox(height: LPSpacing.px24),
                GridView.count(
                  crossAxisCount: 2,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  mainAxisSpacing: 12,
                  crossAxisSpacing: 12,
                  childAspectRatio: 0.85,
                  children: BusinessThemeType.values.map((type) {
                    return LPThemeCard(theme: LPBusinessTheme.fromType(type), selected: _selected == type, onSelect: () => setState(() => _selected = type));
                  }).toList(),
                ),
              ]),
            ),
          ),
          LPBottomActionBar(primaryLabel: 'Looks Good, Let\'s Go', onPrimary: _selected == null ? null : _complete, primaryLoading: state.isSubmitting),
        ],
      ),
    );
  }
}
