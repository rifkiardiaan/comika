import 'dart:async';

import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

import '../../../core/constants/api_constants.dart';
import '../../../core/theme/app_theme.dart';
import '../../../services/api_service.dart';
import '../../../services/auth_service.dart';
import '../data/wallet_repository.dart';

class WalletScreen extends StatefulWidget {
  const WalletScreen({super.key});

  @override
  State<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends State<WalletScreen> {
  final _repo = WalletRepository();
  late Future<(WalletSummary, List<CoinPackage>)> _future;
  int? _buyingId;
  String? _notice;
  String? _error;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<(WalletSummary, List<CoinPackage>)> _load() async {
    final results = await Future.wait([
      _repo.fetchWallet(),
      _repo.fetchPackages(),
    ]);
    return (results[0] as WalletSummary, results[1] as List<CoinPackage>);
  }

  /// Beli koin via Midtrans — buka halaman pembayaran di WebView.
  Future<void> _buy(CoinPackage pkg) async {
    setState(() {
      _buyingId = pkg.id;
      _notice = null;
      _error = null;
    });
    try {
      final result = await _repo.purchase(pkg.id);

      if (!mounted) return;

      // Buka halaman pembayaran Midtrans di WebView
      final snapToken = result['snap_token'] as String?;
      final orderId = result['order_id'] as String?;
      final redirectUrl = result['redirect_url'] as String?;

      if (snapToken == null || orderId == null) {
        setState(() {
          _error = 'Gagal membuat token pembayaran.';
          _buyingId = null;
        });
        return;
      }

      // Navigate to payment WebView
      final paymentResult = await Navigator.of(context).push<bool>(
        MaterialPageRoute(
          builder: (_) => _PaymentWebView(
            redirectUrl: redirectUrl ?? '',
            orderId: orderId,
          ),
        ),
      );

      if (!mounted) return;

      if (paymentResult == true) {
        // Payment successful — refresh wallet
        setState(() {
          _notice = 'Pembayaran berhasil! Koin telah ditambahkan.';
          _buyingId = null;
          _future = _load();
        });
        // Sync user balance
        AuthService.instance.me().then((_) {}).catchError((_) {});
      } else {
        setState(() {
          _notice = null;
          _buyingId = null;
        });
      }
    } on ApiException catch (e) {
      if (mounted) {
        setState(() {
          _error = e.message;
          _buyingId = null;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = 'Gagal membeli koin: $e';
          _buyingId = null;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Dompet Koin', style: TextStyle(fontWeight: FontWeight.w700))),
      body: FutureBuilder<(WalletSummary, List<CoinPackage>)>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.cloud_off, size: 48, color: Colors.grey),
                    const SizedBox(height: 12),
                    Text(snapshot.error.toString(), textAlign: TextAlign.center, style: TextStyle(color: Colors.grey.shade500, fontSize: 12)),
                    const SizedBox(height: 16),
                    FilledButton(onPressed: () => setState(() => _future = _load()), child: const Text('Coba Lagi')),
                  ],
                ),
              ),
            );
          }

