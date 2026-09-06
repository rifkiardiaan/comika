import '../../../core/constants/api_constants.dart';
import '../../../services/api_service.dart';

/// Subscription plan dari backend.
class SubscriptionPlan {
  final String id;
  final String name;
  final String description;
  final int price;
  final String formattedPrice;
  final int durationDays;
  final String badge;
  final String tier; // 'premium' or 'vvip'
  final List<String> features;
  final String? savings;

  const SubscriptionPlan({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    required this.formattedPrice,
    required this.durationDays,
    required this.badge,
    required this.tier,
    required this.features,
    this.savings,
  });

  factory SubscriptionPlan.fromJson(Map<String, dynamic> json) {
    return SubscriptionPlan(
      id: json['id'] as String,
      name: json['name'] as String? ?? '',
      description: json['description'] as String? ?? '',
      price: (json['price'] as num?)?.toInt() ?? 0,
      formattedPrice: json['formatted_price'] as String? ?? '',
      durationDays: (json['duration_days'] as num?)?.toInt() ?? 0,
      badge: json['badge'] as String? ?? '',
      tier: json['tier'] as String? ?? 'premium',
      features: (json['features'] as List<dynamic>? ?? const []).cast<String>(),
      savings: json['savings'] as String?,
    );
  }
}

/// Status langganan user saat ini.
class SubscriptionStatus {
  final bool isPremium;
  final bool isVvip;
  final String? plan;
  final String? expiresAt;
  final int daysRemaining;

  const SubscriptionStatus({
    required this.isPremium,
    required this.isVvip,
    this.plan,
    this.expiresAt,
    required this.daysRemaining,
  });

  factory SubscriptionStatus.fromJson(Map<String, dynamic> json) {
    return SubscriptionStatus(
      isPremium: json['is_premium'] as bool? ?? false,
      isVvip: json['is_vvip'] as bool? ?? false,
      plan: json['plan'] as String?,
      expiresAt: json['expires_at'] as String?,
      daysRemaining: (json['days_remaining'] as num?)?.toInt() ?? 0,
    );
  }

  String get tierLabel {
    if (isVvip) return 'VVIP';
    if (isPremium) return 'Premium';
    return 'Free';
  }
}

/// Item riwayat langganan.
class SubscriptionHistoryItem {
  final int id;
  final String plan;
  final String planName;
  final String tier;
  final int amount;
  final String paymentStatus;
  final String? startsAt;
  final String? expiresAt;
  final String? paidAt;
  final bool isActive;
  final int daysRemaining;

  const SubscriptionHistoryItem({
    required this.id,
    required this.plan,
    required this.planName,
    required this.tier,
    required this.amount,
    required this.paymentStatus,
    this.startsAt,
    this.expiresAt,
    this.paidAt,
    required this.isActive,
    required this.daysRemaining,
  });

  factory SubscriptionHistoryItem.fromJson(Map<String, dynamic> json) {
    return SubscriptionHistoryItem(
      id: json['id'] as int,
      plan: json['plan'] as String? ?? '',
      planName: json['plan_name'] as String? ?? '',
      tier: json['tier'] as String? ?? 'premium',
      amount: (json['amount'] as num?)?.toInt() ?? 0,
      paymentStatus: json['payment_status'] as String? ?? 'pending',
      startsAt: json['starts_at'] as String?,
      expiresAt: json['expires_at'] as String?,
      paidAt: json['paid_at'] as String?,
      isActive: json['is_active'] as bool? ?? false,
      daysRemaining: (json['days_remaining'] as num?)?.toInt() ?? 0,
    );
  }

  String get amountLabel => 'Rp${amount.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}';

  String get statusLabel {
    if (isActive) return 'Aktif';
    if (paymentStatus == 'paid') return 'Selesai';
    if (paymentStatus == 'pending') return 'Menunggu';
    if (paymentStatus == 'failed') return 'Gagal';
    return paymentStatus;
  }
}

/// Repository untuk subscription (Premium & VVIP).
class SubscriptionRepository {
  final ApiService _api = ApiService.instance;

  /// Ambil semua plan yang tersedia.
  Future<List<SubscriptionPlan>> fetchPlans() async {
    final res = await _api.get(ApiConstants.subscriptionPlans);
    final list = res['data'] as List<dynamic>? ?? const [];
    return list.map((p) => SubscriptionPlan.fromJson(p as Map<String, dynamic>)).toList();
  }

  /// Ambil status langganan user saat ini.
  Future<SubscriptionStatus> fetchStatus() async {
    final res = await _api.get(ApiConstants.subscriptionStatus);
    return SubscriptionStatus.fromJson(res['data'] as Map<String, dynamic>);
  }

  /// Ambil riwayat langganan user.
  Future<List<SubscriptionHistoryItem>> fetchHistory() async {
    final res = await _api.get(ApiConstants.subscriptionHistory);
    final list = res['data'] as List<dynamic>? ?? const [];
    return list.map((item) => SubscriptionHistoryItem.fromJson(item as Map<String, dynamic>)).toList();
  }

  /// Berlangganan — mengembalikan snap_token + redirect_url untuk Midtrans.
  Future<Map<String, dynamic>> subscribe(String plan) async {
    final res = await _api.post(ApiConstants.subscriptionSubscribe, {'plan': plan});
    return res['data'] as Map<String, dynamic>? ?? {};
  }

  /// Batalkan langganan.
  Future<void> cancel() async {
    await _api.post(ApiConstants.subscriptionCancel);
  }

  /// Verifikasi pembayaran Midtrans.
  Future<Map<String, dynamic>> verifyPayment(String orderId) async {
    final res = await _api.post(ApiConstants.midtransVerifyPayment, {'order_id': orderId});
    return res['data'] as Map<String, dynamic>? ?? {};
  }
}
