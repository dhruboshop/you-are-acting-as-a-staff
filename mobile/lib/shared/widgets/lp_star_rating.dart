import 'package:flutter/material.dart';

import '../../core/theme/color_tokens.dart';

class LPStarRating extends StatelessWidget {
  const LPStarRating({required this.rating, this.interactive = false, this.starSize = 24, this.showLabel = false, this.onChanged, super.key});
  final double rating;
  final bool interactive;
  final double starSize;
  final bool showLabel;
  final ValueChanged<double>? onChanged;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        for (var i = 1; i <= 5; i++)
          GestureDetector(
            onTap: interactive ? () => onChanged?.call(i.toDouble()) : null,
            child: Icon(i <= rating.round() ? Icons.star : Icons.star_border, size: starSize, color: AppColors.warning),
          ),
        if (showLabel) ...[const SizedBox(width: 4), Text(rating.toStringAsFixed(1))],
      ],
    );
  }
}
