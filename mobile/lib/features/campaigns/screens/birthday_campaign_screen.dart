import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/router/route_names.dart';
import '../../../core/theme/spacing_tokens.dart';
import '../../../shared/widgets/lp_bottom_action_bar.dart';
import '../../../shared/widgets/lp_card.dart';
import '../../../shared/widgets/lp_customer_card.dart';
import '../../../shared/widgets/lp_section_header.dart';
import '../providers/campaigns_provider.dart';

class BirthdayCampaignScreen extends ConsumerWidget {
  const BirthdayCampaignScreen({this.isAnniversary = false, super.key});
  final bool isAnniversary;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(birthdayCampaignProvider);
    final notifier = ref.read(birthdayCampaignProvider.notifier);
    return Scaffold(
      appBar: AppBar(title: Text(isAnniversary ? 'Anniversary Campaign' : 'Birthday Campaign')),
      body: Column(children: [
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(LPSpacing.px16),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              LPSectionHeader(title: isAnniversary ? 'Upcoming Anniversaries' : 'Upcoming Birthdays'),
              const SizedBox(height: LPSpacing.px12),
              for (final customer in state.customers) Padding(padding: const EdgeInsets.only(bottom: 8), child: LPCustomerCard(customer: customer, showBirthdayBadge: true, showRating: false, onTap: () {})),
              const SizedBox(height: LPSpacing.px24),
              const LPSectionHeader(title: 'Message Preview', actionLabel: 'Edit'),
              LPCard(child: Text(state.message)),
              const SizedBox(height: LPSpacing.px24),
              LPCard(child: SwitchListTile(title: const Text('Auto-send'), subtitle: const Text('Sends automatically at 9am'), value: state.autoSendEnabled, onChanged: (_) => notifier.toggleAutoSend())),
            ]),
          ),
        ),
        LPBottomActionBar(
          primaryLabel: state.customers.isEmpty ? 'No upcoming birthdays' : 'Send to ${state.customers.length} customers',
          onPrimary: state.customers.isEmpty
              ? null
              : () async {
                  await notifier.send();
                  if (context.mounted) context.push(RouteNames.campaignProgress);
                },
          primaryLoading: state.isSending,
        ),
      ]),
    );
  }
}
