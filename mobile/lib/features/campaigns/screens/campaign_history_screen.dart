import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/spacing_tokens.dart';
import '../providers/campaigns_provider.dart';

class CampaignHistoryScreen extends ConsumerWidget {
  const CampaignHistoryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final history = ref.watch(campaignHistoryProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Campaign History')),
      body: history.when(
        data: (items) => ListView.separated(
          padding: const EdgeInsets.all(LPSpacing.px16),
          itemCount: items.length,
          separatorBuilder: (_, __) => const Divider(),
          itemBuilder: (_, index) => ListTile(title: Text(items[index].festivalName ?? items[index].type.name), subtitle: Text('${items[index].deliveredCount}/${items[index].recipientCount} delivered')),
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(child: Text(error.toString())),
      ),
    );
  }
}
