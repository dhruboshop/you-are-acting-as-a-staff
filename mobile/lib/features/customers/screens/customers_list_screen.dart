import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/router/route_names.dart';
import '../../../core/theme/color_tokens.dart';
import '../../../core/theme/spacing_tokens.dart';
import '../../../data/models/customer_model.dart';
import '../../../shared/widgets/lp_customer_card.dart';
import '../../../shared/widgets/lp_empty_state.dart';
import '../../../shared/widgets/lp_filter_chip_row.dart';
import '../providers/customers_provider.dart';

class CustomersListScreen extends ConsumerWidget {
  const CustomersListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(customersProvider);
    final notifier = ref.read(customersProvider.notifier);
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Customers'), actions: [Padding(padding: const EdgeInsets.all(12), child: Chip(label: Text('${state.customers.length}')))]),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(LPSpacing.px16),
            child: SearchBar(hintText: 'Search by name or number...', leading: const Icon(Icons.search), onChanged: notifier.search),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: LPSpacing.px16),
            child: LPFilterChipRow(
              options: const [
                LPFilterOption('all', 'All'),
                LPFilterOption('thisMonth', 'This Month'),
                LPFilterOption('soonBirthdays', 'Birthdays Soon'),
                LPFilterOption('lowRating', 'Low Rating'),
              ],
              selectedValue: state.activeFilter.name,
              onSelected: (value) => notifier.setFilter(CustomerFilter.values.firstWhere((filter) => filter.name == value)),
            ),
          ),
          Expanded(
            child: state.isLoading
                ? const Center(child: CircularProgressIndicator())
                : state.customers.isEmpty
                    ? LPEmptyState(title: 'No customers yet', subtitle: 'Your first customer is one QR scan away.', ctaLabel: 'View QR Code', onCtaTap: () => context.go(RouteNames.qrCode))
                    : ListView.builder(
                        padding: const EdgeInsets.all(LPSpacing.px16),
                        itemCount: state.customers.length,
                        itemBuilder: (_, index) {
                          final customer = state.customers[index];
                          return Padding(
                            padding: const EdgeInsets.only(bottom: LPSpacing.px8),
                            child: LPCustomerCard(customer: customer, onTap: () => context.push(RouteNames.customerDetailPath(customer.id))),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}
