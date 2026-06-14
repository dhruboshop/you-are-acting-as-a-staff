class WhatsappInstanceModel {
  const WhatsappInstanceModel({
    required this.instanceId,
    this.phone,
    required this.connected,
    required this.connectionStatus,
    required this.lastConnectionCheck,
  });

  final String instanceId;
  final String? phone;
  final bool connected;
  final String connectionStatus;
  final DateTime lastConnectionCheck;

  WhatsappInstanceModel copyWith({
    String? instanceId,
    String? phone,
    bool? connected,
    String? connectionStatus,
    DateTime? lastConnectionCheck,
  }) {
    return WhatsappInstanceModel(
      instanceId: instanceId ?? this.instanceId,
      phone: phone ?? this.phone,
      connected: connected ?? this.connected,
      connectionStatus: connectionStatus ?? this.connectionStatus,
      lastConnectionCheck: lastConnectionCheck ?? this.lastConnectionCheck,
    );
  }
}
