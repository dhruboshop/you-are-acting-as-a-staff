import 'package:flutter/material.dart';

import '../../core/theme/spacing_tokens.dart';
import '../../data/models/campaign_model.dart';
import 'lp_card.dart';

class LPCampaignCard extends StatelessWidget {
  const LPCampaignCard({required this.type, required this.enabled, required this.totalSent, required this.onToggle, required this.onTap, super.key});
  final CampaignType type;
  final bool enabled;
  final int totalSent;
  final VoidCallback onToggle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final title = type == CampaignType.birthday ? 'Birthday Campaign' : 'Anniversary Campaign';
    return LPCard(
      onTap: onTap,
      child: Row(
        children: [
          Icon(type == CampaignType.birthday ? Icons.cake : Icons.favorite, color: Theme.of(context).colorScheme.secondary),
          const SizedBox(width: LPSpacing.px12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(title), Text('Sent to $totalSent customers')])),
          Switch(value: enabled, onChanged: (_) => onToggle()),
        ],
      ),
    );
  }
}
