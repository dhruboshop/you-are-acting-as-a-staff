import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/extensions/datetime_extensions.dart';
import '../../../core/theme/spacing_tokens.dart';
import '../../../shared/widgets/lp_avatar.dart';
import '../../../shared/widgets/lp_card.dart';
import '../../../shared/widgets/lp_error_state.dart';
import '../../../shared/widgets/lp_loading_state.dart';
import '../../../shared/widgets/lp_metric_tile.dart';
import '../../../shared/widgets/lp_section_header.dart';
import '../../../shared/widgets/lp_star_rating.dart';
import '../providers/customers_provider.dart';

class CustomerDetailScreen extends ConsumerWidget {
  const CustomerDetailScreen({required this.customerId, super.key});
  final String customerId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final customer = ref.watch(customerDetailProvider(customerId));
    return customer.when(
      data: (c) => Scaffold(
        appBar: AppBar(title: Text(c.name), actions: [IconButton(onPressed: () {}, icon: const Icon(Icons.chat))]),
        body: SingleChildScrollView(
          padding: const EdgeInsets.all(LPSpacing.px16),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              LPAvatar(name: c.name, size: 64),
              const SizedBox(width: LPSpacing.px16),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(c.name, style: Theme.of(context).textTheme.titleLarge), Text(c.phoneFormatted), Text('Joined ${c.registeredAt.formattedDate}')])),
            ]),
            const SizedBox(height: LPSpacing.px16),
            LPCard(child: Column(children: [
              LPMetricTile(label: 'Birthday', value: c.birthday.formattedBirthday, icon: Icons.cake),
              const Divider(),
              LPMetricTile(label: 'Anniversary', value: c.anniversary?.formattedBirthday ?? 'Not provided', icon: Icons.favorite),
              const Divider(),
              LPMetricTile(label: 'Rating', value: '${c.rating} / 5.0', icon: Icons.star),
            ])),
            const SizedBox(height: LPSpacing.px16),
            if (c.feedback != null) LPCard(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [LPStarRating(rating: c.rating, starSize: 16), const SizedBox(height: 8), Text(c.feedback!)])),
            const SizedBox(height: LPSpacing.px16),
            const LPSectionHeader(title: 'Campaigns Sent'),
            const SizedBox(height: LPSpacing.px12),
            const Text('No campaign history yet.'),
          ]),
        ),
      ),
      loading: () => const Scaffold(body: LPLoadingState()),
      error: (_, __) => Scaffold(body: LPErrorState(type: LPErrorType.server, onRetry: () => ref.invalidate(customerDetailProvider(customerId)))),
    );
  }
}
