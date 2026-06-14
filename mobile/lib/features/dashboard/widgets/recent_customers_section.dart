import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/router/route_names.dart';
import '../../../core/theme/spacing_tokens.dart';
import '../../../data/models/customer_model.dart';
import '../../../shared/widgets/lp_customer_card.dart';

class RecentCustomersSection extends StatelessWidget {
  const RecentCustomersSection({required this.customers, super.key});
  final List<CustomerModel> customers;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: customers
          .map((customer) => Padding(
                padding: const EdgeInsets.only(bottom: LPSpacing.px8),
                child: LPCustomerCard(customer: customer, onTap: () => context.push(RouteNames.customerDetailPath(customer.id))),
              ))
          .toList(),
    );
  }
}
