import 'package:flutter/material.dart';

import '../../core/theme/color_tokens.dart';
import '../../core/theme/spacing_tokens.dart';
import '../../data/models/customer_model.dart';
import 'lp_avatar.dart';
import 'lp_card.dart';
import 'lp_star_rating.dart';

class LPCustomerCard extends StatelessWidget {
  const LPCustomerCard({required this.customer, required this.onTap, this.showBirthdayBadge = false, this.showRating = true, super.key});
  final CustomerModel customer;
  final VoidCallback onTap;
  final bool showBirthdayBadge;
  final bool showRating;

  @override
  Widget build(BuildContext context) {
    return LPCard(
      onTap: onTap,
      padding: const EdgeInsets.symmetric(horizontal: LPSpacing.px16, vertical: LPSpacing.px12),
      child: Row(
        children: [
          LPAvatar(name: customer.name, size: 44),
          const SizedBox(width: LPSpacing.px12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(customer.name, style: Theme.of(context).textTheme.titleMedium),
                Text(customer.phoneFormatted, style: const TextStyle(color: AppColors.textMuted)),
              ],
            ),
          ),
          if (showRating) LPStarRating(rating: customer.rating, starSize: 12, showLabel: true),
          if (showBirthdayBadge) Text('in ${customer.daysUntilBirthday}d'),
        ],
      ),
    );
  }
}
