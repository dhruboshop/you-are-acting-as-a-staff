import 'package:flutter/material.dart';

import '../../core/theme/color_tokens.dart';
import '../../core/theme/elevation_tokens.dart';
import '../../core/theme/spacing_tokens.dart';
import 'lp_button.dart';

class LPBottomActionBar extends StatelessWidget {
  const LPBottomActionBar({required this.primaryLabel, required this.onPrimary, this.primaryLoading = false, this.secondaryLabel, this.onSecondary, super.key});
  final String primaryLabel;
  final VoidCallback? onPrimary;
  final bool primaryLoading;
  final String? secondaryLabel;
  final VoidCallback? onSecondary;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(color: AppColors.white, boxShadow: LPElevation.level2),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.all(LPSpacing.px16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (secondaryLabel != null) ...[
                LPButton(label: secondaryLabel!, onPressed: onSecondary, variant: LPButtonVariant.secondary),
                const SizedBox(height: LPSpacing.px8),
              ],
              LPButton(label: primaryLabel, onPressed: onPrimary, isLoading: primaryLoading),
            ],
          ),
        ),
      ),
    );
  }
}
