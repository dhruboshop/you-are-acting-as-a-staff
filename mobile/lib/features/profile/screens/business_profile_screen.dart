import 'package:flutter/material.dart';

import '../../../core/theme/spacing_tokens.dart';
import '../../../shared/widgets/lp_bottom_action_bar.dart';
import '../../../shared/widgets/lp_section_header.dart';
import '../../../shared/widgets/lp_theme_card.dart';
import '../../../core/theme/business_theme.dart';

class BusinessProfileScreen extends StatelessWidget {
  const BusinessProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Business Profile'), actions: [TextButton(onPressed: () {}, child: const Text('Save'))]),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(LPSpacing.px16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Container(height: 120, decoration: BoxDecoration(color: Theme.of(context).colorScheme.primary, borderRadius: BorderRadius.circular(12)), child: const Center(child: Icon(Icons.store, color: Colors.white, size: 48))),
          const SizedBox(height: LPSpacing.px24),
          const LPSectionHeader(title: 'Business Info'),
          const TextField(decoration: InputDecoration(labelText: 'Business Name')),
          const SizedBox(height: LPSpacing.fieldGap),
          const TextField(decoration: InputDecoration(labelText: 'City')),
          const SizedBox(height: LPSpacing.px24),
          const LPSectionHeader(title: 'WhatsApp'),
          const TextField(decoration: InputDecoration(labelText: 'WhatsApp Business Number')),
          const SizedBox(height: LPSpacing.px24),
          const LPSectionHeader(title: 'QR Settings'),
          const TextField(decoration: InputDecoration(labelText: 'QR Tagline')),
          const SizedBox(height: LPSpacing.px24),
          const LPSectionHeader(title: 'Visual Theme'),
          LPThemeCard(theme: LPBusinessTheme.luxury, selected: true, onSelect: () {}),
          const SizedBox(height: 100),
        ]),
      ),
      bottomNavigationBar: LPBottomActionBar(primaryLabel: 'Save Changes', onPrimary: () {}),
    );
  }
}
