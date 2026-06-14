class RouteNames {
  static const splash = '/';
  static const welcome = '/welcome';
  static const googleLogin = '/auth/google';
  static const businessSetup = '/onboarding/business-setup';
  static const themeSelection = '/onboarding/theme';
  static const dashboard = '/dashboard';
  static const qrCode = '/dashboard/qr';
  static const qrFullscreen = '/dashboard/qr/fullscreen';
  static const customers = '/dashboard/customers';
  static const customerDetail = '/dashboard/customers/:id';
  static const campaigns = '/dashboard/campaigns';
  static const birthdayCampaign = '/dashboard/campaigns/birthday';
  static const anniversaryCamp = '/dashboard/campaigns/anniversary';
  static const festivalCampaign = '/dashboard/campaigns/festival';
  static const campaignHistory = '/dashboard/campaigns/history';
  static const campaignProgress = '/dashboard/campaigns/progress';
  static const businessProfile = '/dashboard/profile';
  static const subscription = '/dashboard/subscription';
  static const feedbackDash = '/dashboard/feedback';
  static const settings = '/dashboard/settings';
  static const help = '/dashboard/help';

  static String customerDetailPath(String id) => '/dashboard/customers/$id';
}
