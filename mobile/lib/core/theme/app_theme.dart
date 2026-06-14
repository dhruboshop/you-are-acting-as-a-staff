import 'package:flutter/material.dart';

import 'business_theme.dart';
import 'color_tokens.dart';
import 'radius_tokens.dart';
import 'text_tokens.dart';

class AppTheme {
  static ThemeData buildTheme(LPBusinessTheme theme) {
    final colors = theme.colors;
    final scheme = ColorScheme.fromSeed(
      seedColor: colors.primary,
      primary: colors.primary,
      secondary: colors.accent,
      surface: colors.surface,
      error: AppColors.error,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      scaffoldBackgroundColor: AppColors.background,
      fontFamily: 'Inter',
      textTheme: const TextTheme(
        displayLarge: LPTextStyle.displayLarge,
        displayMedium: LPTextStyle.displayMedium,
        headlineLarge: LPTextStyle.headlineLarge,
        headlineMedium: LPTextStyle.headlineMedium,
        titleLarge: LPTextStyle.titleLarge,
        titleMedium: LPTextStyle.titleMedium,
        bodyLarge: LPTextStyle.bodyLarge,
        bodyMedium: LPTextStyle.bodyMedium,
        bodySmall: LPTextStyle.bodySmall,
        labelLarge: LPTextStyle.labelLarge,
        labelMedium: LPTextStyle.labelMedium,
        labelSmall: LPTextStyle.labelSmall,
      ),
      appBarTheme: const AppBarTheme(
        centerTitle: false,
        elevation: 0,
        backgroundColor: AppColors.background,
        foregroundColor: AppColors.textPrimary,
        titleTextStyle: LPTextStyle.headlineLarge,
      ),
      cardTheme: CardThemeData(
        color: AppColors.surface,
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(LPRadius.md)),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.surface,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(LPRadius.md)),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(LPRadius.md),
          borderSide: const BorderSide(color: AppColors.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(LPRadius.md),
          borderSide: BorderSide(color: colors.primary, width: 2),
        ),
      ),
    );
  }
}
