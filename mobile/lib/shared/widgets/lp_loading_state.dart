import 'package:flutter/material.dart';

import '../../core/theme/color_tokens.dart';
import '../../core/theme/spacing_tokens.dart';

class LPLoadingState extends StatelessWidget {
  const LPLoadingState({this.message, super.key});
  final String? message;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          CircularProgressIndicator(color: Theme.of(context).colorScheme.secondary, strokeWidth: 2.5),
          if (message != null) ...[
            const SizedBox(height: LPSpacing.px16),
            Text(message!, style: const TextStyle(color: AppColors.textMuted)),
          ],
        ],
      ),
    );
  }
}
