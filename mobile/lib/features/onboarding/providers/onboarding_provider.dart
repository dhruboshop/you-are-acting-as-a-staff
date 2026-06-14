import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/business_theme.dart';
import '../../../data/models/business_model.dart';
import '../../auth/providers/auth_provider.dart';

class OnboardingState {
  const OnboardingState({
    this.step = 1,
    this.businessName = '',
    this.category,
    this.phone = '',
    this.city = '',
    this.theme = BusinessThemeType.luxury,
    this.isSubmitting = false,
    this.error,
  });

  final int step;
  final String businessName;
  final BusinessCategory? category;
  final String phone;
  final String city;
  final BusinessThemeType theme;
  final bool isSubmitting;
  final String? error;

  OnboardingState copyWith({
    int? step,
    String? businessName,
    BusinessCategory? category,
    String? phone,
    String? city,
    BusinessThemeType? theme,
    bool? isSubmitting,
    String? error,
  }) {
    return OnboardingState(
      step: step ?? this.step,
      businessName: businessName ?? this.businessName,
      category: category ?? this.category,
      phone: phone ?? this.phone,
      city: city ?? this.city,
      theme: theme ?? this.theme,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      error: error,
    );
  }
}

final onboardingStateProvider = StateNotifierProvider<OnboardingNotifier, OnboardingState>((ref) {
  return OnboardingNotifier(ref);
});

class OnboardingNotifier extends StateNotifier<OnboardingState> {
  OnboardingNotifier(this._ref) : super(const OnboardingState());

  final Ref _ref;

  void setStep1(String name, BusinessCategory category) {
    state = state.copyWith(step: 2, businessName: name, category: category);
  }

  void setStep2(String phone, String city) {
    state = state.copyWith(step: 3, phone: phone, city: city);
  }

  void setTheme(BusinessThemeType type) {
    state = state.copyWith(theme: type);
    _ref.read(businessThemeProvider.notifier).setTheme(type);
  }

  Future<void> submit() async {
    final user = _ref.read(authUserProvider);
    final category = state.category;
    if (user == null || category == null) return;
    state = state.copyWith(isSubmitting: true);
    try {
      await _ref.read(businessRepositoryProvider).createBusiness(
            CreateBusinessInput(
              ownerId: user.id,
              name: state.businessName,
              category: category,
              phone: state.phone,
              city: state.city,
              themeType: state.theme,
            ),
          );
      _ref.invalidate(businessProvider);
      state = state.copyWith(isSubmitting: false);
    } catch (error) {
      state = state.copyWith(isSubmitting: false, error: error.toString());
    }
  }
}
