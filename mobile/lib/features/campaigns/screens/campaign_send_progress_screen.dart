import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/router/route_names.dart';
import '../../../core/theme/spacing_tokens.dart';
import '../../../shared/widgets/lp_button.dart';

class CampaignSendProgressScreen extends StatelessWidget {
  const CampaignSendProgressScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(LPSpacing.px24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.check_circle, size: 96, color: Colors.green),
              const SizedBox(height: LPSpacing.px24),
              Text('Campaign Sent!', style: Theme.of(context).textTheme.headlineLarge, textAlign: TextAlign.center),
              const SizedBox(height: LPSpacing.px8),
              const Text('Your WhatsApp campaign was queued successfully.', textAlign: TextAlign.center),
              const SizedBox(height: LPSpacing.px32),
              LPButton(label: 'Back to Campaigns', onPressed: () => context.go(RouteNames.campaigns)),
            ],
          ),
        ),
      ),
    );
  }
}
