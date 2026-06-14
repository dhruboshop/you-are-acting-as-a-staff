import 'package:flutter/material.dart';

enum BusinessThemeType { luxury, fashion, beauty, travel, restaurant, retail }

class LPThemeColors {
  const LPThemeColors({
    required this.primary,
    required this.primaryDark,
    required this.accent,
    required this.accentLight,
    required this.surface,
    required this.onPrimary,
    required this.onSurface,
    required this.gradient,
  });

  final Color primary;
  final Color primaryDark;
  final Color accent;
  final Color accentLight;
  final Color surface;
  final Color onPrimary;
  final Color onSurface;
  final List<Color> gradient;
}

class LPBusinessTheme {
  const LPBusinessTheme({
    required this.type,
    required this.name,
    required this.subtitle,
    required this.colors,
    required this.previewAsset,
  });

  final BusinessThemeType type;
  final String name;
  final String subtitle;
  final LPThemeColors colors;
  final String previewAsset;

  static LPBusinessTheme fromType(BusinessThemeType type) {
    return switch (type) {
      BusinessThemeType.luxury => luxury,
      BusinessThemeType.fashion => fashion,
      BusinessThemeType.beauty => beauty,
      BusinessThemeType.travel => travel,
      BusinessThemeType.restaurant => restaurant,
      BusinessThemeType.retail => retail,
    };
  }

  static const luxury = LPBusinessTheme(
    type: BusinessThemeType.luxury,
    name: 'Luxury',
    subtitle: 'Jewelry & Premium Retail',
    previewAsset: '',
    colors: LPThemeColors(
      primary: Color(0xff1a1a2e),
      primaryDark: Color(0xff0f0f1a),
      accent: Color(0xffc9a84c),
      accentLight: Color(0xfffdf8ee),
      surface: Color(0xfffefcf7),
      onPrimary: Color(0xfff0d080),
      onSurface: Color(0xff0d1117),
      gradient: [Color(0xff1a1a2e), Color(0xff2d1b6b)],
    ),
  );

  static const fashion = LPBusinessTheme(
    type: BusinessThemeType.fashion,
    name: 'Fashion',
    subtitle: 'Clothing & Lifestyle',
    previewAsset: '',
    colors: LPThemeColors(
      primary: Color(0xff2d2d2d),
      primaryDark: Color(0xff1a1a1a),
      accent: Color(0xffe8a598),
      accentLight: Color(0xfffdf5f3),
      surface: Color(0xffffffff),
      onPrimary: Color(0xffffffff),
      onSurface: Color(0xff0d1117),
      gradient: [Color(0xff2d2d2d), Color(0xff4a3728)],
    ),
  );

  static const beauty = LPBusinessTheme(
    type: BusinessThemeType.beauty,
    name: 'Beauty',
    subtitle: 'Salon & Spa',
    previewAsset: '',
    colors: LPThemeColors(
      primary: Color(0xff4a1942),
      primaryDark: Color(0xff330f2e),
      accent: Color(0xffe8b4cb),
      accentLight: Color(0xfffdf0f5),
      surface: Color(0xfffefafe),
      onPrimary: Color(0xffffffff),
      onSurface: Color(0xff0d1117),
      gradient: [Color(0xff4a1942), Color(0xff7b2d6b)],
    ),
  );

  static const travel = LPBusinessTheme(
    type: BusinessThemeType.travel,
    name: 'Travel',
    subtitle: 'Travel & Experiences',
    previewAsset: '',
    colors: LPThemeColors(
      primary: Color(0xff0b4f6c),
      primaryDark: Color(0xff073a50),
      accent: Color(0xff00b4d8),
      accentLight: Color(0xfff0f8ff),
      surface: Color(0xfffafeff),
      onPrimary: Color(0xffffffff),
      onSurface: Color(0xff0d1117),
      gradient: [Color(0xff0b4f6c), Color(0xff1a7faa)],
    ),
  );

  static const restaurant = LPBusinessTheme(
    type: BusinessThemeType.restaurant,
    name: 'Restaurant',
    subtitle: 'Restaurant & Cafe',
    previewAsset: '',
    colors: LPThemeColors(
      primary: Color(0xff8b1a1a),
      primaryDark: Color(0xff6b1212),
      accent: Color(0xfff4a261),
      accentLight: Color(0xfffff8f0),
      surface: Color(0xfffffaf7),
      onPrimary: Color(0xffffffff),
      onSurface: Color(0xff0d1117),
      gradient: [Color(0xff8b1a1a), Color(0xffc53030)],
    ),
  );

  static const retail = LPBusinessTheme(
    type: BusinessThemeType.retail,
    name: 'Retail',
    subtitle: 'Electronics & General',
    previewAsset: '',
    colors: LPThemeColors(
      primary: Color(0xff1a3a6b),
      primaryDark: Color(0xff102650),
      accent: Color(0xff3b82f6),
      accentLight: Color(0xffeff6ff),
      surface: Color(0xfffafcff),
      onPrimary: Color(0xffffffff),
      onSurface: Color(0xff0d1117),
      gradient: [Color(0xff1a3a6b), Color(0xff2563eb)],
    ),
  );
}
