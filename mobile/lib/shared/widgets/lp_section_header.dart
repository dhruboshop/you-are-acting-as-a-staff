import 'package:flutter/material.dart';

import '../../core/theme/text_tokens.dart';

class LPSectionHeader extends StatelessWidget {
  const LPSectionHeader({required this.title, this.actionLabel, this.onAction, super.key});
  final String title;
  final String? actionLabel;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(title, style: LPTextStyle.headlineMedium),
        if (actionLabel != null) TextButton(onPressed: onAction, child: Text(actionLabel!)),
      ],
    );
  }
}