          final (wallet, packages) = snapshot.data!;
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              // Saldo
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [AppTheme.brand.withValues(alpha: 0.6), AppTheme.surface],
                  ),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Saldo Koin', style: TextStyle(color: Colors.grey.shade300, fontSize: 12)),
                    const SizedBox(height: 6),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        const Icon(Icons.monetization_on, size: 28, color: Colors.amber),
                        const SizedBox(width: 8),
                        Text(
                          wallet.balance.toString(),
                          style: const TextStyle(fontSize: 40, fontWeight: FontWeight.w800),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        _miniStat('${wallet.unlocksCount}', 'Episode dibuka'),
                        const SizedBox(width: 20),
                        _miniStat('${wallet.totalSpent}', 'Koin terpakai'),
                      ],
                    ),
                  ],
                ),
              ),

              if (_notice != null) ...[
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.green.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.check_circle, size: 18, color: Colors.greenAccent),
                      const SizedBox(width: 8),
                      Expanded(child: Text(_notice!, style: const TextStyle(color: Colors.greenAccent, fontSize: 12))),
                    ],
                  ),
                ),
              ],

              if (_error != null) ...[
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.red.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.error_outline, size: 18, color: Colors.redAccent),
                      const SizedBox(width: 8),
                      Expanded(child: Text(_error!, style: const TextStyle(color: Colors.redAccent, fontSize: 12))),
                    ],
                  ),
                ),
              ],

              const SizedBox(height: 24),
              Row(
                children: [
                  Text('Top-Up Koin', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: Colors.grey.shade100)),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: Colors.green.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.credit_card, size: 11, color: Colors.greenAccent),
                        SizedBox(width: 3),
                        Text('Midtrans', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Colors.greenAccent)),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Text('Pilih paket & bayar via transfer bank, e-wallet, dll.', style: TextStyle(color: Colors.grey.shade500, fontSize: 11)),
              const SizedBox(height: 12),

              if (packages.isEmpty)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 24),
                  child: Center(child: Text('Belum ada paket koin.', style: TextStyle(color: Colors.grey.shade500))),
                ),
              for (final pkg in packages)
                Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppTheme.surface,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppTheme.surfaceLight),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 46,
                          height: 46,
                          alignment: Alignment.center,
                          decoration: BoxDecoration(
                            color: Colors.amber.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(Icons.monetization_on, color: Colors.amber, size: 24),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('${pkg.coins} koin', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
                              Text(pkg.name, style: TextStyle(color: Colors.grey.shade400, fontSize: 11)),
                            ],
                          ),
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              'Rp${pkg.price.round()}',
                              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800),
                            ),
                            const SizedBox(height: 6),
                            SizedBox(
                              width: 86,
                              height: 34,
                              child: FilledButton(
                                onPressed: _buyingId == pkg.id ? null : () => _buy(pkg),
                                style: FilledButton.styleFrom(
                                  backgroundColor: AppTheme.brand,
                                  padding: EdgeInsets.zero,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                ),
                                child: _buyingId == pkg.id
                                    ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2))
                                    : const Text('Beli', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
            ],
          );
        },
      ),
    );
  }

  Widget _miniStat(String value, String label) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(value, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
        Text(label, style: TextStyle(color: Colors.grey.shade400, fontSize: 10)),
      ],
    );
  }
}

/// WebView halaman pembayaran Midtrans.
/// Setelah pembayaran selesai, verifikasi ke backend & return result.
class _PaymentWebView extends StatefulWidget {
  final String redirectUrl;
  final String orderId;

  const _PaymentWebView({required this.redirectUrl, required this.orderId});

  @override
  State<_PaymentWebView> createState() => _PaymentWebViewState();
}

class _PaymentWebViewState extends State<_PaymentWebView> {
  late final WebViewController _controller;
  bool _isLoading = true;
  bool _verified = false;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(NavigationDelegate(
        onPageStarted: (_) {
          if (mounted) setState(() => _isLoading = true);
        },
        onPageFinished: (url) {
          if (mounted) setState(() => _isLoading = false);
          // Check if redirected back from Midtrans
          _checkPaymentStatus(url);
        },
      ))
      ..loadRequest(Uri.parse(widget.redirectUrl));
  }

  void _checkPaymentStatus(String url) {
    // Midtrans will redirect to callback URL with status
    if (url.contains('status_code=200') || url.contains('transaction_status=settlement') || url.contains('transaction_status=capture')) {
      _verifyAndClose(true);
    } else if (url.contains('status_code=202') || url.contains('transaction_status=pending')) {
      // Still pending — try verification
      _verifyPayment();
    } else if (url.contains('status_code=400') || url.contains('status_code=407') || url.contains('status_code=408')) {
      _verifyAndClose(false);
    }
  }

  Future<void> _verifyPayment() async {
    if (_verified) return;
    _verified = true;

    try {
      final api = ApiService.instance;
      final res = await api.post('${ApiConstants.baseUrl}/midtrans/verify-payment', {
        'order_id': widget.orderId,
      });
      final data = res['data'] as Map<String, dynamic>? ?? {};
      final status = data['status'] as String? ?? '';
      final credited = data['coins_credited'] as bool? ?? false;

      if (mounted) {
        Navigator.of(context).pop(credited || status == 'success');
      }
    } catch (_) {
      // If verification fails, close and let user refresh
      if (mounted) {
        Navigator.of(context).pop(false);
      }
    }
  }

  void _verifyAndClose(bool success) {
    if (success) {
      _verifyPayment();
    } else {
      Navigator.of(context).pop(false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Pembayaran', style: TextStyle(fontSize: 16)),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => Navigator.of(context).pop(false),
        ),
      ),
      body: Stack(
        children: [
          WebViewWidget(controller: _controller),
          if (_isLoading)
            const Center(child: CircularProgressIndicator()),
        ],
      ),
    );
  }
}
