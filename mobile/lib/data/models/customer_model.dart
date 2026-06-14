import '../../core/extensions/datetime_extensions.dart';
import '../../core/extensions/string_extensions.dart';

enum CustomerFilter { all, thisMonth, soonBirthdays, lowRating }
enum CustomerSort { recent, name, rating }

class CustomerModel {
  const CustomerModel({
    required this.id,
    required this.businessId,
    required this.name,
    required this.phone,
    required this.birthday,
    this.anniversary,
    required this.rating,
    this.feedback,
    required this.registeredAt,
  });

  final String id;
  final String businessId;
  final String name;
  final String phone;
  final DateTime birthday;
  final DateTime? anniversary;
  final double rating;
  final String? feedback;
  final DateTime registeredAt;

  String get phoneFormatted => phone.length > 5 ? '${phone.substring(0, 3)} ${phone.substring(3)}' : phone;
  String get initials => name.initials;
  int get daysUntilBirthday => birthday.daysUntilBirthday;
  bool get isBirthdayToday => daysUntilBirthday == 0;
  int? get daysUntilAnniversary => anniversary?.daysUntilBirthday;
}

class DashboardData {
  const DashboardData({
    required this.totalCustomers,
    required this.newThisMonth,
    required this.birthdaysThisMonth,
    required this.anniversariesThisMonth,
    required this.averageRating,
    required this.campaignsSentLast30Days,
  });

  final int totalCustomers;
  final int newThisMonth;
  final int birthdaysThisMonth;
  final int anniversariesThisMonth;
  final double averageRating;
  final int campaignsSentLast30Days;
}

class QrData {
  const QrData({required this.registrationUrl, required this.totalScans, required this.scansThisWeek});

  final String registrationUrl;
  final int totalScans;
  final int scansThisWeek;
}
