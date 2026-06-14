import 'package:flutter/material.dart';

import '../../../data/models/customer_model.dart';
import '../../../shared/widgets/lp_stat_card.dart';

class MetricsGrid extends StatelessWidget {
  const MetricsGrid({required this.data, super.key});
  final DashboardData data;

  @override
  Widget build(BuildContext context) {
    final columns = MediaQuery.sizeOf(context).width > 600 ? 3 : 2;
    return GridView.count(
      crossAxisCount: columns,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      childAspectRatio: columns == 3 ? 1.2 : 1.5,
      children: [
        LPStatCard(value: '${data.totalCustomers}', label: 'Total Customers', icon: Icons.people),
        LPStatCard(value: '+${data.newThisMonth}', label: 'New This Month', icon: Icons.trending_up, variant: data.newThisMonth > 0 ? LPStatCardVariant.positive : LPStatCardVariant.normal),
        LPStatCard(value: '${data.birthdaysThisMonth}', label: 'Birthdays', icon: Icons.cake, variant: data.birthdaysThisMonth > 0 ? LPStatCardVariant.alert : LPStatCardVariant.normal),
        LPStatCard(value: '${data.anniversariesThisMonth}', label: 'Anniversaries', icon: Icons.favorite, variant: data.anniversariesThisMonth > 0 ? LPStatCardVariant.alert : LPStatCardVariant.normal),
        LPStatCard(value: data.averageRating.toStringAsFixed(1), label: 'Avg Rating', icon: Icons.star, variant: data.averageRating >= 4 ? LPStatCardVariant.positive : LPStatCardVariant.normal),
        LPStatCard(value: '${data.campaignsSentLast30Days}', label: 'Campaigns Sent', icon: Icons.campaign),
      ],
    );
  }
}
