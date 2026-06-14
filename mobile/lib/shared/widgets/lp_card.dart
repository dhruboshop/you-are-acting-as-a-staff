import 'package:flutter/material.dart';

import '../../core/theme/color_tokens.dart';
import '../../core/theme/elevation_tokens.dart';
import '../../core/theme/radius_tokens.dart';
import '../../core/theme/spacing_tokens.dart';

class LPCard extends StatelessWidget {
  const LPCard({
    required this.child,
    this.padding = const EdgeInsets.all(LPSpacing.cardPadding),
    this.backgroundColor,
    this.borderRadius,
    this.shadow = LPElevation.level1,
    this.border,
    this.onTap,
    this.isSelected = false,
    super.key,
  });

  final Widget child;
  final EdgeInsetsGeometry padding;
  final Color? backgroundColor;
  final BorderRadius? borderRadius;
  final List<BoxShadow> shadow;
  final Border? border;
  final VoidCallback? onTap;
  final bool isSelected;

  @override
  Widget build(BuildContext context) {
    final radius = borderRadius ?? BorderRadius.circular(LPRadius.md);
    final content = Container(
      padding: padding,
      decoration: BoxDecoration(
        color: backgroundColor ?? AppColors.surface,
        borderRadius: radius,
        border: border ?? Border.all(color: isSelected ? Theme.of(context).colorScheme.secondary : AppColors.border, width: isSelected ? 2 : 1),
        boxShadow: shadow,
      ),
      child: child,
    );
    if (onTap == null) return content;
    return Material(
      color: Colors.transparent,
      child: InkWell(borderRadius: radius, onTap: onTap, child: content),
    );
  }
}
