class Shop {
  Shop({
    required this.id,
    required this.name,
    this.phone,
    this.address,
    this.logoUrl,
    this.totalCustomers = 0,
    this.totalCampaigns = 0,
    this.totalLoyaltyMembers = 0,
  });

  final String id;
  final String name;
  final String? phone;
  final String? address;
  final String? logoUrl;
  final int totalCustomers;
  final int totalCampaigns;
  final int totalLoyaltyMembers;

  factory Shop.fromJson(Map<String, dynamic> json) => Shop(
        id: json['id'] as String,
        name: json['name'] as String,
        phone: json['phone'] as String?,
        address: json['address'] as String?,
        logoUrl: json['logo_url'] as String?,
        totalCustomers: json['total_customers'] as int? ?? 0,
        totalCampaigns: json['total_campaigns'] as int? ?? 0,
        totalLoyaltyMembers: json['total_loyalty_members'] as int? ?? 0,
      );
}
