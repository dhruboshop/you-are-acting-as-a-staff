import 'package:flutter/material.dart';

import '../../../core/theme/spacing_tokens.dart';
import '../../../data/models/customer_model.dart';
import '../../../shared/widgets/lp_avatar.dart';
import '../../../shared/widgets/lp_button.dart';

class UpcomingBirthdaysSection extends StatelessWidget {
  const UpcomingBirthdaysSection({required this.birthdays, super.key});
  final List<CustomerModel> birthdays;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: birthdays.take(3).map((customer) {
        return Padding(
          padding: const EdgeInsets.symmetric(vertical: LPSpacing.px8),
          child: Row(
            children: [
              LPAvatar(name: customer.name, size: 32),
              const SizedBox(width: LPSpacing.px8),
              Expanded(child: Text(customer.name)),
              Text('in ${customer.daysUntilBirthday}d'),
              const SizedBox(width: LPSpacing.px8),
              LPButton(label: 'Wish', variant: LPButtonVariant.ghost, isFullWidth: false, height: 32, onPressed: () {}),
            ],
          ),
        );
      }).toList(),
    );
  }
}
