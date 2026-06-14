import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/screens/google_login_screen.dart';
import '../../features/auth/screens/splash_screen.dart';
import '../../features/auth/screens/welcome_screen.dart';
import '../../features/campaigns/screens/birthday_campaign_screen.dart';
import '../../features/campaigns/screens/campaign_dashboard_screen.dart';
import '../../features/campaigns/screens/campaign_history_screen.dart';
import '../../features/campaigns/screens/campaign_send_progress_screen.dart';
import '../../features/campaigns/screens/festival_campaign_screen.dart';
import '../../features/customers/screens/customer_detail_screen.dart';
import '../../features/customers/screens/customers_list_screen.dart';
import '../../features/dashboard/screens/dashboard_screen.dart';
import '../../features/feedback/screens/feedback_dashboard_screen.dart';
import '../../features/onboarding/screens/business_setup_screen.dart';
import '../../features/onboarding/screens/theme_selection_screen.dart';
import '../../features/profile/screens/business_profile_screen.dart';
import '../../features/profile/screens/help_screen.dart';
import '../../features/profile/screens/settings_screen.dart';
import '../../features/profile/screens/subscription_screen.dart';
import '../../features/qr/screens/qr_fullscreen_screen.dart';
import '../../features/qr/screens/qr_screen.dart';
import '../../features/whatsapp/screens/connect_whatsapp_screen.dart';
import '../../shared/widgets/lp_bottom_nav.dart';
import 'route_names.dart';

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: RouteNames.splash,
    routes: [
      GoRoute(path: RouteNames.splash, builder: (context, state) => const SplashScreen()),
      GoRoute(path: RouteNames.welcome, builder: (context, state) => const WelcomeScreen()),
      GoRoute(path: RouteNames.googleLogin, builder: (context, state) => const GoogleLoginScreen()),
      GoRoute(path: RouteNames.businessSetup, builder: (context, state) => const BusinessSetupScreen()),
      GoRoute(path: RouteNames.themeSelection, builder: (context, state) => const ThemeSelectionScreen()),
      GoRoute(path: RouteNames.connectWhatsapp, builder: (context, state) => const ConnectWhatsappScreen()),
      ShellRoute(
        builder: (context, state, child) => AppShell(child: child),
        routes: [
          GoRoute(path: RouteNames.dashboard, builder: (context, state) => const DashboardScreen()),
          GoRoute(path: RouteNames.qrCode, builder: (context, state) => const QrScreen()),
          GoRoute(path: RouteNames.qrFullscreen, builder: (context, state) => const QrFullscreenScreen()),
          GoRoute(path: RouteNames.customers, builder: (context, state) => const CustomersListScreen()),
          GoRoute(path: RouteNames.customerDetail, builder: (context, state) => CustomerDetailScreen(customerId: state.pathParameters['id']!)),
          GoRoute(path: RouteNames.campaigns, builder: (context, state) => const CampaignDashboardScreen()),
          GoRoute(path: RouteNames.birthdayCampaign, builder: (context, state) => const BirthdayCampaignScreen()),
          GoRoute(path: RouteNames.anniversaryCamp, builder: (context, state) => const BirthdayCampaignScreen(isAnniversary: true)),
          GoRoute(path: RouteNames.festivalCampaign, builder: (context, state) => const FestivalCampaignScreen()),
          GoRoute(path: RouteNames.campaignHistory, builder: (context, state) => const CampaignHistoryScreen()),
          GoRoute(path: RouteNames.campaignProgress, builder: (context, state) => const CampaignSendProgressScreen()),
          GoRoute(path: RouteNames.businessProfile, builder: (context, state) => const BusinessProfileScreen()),
          GoRoute(path: RouteNames.subscription, builder: (context, state) => const SubscriptionScreen()),
          GoRoute(path: RouteNames.feedbackDash, builder: (context, state) => const FeedbackDashboardScreen()),
          GoRoute(path: RouteNames.settings, builder: (context, state) => const SettingsScreen()),
          GoRoute(path: RouteNames.help, builder: (context, state) => const HelpScreen()),
        ],
      ),
    ],
  );
});

class AppShell extends StatelessWidget {
  const AppShell({required this.child, super.key});
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final location = GoRouterState.of(context).uri.toString();
    final index = _tabIndexFromLocation(location);
    return Scaffold(
      body: child,
      bottomNavigationBar: LPBottomNav(
        currentIndex: index,
        onTabChanged: (i) => context.go(_locationFromTabIndex(i)),
      ),
    );
  }

  int _tabIndexFromLocation(String location) {
    if (location.startsWith('/dashboard/qr')) return 1;
    if (location.startsWith('/dashboard/customers')) return 2;
    if (location.startsWith('/dashboard/campaigns')) return 3;
    return 0;
  }

  String _locationFromTabIndex(int i) => [RouteNames.dashboard, RouteNames.qrCode, RouteNames.customers, RouteNames.campaigns][i];
}
