import 'package:flutter/material.dart';

import '../../core/theme/color_tokens.dart';
import '../../core/theme/spacing_tokens.dart';
import '../../core/theme/text_tokens.dart';
import 'lp_button.dart';

class LPEmptyState extends StatelessWidget {
  const LPEmptyState({required this.title, required this.subtitle, this.imagePath, this.ctaLabel, this.onCtaTap, super.key});
  final String title;
  final String subtitle;
  final String? imagePath;
  final String? ctaLabel;
  final VoidCallback? onCtaTap;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(LPSpacing.px32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.inbox_outlined, size: 72, color: Theme.of(context).colorScheme.secondary),
            const SizedBox(height: LPSpacing.px24),
            Text(title, style: LPTextStyle.headlineMedium, textAlign: TextAlign.center),
            const SizedBox(height: LPSpacing.px8),
            Text(subtitle, style: LPTextStyle.bodyMedium.copyWith(color: AppColors.textSecondary), textAlign: TextAlign.center),
            if (ctaLabel != null) ...[
              const SizedBox(height: LPSpacing.px32),
              LPButton(label: ctaLabel!, onPressed: onCtaTap, isFullWidth: false),
            ],
          ],
        ),
      ),
    );
  }
}
