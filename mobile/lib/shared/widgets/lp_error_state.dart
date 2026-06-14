import 'package:flutter/material.dart';

import '../../core/theme/color_tokens.dart';
import '../../core/theme/spacing_tokens.dart';
import '../../core/theme/text_tokens.dart';
import 'lp_button.dart';

enum LPErrorType { network, server, auth, campaignFailed, qrFailed }

class LPErrorState extends StatelessWidget {
  const LPErrorState({required this.type, required this.onRetry, this.customMessage, super.key});
  final LPErrorType type;
  final String? customMessage;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    final data = switch (type) {
      LPErrorType.network => (Icons.wifi_off_rounded, 'No connection', 'Check your internet and try again.', 'Try Again'),
      LPErrorType.server => (Icons.cloud_off_rounded, 'Something went wrong', 'Our servers had an issue.', 'Try Again'),
      LPErrorType.auth => (Icons.lock_outline_rounded, 'Session expired', 'Please sign in again.', 'Sign In'),
      LPErrorType.campaignFailed => (Icons.warning_amber_rounded, 'Could not send campaigns', 'Your WhatsApp connection may be interrupted.', 'Reconnect WhatsApp'),
      LPErrorType.qrFailed => (Icons.qr_code_2_rounded, 'Could not load your QR code', 'Pull down to refresh.', 'Refresh'),
    };
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(LPSpacing.px32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(data.$1, size: 48, color: AppColors.textMuted),
            const SizedBox(height: LPSpacing.px16),
            Text(data.$2, style: LPTextStyle.headlineMedium, textAlign: TextAlign.center),
            const SizedBox(height: LPSpacing.px8),
            Text(customMessage ?? data.$3, style: LPTextStyle.bodyMedium.copyWith(color: AppColors.textSecondary), textAlign: TextAlign.center),
            const SizedBox(height: LPSpacing.px24),
            LPButton(label: data.$4, onPressed: onRetry),
          ],
        ),
      ),
    );
  }
}
