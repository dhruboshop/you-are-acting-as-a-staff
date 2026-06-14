import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/spacing_tokens.dart';
import '../../../shared/widgets/lp_card.dart';
import '../../../shared/widgets/lp_loading_state.dart';
import '../../../shared/widgets/lp_section_header.dart';
import '../../../shared/widgets/lp_star_rating.dart';
import '../providers/feedback_provider.dart';

class FeedbackDashboardScreen extends ConsumerWidget {
  const FeedbackDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final data = ref.watch(feedbackProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Customer Feedback')),
      body: data.when(
        data: (feedback) => SingleChildScrollView(
          padding: const EdgeInsets.all(LPSpacing.px16),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            LPCard(child: Row(children: [Text(feedback.averageRating.toStringAsFixed(1), style: Theme.of(context).textTheme.displayLarge), const SizedBox(width: 16), LPStarRating(rating: feedback.averageRating, starSize: 20, showLabel: true)])),
            const SizedBox(height: LPSpacing.px16),
            LPCard(
              child: SizedBox(
                height: 180,
                child: BarChart(
                  BarChartData(
                    borderData: FlBorderData(show: false),
                    titlesData: const FlTitlesData(leftTitles: AxisTitles(), topTitles: AxisTitles(), rightTitles: AxisTitles()),
                    barGroups: feedback.distribution.entries.map((entry) => BarChartGroupData(x: entry.key, barRods: [BarChartRodData(toY: entry.value.toDouble(), width: 18)])).toList(),
                  ),
                ),
              ),
            ),
            const SizedBox(height: LPSpacing.px24),
            const LPSectionHeader(title: 'Recent Feedback'),
            for (final item in feedback.recentFeedback) LPCard(child: ListTile(title: Text(item.customerName), subtitle: Text(item.text ?? 'No comment'), trailing: LPStarRating(rating: item.rating, starSize: 12))),
          ]),
        ),
        loading: () => const LPLoadingState(),
        error: (error, _) => Center(child: Text(error.toString())),
      ),
    );
  }
}
