import 'package:flutter/material.dart';

class LPFilterOption {
  const LPFilterOption(this.value, this.label, {this.icon});
  final String value;
  final String label;
  final IconData? icon;
}

class LPFilterChipRow extends StatelessWidget {
  const LPFilterChipRow({required this.options, required this.selectedValue, required this.onSelected, super.key});
  final List<LPFilterOption> options;
  final String selectedValue;
  final ValueChanged<String> onSelected;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: options
            .map((option) => Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    label: Text(option.label),
                    avatar: option.icon == null ? null : Icon(option.icon, size: 16),
                    selected: option.value == selectedValue,
                    onSelected: (_) => onSelected(option.value),
                  ),
                ))
            .toList(),
      ),
    );
  }
}
