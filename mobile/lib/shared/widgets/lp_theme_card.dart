import 'package:flutter/material.dart';

import '../../core/theme/business_theme.dart';
import '../../core/theme/radius_tokens.dart';
import '../../core/theme/spacing_tokens.dart';
import 'lp_card.dart';

class LPThemeCard extends StatelessWidget {
  const LPThemeCard({required this.theme, required this.selected, required this.onSelect, super.key});
  final LPBusinessTheme theme;
  final bool selected;
  final VoidCallback onSelect;

  @override
  Widget build(BuildContext context) {
    return LPCard(
      onTap: onSelect,
      isSelected: selected,
      padding: EdgeInsets.zero,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            height: 80,
            decoration: BoxDecoration(
              gradient: LinearGradient(colors: theme.colors.gradient),
              borderRadius: const BorderRadius.vertical(top: Radius.circular(LPRadius.md)),
            ),
            child: selected ? const Align(alignment: Alignment.topRight, child: Padding(padding: EdgeInsets.all(8), child: Icon(Icons.check_circle, color: Colors.white))) : null,
          ),
          Padding(
            padding: const EdgeInsets.all(LPSpacing.px12),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(theme.name), Text(theme.subtitle)]),
          ),
        ],
      ),
    );
  }
}
