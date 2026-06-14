import 'package:flutter/material.dart';

import '../../core/theme/color_tokens.dart';
import '../../core/theme/radius_tokens.dart';
import '../../core/theme/spacing_tokens.dart';

enum LPButtonVariant { primary, secondary, ghost, danger, whatsapp }

class LPButton extends StatelessWidget {
  const LPButton({
    required this.label,
    required this.onPressed,
    this.variant = LPButtonVariant.primary,
    this.isLoading = false,
    this.isFullWidth = true,
    this.leadingIcon,
    this.height = LPSpacing.buttonHeight,
    this.width,
    super.key,
  });

  final String label;
  final VoidCallback? onPressed;
  final LPButtonVariant variant;
  final bool isLoading;
  final bool isFullWidth;
  final IconData? leadingIcon;
  final double height;
  final double? width;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context).colorScheme;
    final bg = switch (variant) {
      LPButtonVariant.primary => theme.primary,
      LPButtonVariant.secondary => Colors.transparent,
      LPButtonVariant.ghost => Colors.transparent,
      LPButtonVariant.danger => AppColors.error,
      LPButtonVariant.whatsapp => AppColors.whatsappGreen,
    };
    final fg = switch (variant) {
      LPButtonVariant.secondary || LPButtonVariant.ghost => theme.primary,
      _ => AppColors.white,
    };
    final border = variant == LPButtonVariant.secondary ? BorderSide(color: theme.primary) : BorderSide.none;
    final child = isLoading
        ? SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: fg))
        : Row(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (leadingIcon != null) ...[Icon(leadingIcon, size: 18), const SizedBox(width: LPSpacing.px8)],
              Flexible(child: Text(label, overflow: TextOverflow.ellipsis)),
            ],
          );
    return SizedBox(
      height: height,
      width: width ?? (isFullWidth ? double.infinity : null),
      child: ElevatedButton(
        onPressed: isLoading ? null : onPressed,
        style: ElevatedButton.styleFrom(
          elevation: 0,
          backgroundColor: bg,
          foregroundColor: fg,
          disabledBackgroundColor: bg.withValues(alpha: 0.4),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(LPRadius.md), side: border),
        ),
        child: child,
      ),
    );
  }
}
