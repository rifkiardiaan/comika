import '../../../core/constants/api_constants.dart';
import '../../../services/api_service.dart';

/// Ringkasan dompet koin user.
class WalletSummary {
  final int balance;
  final int totalSpent;
  final int unlocksCount;
  final int purchasesCount;

  const WalletSummary({
    required this.balance,
    required this.totalSpent,
    required this.unlocksCount,
    required this.purchasesCount,
  });

  factory WalletSummary.fromJson(Map<String, dynamic> json) {
    return WalletSummary(
      balance: (json['balance'] as num?)?.toInt() ?? 0,
      totalSpent: (json['total_spent'] as num?)?.toInt() ?? 0,
      unlocksCount: (json['unlocks_count'] as num?)?.toInt() ?? 0,
      purchasesCount: (json['purchases_count'] as num?)?.toInt() ?? 0,
    );
  }
}

/// Paket koin yang tersedia untuk top-up.
class CoinPackage {
  final int id;
  final String name;
  final int coins;
  final double price;

  const CoinPackage({
    required this.id,
    required this.name,
    required this.coins,
    required this.price,
  });

  factory CoinPackage.fromJson(Map<String, dynamic> json) {
    return CoinPackage(
      id: json['id'] as int,
      name: json['name'] as String? ?? '',
      coins: (json['coins'] as num?)?.toInt() ?? 0,
      price: (json['price'] as num?)?.toDouble() ?? 0,
    );
  }
}

/// Repository dompet & koin.
class WalletRepository {
  final ApiService _api = ApiService.instance;

  Future<WalletSummary> fetchWallet() async {
    final res = await _api.get(ApiConstants.wallet);
    return WalletSummary.fromJson(res['data'] as Map<String, dynamic>);
  }

  Future<List<CoinPackage>> fetchPackages() async {
    final res = await _api.get(ApiConstants.coinPackages);
    final list = res['data'] as List<dynamic>? ?? const [];
    return list.map((p) => CoinPackage.fromJson(p as Map<String, dynamic>)).toList();
  }

  /// Beli paket koin (MVP: pembayaran disimulasikan sukses).
  Future<int> purchase(int packageId) async {
    final res = await _api.post(ApiConstants.purchasePackage(packageId));
    final data = res['data'] as Map<String, dynamic>? ?? const {};
    return (data['balance'] as num?)?.toInt() ?? 0;
  }

  /// Riwayat transaksi (untuk layar dompet sederhana).
  Future<List<Map<String, dynamic>>> fetchTransactions() async {
    final res = await _api.get(ApiConstants.transactions);
    final list = res['data'] as List<dynamic>? ?? const [];
    return list.map((t) => t as Map<String, dynamic>).toList();
  }
}
