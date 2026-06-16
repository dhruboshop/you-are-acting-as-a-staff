import '../../core/theme/business_theme.dart';
import '../models/business_model.dart';
import '../models/campaign_model.dart';
import '../models/customer_model.dart';
import '../models/feedback_model.dart';
import '../models/user_model.dart';

class SeedData {
  static const authUser = AuthUser(
    id: 'user_001',
    email: 'owner@radhajewels.example',
    displayName: 'Priya Sharma',
  );

  static final business = BusinessModel(
    id: 'biz_001',
    ownerId: authUser.id,
    name: 'Zappy Demo Shop',
    category: BusinessCategory.jewelry,
    phone: '+919876543210',
    city: 'Mumbai',
    qrTagline: 'Scan to get exclusive birthday & festival offers',
    themeType: BusinessThemeType.luxury,
    registrationUrl: 'https://app.zappy.local/r/biz_001',
    createdAt: DateTime(2024, 1, 15),
  );

  static final customers = <CustomerModel>[
    CustomerModel(id: 'cust_001', businessId: business.id, name: 'Sunita Kapoor', phone: '+919876543211', birthday: DateTime(1985, DateTime.now().month, DateTime.now().day + 2), anniversary: DateTime(2010, 6, 15), rating: 5, feedback: 'Absolutely loved the collection! Will definitely come back.', registeredAt: DateTime.now().subtract(const Duration(hours: 2))),
    CustomerModel(id: 'cust_002', businessId: business.id, name: 'Deepak Singh', phone: '+919876543212', birthday: DateTime(1990, DateTime.now().month, DateTime.now().day + 5), rating: 4, registeredAt: DateTime.now().subtract(const Duration(days: 1))),
    CustomerModel(id: 'cust_003', businessId: business.id, name: 'Meera Nair', phone: '+919876543213', birthday: DateTime(1988, 3, 20), anniversary: DateTime(2015, 12, 1), rating: 5, feedback: 'Best jewelry shop in the area!', registeredAt: DateTime.now().subtract(const Duration(days: 3))),
    CustomerModel(id: 'cust_004', businessId: business.id, name: 'Rahul Shah', phone: '+919876543214', birthday: DateTime(1982, 7, 4), rating: 4, registeredAt: DateTime.now().subtract(const Duration(days: 6))),
    CustomerModel(id: 'cust_005', businessId: business.id, name: 'Ayesha Khan', phone: '+919876543215', birthday: DateTime(1995, 12, 28), anniversary: DateTime(2020, 1, 10), rating: 5, feedback: 'Very kind staff.', registeredAt: DateTime.now().subtract(const Duration(days: 8))),
    CustomerModel(id: 'cust_006', businessId: business.id, name: 'Vikram Rao', phone: '+919876543216', birthday: DateTime(1979, 8, 16), rating: 3, registeredAt: DateTime.now().subtract(const Duration(days: 12))),
    CustomerModel(id: 'cust_007', businessId: business.id, name: 'Anita Das', phone: '+919876543217', birthday: DateTime(1992, 2, 11), rating: 4, registeredAt: DateTime.now().subtract(const Duration(days: 14))),
    CustomerModel(id: 'cust_008', businessId: business.id, name: 'Nikhil Bose', phone: '+919876543218', birthday: DateTime(1987, 9, 21), anniversary: DateTime(2018, 9, 21), rating: 5, registeredAt: DateTime.now().subtract(const Duration(days: 18))),
    CustomerModel(id: 'cust_009', businessId: business.id, name: 'Farah Ali', phone: '+919876543219', birthday: DateTime(1991, 5, 9), rating: 4, feedback: 'Nice offers during festivals.', registeredAt: DateTime.now().subtract(const Duration(days: 22))),
    CustomerModel(id: 'cust_010', businessId: business.id, name: 'Karan Malhotra', phone: '+919876543220', birthday: DateTime(1984, 10, 30), rating: 3.5, registeredAt: DateTime.now().subtract(const Duration(days: 25))),
  ];

  static const dashboard = DashboardData(
    totalCustomers: 248,
    newThisMonth: 12,
    birthdaysThisMonth: 5,
    anniversariesThisMonth: 2,
    averageRating: 4.6,
    campaignsSentLast30Days: 34,
  );

  static const qrData = QrData(
    registrationUrl: 'https://app.zappy.local/r/biz_001',
    totalScans: 312,
    scansThisWeek: 28,
  );

  static final campaignHistory = <CampaignSendModel>[
    CampaignSendModel(id: 'send_001', businessId: business.id, type: CampaignType.birthday, message: 'Happy Birthday, Sunita!', recipientIds: const ['cust_001'], recipientCount: 1, deliveredCount: 1, failedCount: 0, sentAt: DateTime.now().subtract(const Duration(hours: 2)), status: CampaignSendStatus.completed),
    CampaignSendModel(id: 'send_002', businessId: business.id, type: CampaignType.festival, festivalName: 'Diwali', message: 'Wishing you a bright Diwali.', recipientIds: customers.map((c) => c.id).toList(), recipientCount: 248, deliveredCount: 241, failedCount: 7, sentAt: DateTime.now().subtract(const Duration(days: 3)), status: CampaignSendStatus.completed),
  ];

  static const festivals = <Festival>[
    Festival(id: 'diwali', name: 'Diwali', emoji: 'D', month: 10),
    Festival(id: 'eid', name: 'Eid', emoji: 'E', month: 4),
    Festival(id: 'christmas', name: 'Christmas', emoji: 'C', month: 12),
    Festival(id: 'newyear', name: 'New Year', emoji: 'N', month: 1),
    Festival(id: 'holi', name: 'Holi', emoji: 'H', month: 3),
    Festival(id: 'navratri', name: 'Navratri', emoji: 'N', month: 10),
    Festival(id: 'onam', name: 'Onam', emoji: 'O', month: 8),
    Festival(id: 'pongal', name: 'Pongal', emoji: 'P', month: 1),
    Festival(id: 'raksha', name: 'Raksha Bandhan', emoji: 'R', month: 8),
    Festival(id: 'custom', name: 'Custom', emoji: '*'),
  ];

  static final feedbackData = FeedbackData(
    averageRating: 4.6,
    distribution: const {5: 148, 4: 62, 3: 24, 2: 10, 1: 4},
    recentFeedback: [
      FeedbackModel(id: 'fb_001', customerId: 'cust_003', customerName: 'Meera Nair', rating: 5, text: 'Best jewelry shop in the area!', submittedAt: DateTime.now().subtract(const Duration(days: 3))),
      FeedbackModel(id: 'fb_002', customerId: 'cust_009', customerName: 'Farah Ali', rating: 4, text: 'Nice offers during festivals.', submittedAt: DateTime.now().subtract(const Duration(days: 7))),
    ],
  );
}
