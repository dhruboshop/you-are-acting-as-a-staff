import 'package:flutter/material.dart';

import '../../core/theme/color_tokens.dart';
import '../../core/theme/spacing_tokens.dart';
import '../../core/theme/text_tokens.dart';

class LPMetricTile extends StatelessWidget {
  const LPMetricTile({required this.label, required this.value, this.icon, this.valueColor, super.key});

  final String label;
  final String value;
  final IconData? icon;
  final Color? valueColor;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        if (icon != null) ...[Icon(icon, size: 16, color: Theme.of(context).colorScheme.secondary), const SizedBox(width: LPSpacing.px8)],
        Text(label, style: LPTextStyle.bodyMedium.copyWith(color: AppColors.textSecondary)),
        const Spacer(),
        Text(value, style: LPTextStyle.titleMedium.copyWith(color: valueColor ?? AppColors.textPrimary)),
      ],
    );
  }
}
