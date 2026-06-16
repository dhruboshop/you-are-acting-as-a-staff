import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/router/route_names.dart';
import '../../../core/theme/color_tokens.dart';
import '../../../core/theme/spacing_tokens.dart';
import '../../../core/theme/text_tokens.dart';
import '../../../data/models/business_model.dart';
import '../../../shared/widgets/lp_bottom_action_bar.dart';
import '../../../shared/widgets/lp_onboarding_progress.dart';
import '../providers/onboarding_provider.dart';

class BusinessSetupScreen extends ConsumerStatefulWidget {
  const BusinessSetupScreen({super.key});

  @override
  ConsumerState<BusinessSetupScreen> createState() => _BusinessSetupScreenState();
}

class _BusinessSetupScreenState extends ConsumerState<BusinessSetupScreen> {
  final _page = PageController();
  final _name = TextEditingController();
  final _phone = TextEditingController();
  final _city = TextEditingController();
  BusinessCategory? _category;
  int _step = 1;
  String? _error;

  @override
  void dispose() {
    _page.dispose();
    _name.dispose();
    _phone.dispose();
    _city.dispose();
    super.dispose();
  }

  void _continue() {
    if (_step == 1) {
      if (_name.text.trim().length < 2 || _category == null) {
        setState(() => _error = 'Enter a business name and select a business type.');
        return;
      }
      ref.read(onboardingStateProvider.notifier).setStep1(_name.text.trim(), _category!);
      setState(() {
        _step = 2;
        _error = null;
      });
      _page.nextPage(duration: const Duration(milliseconds: 250), curve: Curves.easeOut);
      return;
    }
    final digits = _phone.text.replaceAll(RegExp(r'\D'), '');
    if (digits.length < 10 || _city.text.trim().length < 2) {
      setState(() => _error = 'Enter a valid WhatsApp number and city.');
      return;
    }
    ref.read(onboardingStateProvider.notifier).setStep2('+91$digits', _city.text.trim());
    context.go(RouteNames.themeSelection);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.white,
      appBar: AppBar(title: Text(_step == 1 ? 'Your Business' : 'Contact Info'), leading: _step == 2 ? BackButton(onPressed: _back) : null),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          LPOnboardingProgress(totalSteps: 3, currentStep: _step),
          Expanded(
            child: PageView(
              controller: _page,
              physics: const NeverScrollableScrollPhysics(),
              children: [_step1(), _step2()],
            ),
          ),
          if (_error != null) Padding(padding: const EdgeInsets.all(LPSpacing.px16), child: Text(_error!, style: const TextStyle(color: AppColors.error))),
          LPBottomActionBar(primaryLabel: 'Continue', onPrimary: _continue, secondaryLabel: _step == 2 ? 'Back' : null, onSecondary: _step == 2 ? _back : null),
        ],
      ),
    );
  }

  void _back() {
    setState(() => _step = 1);
    _page.previousPage(duration: const Duration(milliseconds: 250), curve: Curves.easeOut);
  }

  Widget _step1() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(LPSpacing.px24),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Text('Tell us about your business', style: LPTextStyle.headlineMedium),
        const SizedBox(height: LPSpacing.px8),
        const Text('We use this to customize your experience.', style: TextStyle(color: AppColors.textSecondary)),
        const SizedBox(height: LPSpacing.px32),
        TextField(controller: _name, decoration: const InputDecoration(labelText: 'Business Name', hintText: 'e.g. Zappy Demo Shop')),
        const SizedBox(height: LPSpacing.fieldGap),
        const Text('Business Type'),
        const SizedBox(height: LPSpacing.px8),
        GridView.count(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisCount: MediaQuery.sizeOf(context).width < 360 ? 2 : 3,
          childAspectRatio: 1.5,
          children: BusinessCategory.values.map((category) {
            return Padding(
              padding: const EdgeInsets.all(4),
              child: ChoiceChip(
                label: Text(category.name),
                selected: _category == category,
                onSelected: (_) => setState(() => _category = category),
              ),
            );
          }).toList(),
        ),
      ]),
    );
  }

  Widget _step2() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(LPSpacing.px24),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Text('How do customers reach you?', style: LPTextStyle.headlineMedium),
        const SizedBox(height: LPSpacing.px8),
        const Text('This number will send WhatsApp messages to your customers.', style: TextStyle(color: AppColors.textSecondary)),
        const SizedBox(height: LPSpacing.px32),
        TextField(controller: _phone, keyboardType: TextInputType.phone, decoration: const InputDecoration(labelText: 'WhatsApp Business Number', prefixText: '+91 ')),
        const SizedBox(height: LPSpacing.fieldGap),
        TextField(controller: _city, decoration: const InputDecoration(labelText: 'City', hintText: 'e.g. Mumbai')),
      ]),
    );
  }
}
