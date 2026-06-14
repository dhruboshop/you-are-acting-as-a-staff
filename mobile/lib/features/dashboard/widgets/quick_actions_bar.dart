import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/router/route_names.dart';
import '../../../core/theme/spacing_tokens.dart';
import '../../../shared/widgets/lp_button.dart';

class QuickActionsBar extends StatelessWidget {
  const QuickActionsBar({super.key});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(child: LPButton(label: 'Show QR', leadingIcon: Icons.qr_code, variant: LPButtonVariant.secondary, onPressed: () => context.go(RouteNames.qrCode))),
        const SizedBox(width: LPSpacing.px12),
        Expanded(child: LPButton(label: 'Send Campaign', leadingIcon: Icons.campaign, onPressed: () => context.go(RouteNames.campaigns))),
      ],
    );
  }
}
