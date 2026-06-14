import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/router/route_names.dart';
import '../../../core/theme/color_tokens.dart';
import '../../../core/theme/spacing_tokens.dart';
import '../../../shared/widgets/lp_avatar.dart';
import '../../../shared/widgets/lp_empty_state.dart';
import '../../../shared/widgets/lp_error_state.dart';
import '../../../shared/widgets/lp_section_header.dart';
import '../../auth/providers/auth_provider.dart';
import '../providers/dashboard_provider.dart';
import '../widgets/greeting_header.dart';
import '../widgets/metrics_grid.dart';
import '../widgets/quick_actions_bar.dart';
import '../widgets/recent_customers_section.dart';
import '../widgets/upcoming_birthdays_section.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dash = ref.watch(dashboardProvider);
    final birthdays = ref.watch(upcomingBirthdaysProvider);
    final recent = ref.watch(recentCustomersProvider);
    final user = ref.watch(authUserProvider);
    final business = ref.watch(businessProvider).valueOrNull;
    return Scaffold(
      backgroundColor: AppColors.background,
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(dashboardProvider);
          ref.invalidate(upcomingBirthdaysProvider);
          ref.invalidate(recentCustomersProvider);
        },
        child: CustomScrollView(
          slivers: [
            SliverAppBar(
              floating: true,
              title: GreetingHeader(ownerName: user?.displayName?.split(' ').first ?? 'there', businessName: business?.name ?? 'Your business'),
              actions: [
                Padding(
                  padding: const EdgeInsets.only(right: LPSpacing.px16),
                  child: LPAvatar(name: user?.displayName ?? 'Owner', size: 36, onTap: () => context.push(RouteNames.businessProfile)),
                ),
              ],
            ),
            SliverPadding(
              padding: const EdgeInsets.all(LPSpacing.px16),
              sliver: SliverList(
                delegate: SliverChildListDelegate([
                  dash.when(data: (data) => MetricsGrid(data: data), loading: () => const Center(child: CircularProgressIndicator()), error: (_, __) => LPErrorState(type: LPErrorType.server, onRetry: () => ref.invalidate(dashboardProvider))),
                  const SizedBox(height: LPSpacing.px24),
                  const QuickActionsBar(),
                  const SizedBox(height: LPSpacing.px24),
                  LPSectionHeader(title: 'Upcoming Birthdays', actionLabel: 'View All', onAction: () => context.go(RouteNames.customers)),
                  birthdays.when(data: (list) => list.isEmpty ? const Text('No birthdays in the next 7 days') : UpcomingBirthdaysSection(birthdays: list), loading: () => const LinearProgressIndicator(), error: (_, __) => const SizedBox()),
                  const SizedBox(height: LPSpacing.px24),
                  LPSectionHeader(title: 'Recent Customers', actionLabel: 'View All', onAction: () => context.go(RouteNames.customers)),
                  recent.when(data: (list) => list.isEmpty ? LPEmptyState(title: 'No customers yet', subtitle: 'Share your QR code and your first customer will appear here.', ctaLabel: 'View QR Code', onCtaTap: () => context.go(RouteNames.qrCode)) : RecentCustomersSection(customers: list), loading: () => const LinearProgressIndicator(), error: (_, __) => const SizedBox()),
                  const SizedBox(height: 80),
                ]),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
