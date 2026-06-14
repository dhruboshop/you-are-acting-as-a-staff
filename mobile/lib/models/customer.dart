class Customer {
  Customer({
    required this.id,
    required this.shopId,
    required this.name,
    required this.whatsappNumber,
    required this.loyaltyPoints,
    required this.consentGiven,
  });

  final String id;
  final String shopId;
  final String name;
  final String whatsappNumber;
  final int loyaltyPoints;
  final bool consentGiven;

  factory Customer.fromJson(Map<String, dynamic> json) => Customer(
        id: json['id'] as String,
        shopId: json['shop_id'] as String,
        name: json['name'] as String,
        whatsappNumber: json['whatsapp_number'] as String,
        loyaltyPoints: json['loyalty_points'] as int? ?? 0,
        consentGiven: json['consent_given'] as bool? ?? false,
      );
}
