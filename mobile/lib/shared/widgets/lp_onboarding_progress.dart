import 'package:flutter/material.dart';

class LPOnboardingProgress extends StatelessWidget {
  const LPOnboardingProgress({required this.totalSteps, required this.currentStep, super.key});
  final int totalSteps;
  final int currentStep;

  @override
  Widget build(BuildContext context) {
    return LinearProgressIndicator(value: currentStep / totalSteps, minHeight: 4, color: Theme.of(context).colorScheme.secondary);
  }
}
