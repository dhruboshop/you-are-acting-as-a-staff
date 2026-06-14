import 'package:flutter/material.dart';

import '../../core/theme/color_tokens.dart';
import '../../core/theme/spacing_tokens.dart';

class LPBottomNav extends StatelessWidget {
  const LPBottomNav({required this.currentIndex, required this.onTabChanged, super.key});
  final int currentIndex;
  final ValueChanged<int> onTabChanged;

  @override
  Widget build(BuildContext context) {
    final tabs = [
      (Icons.home_outlined, Icons.home, 'Home'),
      (Icons.qr_code_outlined, Icons.qr_code, 'QR Code'),
      (Icons.people_outline, Icons.people, 'Customers'),
      (Icons.campaign_outlined, Icons.campaign, 'Campaigns'),
    ];
    return Container(
      decoration: const BoxDecoration(color: AppColors.white, border: Border(top: BorderSide(color: AppColors.divider))),
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: LPSpacing.bottomNavHeight,
          child: Row(
            children: [
              for (var i = 0; i < tabs.length; i++)
                Expanded(
                  child: Semantics(
                    selected: currentIndex == i,
                    label: '${tabs[i].$3} tab',
                    child: InkWell(
                      onTap: () => onTabChanged(i),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(currentIndex == i ? tabs[i].$2 : tabs[i].$1, color: currentIndex == i ? Theme.of(context).colorScheme.primary : AppColors.textMuted),
                          Text(tabs[i].$3, style: TextStyle(fontSize: 11, color: currentIndex == i ? Theme.of(context).colorScheme.primary : AppColors.textMuted)),
                        ],
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
