import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/spacing_tokens.dart';
import '../../../shared/widgets/lp_bottom_action_bar.dart';
import '../../../shared/widgets/lp_card.dart';
import '../../../shared/widgets/lp_section_header.dart';
import '../providers/campaigns_provider.dart';

class FestivalCampaignScreen extends ConsumerWidget {
  const FestivalCampaignScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(festivalCampaignProvider);
    final notifier = ref.read(festivalCampaignProvider.notifier);
    return Scaffold(
      appBar: AppBar(title: const Text('Festival Campaign')),
      body: Column(children: [
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(LPSpacing.px16),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const LPSectionHeader(title: 'Select Festival'),
              GridView.count(
                crossAxisCount: 3,
                childAspectRatio: 1,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                children: state.festivals.map((festival) => GestureDetector(onTap: () => notifier.selectFestival(festival), child: LPCard(isSelected: state.selectedFestival?.id == festival.id, child: Center(child: Column(mainAxisSize: MainAxisSize.min, children: [Text(festival.emoji), Text(festival.name, textAlign: TextAlign.center)]))))).toList(),
              ),
              if (state.selectedFestival != null) ...[
                const SizedBox(height: LPSpacing.px24),
                const LPSectionHeader(title: 'Message Preview', actionLabel: 'Edit'),
                LPCard(child: Text(state.message)),
                const SizedBox(height: LPSpacing.px24),
                LPCard(child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [const Icon(Icons.people), const SizedBox(width: 8), Text('Will send to ${state.recipientCount} customers')])),
              ],
            ]),
          ),
        ),
        LPBottomActionBar(primaryLabel: state.selectedFestival == null ? 'Select a festival' : 'Preview & Send', onPrimary: state.selectedFestival == null ? null : () {}),
      ]),
    );
  }
}
