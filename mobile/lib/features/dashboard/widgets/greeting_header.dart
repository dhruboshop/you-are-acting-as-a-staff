import 'package:flutter/material.dart';

import '../../../core/theme/color_tokens.dart';
import '../../../core/theme/text_tokens.dart';

class GreetingHeader extends StatelessWidget {
  const GreetingHeader({required this.ownerName, required this.businessName, super.key});
  final String ownerName;
  final String businessName;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Hi, $ownerName', style: LPTextStyle.headlineLarge),
        Text(businessName, style: LPTextStyle.bodySmall.copyWith(color: AppColors.textSecondary)),
      ],
    );
  }
}
