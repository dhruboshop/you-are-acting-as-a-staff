import 'package:flutter/material.dart';

class LPShimmerList extends StatelessWidget {
  const LPShimmerList({required this.itemBuilder, this.itemCount = 5, super.key});
  final int itemCount;
  final Widget Function() itemBuilder;

  @override
  Widget build(BuildContext context) {
    return Column(children: List.generate(itemCount, (_) => Padding(padding: const EdgeInsets.only(bottom: 8), child: itemBuilder())));
  }
}
