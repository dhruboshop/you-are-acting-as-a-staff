import 'package:flutter/material.dart';

import '../../core/theme/color_tokens.dart';
import '../../core/theme/text_tokens.dart';
import 'lp_card.dart';

enum LPStatCardVariant { normal, alert, positive, empty }

class LPStatCard extends StatelessWidget {
  const LPStatCard({required this.value, required this.label, required this.icon, this.variant = LPStatCardVariant.normal, this.onTap, this.isLoading = false, super.key});
  final String value;
  final String label;
  final IconData icon;
  final LPStatCardVariant variant;
  final VoidCallback? onTap;
  final bool isLoading;

  @override
  Widget build(BuildContext context) {
    final color = switch (variant) {
      LPStatCardVariant.alert => AppColors.warning,
      LPStatCardVariant.positive => AppColors.success,
      LPStatCardVariant.empty => AppColors.textMuted,
      LPStatCardVariant.normal => Theme.of(context).colorScheme.secondary,
    };
    return SizedBox(
      height: 100,
      child: LPCard(
        onTap: onTap,
        child: isLoading
            ? const Center(child: CircularProgressIndicator())
            : Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Align(alignment: Alignment.topRight, child: Icon(icon, size: 18, color: color)),
                  Text(value, style: LPTextStyle.metricValue),
                  Text(label, style: LPTextStyle.labelMedium.copyWith(color: AppColors.textSecondary)),
                ],
              ),
      ),
    );
  }
}
