import 'package:flutter/material.dart';

import '../../../core/theme/spacing_tokens.dart';
import '../../../shared/widgets/lp_button.dart';
import '../../../shared/widgets/lp_card.dart';

class HelpScreen extends StatelessWidget {
  const HelpScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Help')),
      body: ListView(padding: const EdgeInsets.all(LPSpacing.px16), children: const [
        LPCard(child: Text('Step 1: Create your business and generate QR')),
        SizedBox(height: LPSpacing.px8),
        LPCard(child: Text('Step 2: Place QR where customers can scan')),
        SizedBox(height: LPSpacing.px8),
        LPCard(child: Text('Step 3: Send campaigns and grow repeat sales')),
        ExpansionTile(title: Text('How does the QR code work?'), children: [Padding(padding: EdgeInsets.all(16), child: Text('Customers scan it to register with your shop.'))]),
        ExpansionTile(title: Text('Will customers receive spam?'), children: [Padding(padding: EdgeInsets.all(16), child: Text('Only consented customers should receive messages.'))]),
      ]),
      bottomNavigationBar: Padding(padding: const EdgeInsets.all(16), child: LPButton(variant: LPButtonVariant.whatsapp, label: 'Chat with Support', onPressed: () {})),
    );
  }
}
