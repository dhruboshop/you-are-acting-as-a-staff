import 'package:flutter/material.dart';

import '../../../core/theme/spacing_tokens.dart';
import '../../../shared/widgets/lp_card.dart';
import '../../../shared/widgets/lp_metric_tile.dart';

class SubscriptionScreen extends StatelessWidget {
  const SubscriptionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Subscription')),
      body: ListView(
        padding: const EdgeInsets.all(LPSpacing.px16),
        children: const [
          LPCard(child: Column(children: [LPMetricTile(label: 'Plan', value: 'Starter'), Divider(), LPMetricTile(label: 'Shops', value: '1'), Divider(), LPMetricTile(label: 'Customers', value: '248')])),
        ],
      ),
    );
  }
}
