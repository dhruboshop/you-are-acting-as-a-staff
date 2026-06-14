import '../../core/theme/business_theme.dart';

enum BusinessCategory { jewelry, clothing, salon, restaurant, cafe, travel, medical, electronics, other }

class BusinessModel {
  const BusinessModel({
    required this.id,
    required this.ownerId,
    required this.name,
    required this.category,
    required this.phone,
    required this.city,
    this.logoUrl,
    this.coverUrl,
    required this.qrTagline,
    required this.themeType,
    required this.registrationUrl,
    required this.createdAt,
  });

  final String id;
  final String ownerId;
  final String name;
  final BusinessCategory category;
  final String phone;
  final String city;
  final String? logoUrl;
  final String? coverUrl;
  final String qrTagline;
  final BusinessThemeType themeType;
  final String registrationUrl;
  final DateTime createdAt;

  BusinessModel copyWith({
    String? name,
    BusinessCategory? category,
    String? phone,
    String? city,
    String? logoUrl,
    String? coverUrl,
    String? qrTagline,
    BusinessThemeType? themeType,
  }) {
    return BusinessModel(
      id: id,
      ownerId: ownerId,
      name: name ?? this.name,
      category: category ?? this.category,
      phone: phone ?? this.phone,
      city: city ?? this.city,
      logoUrl: logoUrl ?? this.logoUrl,
      coverUrl: coverUrl ?? this.coverUrl,
      qrTagline: qrTagline ?? this.qrTagline,
      themeType: themeType ?? this.themeType,
      registrationUrl: registrationUrl,
      createdAt: createdAt,
    );
  }
}

class CreateBusinessInput {
  const CreateBusinessInput({
    required this.ownerId,
    required this.name,
    required this.category,
    required this.phone,
    required this.city,
    required this.themeType,
  });

  final String ownerId;
  final String name;
  final BusinessCategory category;
  final String phone;
  final String city;
  final BusinessThemeType themeType;
}
