import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/router/route_names.dart';
import '../../../core/theme/color_tokens.dart';
import '../../../core/theme/spacing_tokens.dart';
import '../../../data/models/campaign_model.dart';
import '../../../shared/widgets/lp_campaign_card.dart';
import '../../../shared/widgets/lp_card.dart';
import '../../../shared/widgets/lp_error_state.dart';
import '../../../shared/widgets/lp_loading_state.dart';
import '../../../shared/widgets/lp_section_header.dart';
import '../providers/campaigns_provider.dart';

class CampaignDashboardScreen extends ConsumerWidget {
  const CampaignDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dashboard = ref.watch(campaignDashboardProvider);
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Campaigns')),
      body: dashboard.when(
        data: (data) => SingleChildScrollView(
          padding: const EdgeInsets.all(LPSpacing.px16),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const LPSectionHeader(title: 'Smart Campaigns'),
            const SizedBox(height: LPSpacing.px12),
            LPCampaignCard(type: CampaignType.birthday, enabled: data.birthdayAutoSend, totalSent: data.birthdayTotalSent, onToggle: () {}, onTap: () => context.push(RouteNames.birthdayCampaign)),
            const SizedBox(height: LPSpacing.px12),
            LPCampaignCard(type: CampaignType.anniversary, enabled: data.anniversaryAutoSend, totalSent: data.anniversaryTotalSent, onToggle: () {}, onTap: () => context.push(RouteNames.anniversaryCamp)),
            const SizedBox(height: LPSpacing.px24),
            const LPSectionHeader(title: 'Manual Campaigns'),
            const SizedBox(height: LPSpacing.px12),
            LPCard(onTap: () => context.push(RouteNames.festivalCampaign), child: const ListTile(leading: Icon(Icons.celebration), title: Text('Festival Campaign'), subtitle: Text('Send Diwali, Eid, Christmas wishes'))),
            const SizedBox(height: LPSpacing.px24),
            LPSectionHeader(title: 'Recent Activity', actionLabel: 'History', onAction: () => context.push(RouteNames.campaignHistory)),
            for (final send in data.recentSends) ListTile(title: Text(send.festivalName ?? send.type.name), subtitle: Text('${send.recipientCount} recipients')),
          ]),
        ),
        loading: () => const LPLoadingState(),
        error: (_, __) => LPErrorState(type: LPErrorType.server, onRetry: () => ref.invalidate(campaignDashboardProvider)),
      ),
    );
  }
}
