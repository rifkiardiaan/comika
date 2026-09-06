import 'dart:async';

import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

import '../../../core/constants/api_constants.dart';
import '../../../core/theme/app_theme.dart';
import '../../../services/api_service.dart';
import '../../../services/auth_service.dart';
import '../data/subscription_repository.dart';

/// Halaman langganan Premium & VVIP dengan pembayaran Midtrans.
class SubscriptionScreen extends StatefulWidget {
  const SubscriptionScreen({super.key});

  @override
  State<SubscriptionScreen> createState() => _SubscriptionScreenState();
}

class _SubscriptionScreenState extends State<SubscriptionScreen> {
  final _repo = SubscriptionRepository();

  List<SubscriptionPlan> _plans = [];
  SubscriptionStatus? _status;
  List<SubscriptionHistoryItem> _history = [];
  bool _loading = true;
  bool _subscribing = false;
  String _activeTab = 'vvip'; // 'premium', 'vvip', or 'history'
  String? _selectedPlanId;
  String? _error;
  String? _success;
  String? _notice;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final results = await Future.wait([
        _repo.fetchPlans(),
        _repo.fetchStatus(),
        _repo.fetchHistory(),
      ]);
      if (mounted) {
        final plans = results[0] as List<SubscriptionPlan>;
        final status = results[1] as SubscriptionStatus;
        final history = results[2] as List<SubscriptionHistoryItem>;
        setState(() {
          _plans = plans;
          _status = status;
          _history = history;
          _loading = false;
          // Auto-select first plan in current tab
          final filtered = plans.where((p) => p.tier == _activeTab).toList();
          if (filtered.isNotEmpty && _selectedPlanId == null) {
            _selectedPlanId = filtered.last.id; // Default to yearly (best value)
          }
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _loading = false;
          _error = 'Gagal memuat data: $e';
        });
      }
    }
  }

  Future<void> _subscribe() async {
    if (_subscribing || _selectedPlanId == null) return;

    final user = AuthService.instance.user;
    if (user == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Masuk terlebih dahulu untuk berlangganan.')),
      );
      return;
    }

    // Cek apakah VVIP sudah aktif dan memilih plan premium
    final selectedPlan = _plans.firstWhere((p) => p.id == _selectedPlanId);
    if (_status?.isVvip == true && selectedPlan.tier == 'premium') {
      setState(() => _error = 'Akun VVIP tidak dapat membeli langganan Premium.');
      return;
    }

    setState(() {
      _subscribing = true;
      _error = null;
      _success = null;
    });

    try {
      final result = await _repo.subscribe(_selectedPlanId!);
      if (!mounted) return;

      final redirectUrl = result['redirect_url'] as String?;
      final orderId = result['order_id'] as String?;
      final daysAdded = result['days_added'] as int? ?? 0;

      if (redirectUrl == null || orderId == null) {
        setState(() {
          _error = 'Gagal membuat token pembayaran.';
          _subscribing = false;
        });
        return;
      }

      // Buka WebView pembayaran Midtrans
      final paymentSuccess = await Navigator.of(context).push<bool>(
        MaterialPageRoute(
          builder: (_) => _PaymentWebView(redirectUrl: redirectUrl, orderId: orderId),
        ),
      );

      if (!mounted) return;

      if (paymentSuccess == true) {
        final tierLabel = selectedPlan.tier == 'vvip' ? 'VVIP' : 'Premium';
        setState(() {
          _success = '🎉 Berhasil berlangganan $tierLabel! Aktif selama $daysAdded hari.';
          _subscribing = false;
        });
        // Refresh status
        _load();
        // Sync user
        AuthService.instance.me().then((_) {}).catchError((_) {});
      } else {
        setState(() {
          _notice = 'Pembayaran belum selesai. Coba lagi nanti.';
          _subscribing = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = 'Gagal memproses: $e';
          _subscribing = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isVvip = _status?.isVvip ?? false;
    final isPremium = (_status?.isPremium ?? false) && !isVvip;
    final filteredPlans = _plans.where((p) => p.tier == _activeTab).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Premium & VVIP', style: TextStyle(fontWeight: FontWeight.w700)),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _load,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // ── Status Badge ──
                  if (isVvip)
                    _statusBadge(
                      icon: Icons.diamond,
                      color: Colors.purpleAccent,
                      title: 'Kamu sudah VVIP! 💎',
                      subtitle: 'Semua episode premium terbuka'
                          '${_status!.daysRemaining > 0 ? ' · ${_status!.daysRemaining} hari lagi' : ''}',
                    ),
                  if (!isVvip && isPremium)
                    _statusBadge(
                      icon: Icons.workspace_premium,
                      color: Colors.amber,
                      title: 'Kamu sudah Premium! 🎉',
                      subtitle: _status!.daysRemaining > 0
                          ? 'Masa aktif: ${_status!.daysRemaining} hari lagi'
                          : '',
                      extra: GestureDetector(
                        onTap: () => setState(() => _activeTab = 'vvip'),
                        child: const Text(' → Upgrade ke VVIP', style: TextStyle(color: Colors.purpleAccent, fontWeight: FontWeight.w600)),
                      ),
                    ),
                  const SizedBox(height: 20),

                  // ── Tier Tabs ──
                  Center(
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: AppTheme.surface,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          _tierTab('premium', 'Premium', Icons.workspace_premium, Colors.amber),
                          const SizedBox(width: 4),
                          _tierTab('vvip', 'VVIP', Icons.diamond, Colors.purpleAccent),
                          const SizedBox(width: 4),
                          _tierTab('history', 'Riwayat', Icons.history, Colors.grey),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // ── History Tab Content ──
                  if (_activeTab == 'history') ...[
                    _buildHistorySection(),
                  ] else ...[

                  // ── Features ──
                  Text(
                    _activeTab == 'vvip' ? 'Keuntungan VVIP' : 'Keuntungan Premium',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800),
                  ),
                  const SizedBox(height: 12),
                  ...(_activeTab == 'vvip' ? _vvipFeatures : _premiumFeatures).map(
                    (f) => Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: Row(
                        children: [
                          Icon(f.icon, size: 18, color: f.color),
                          const SizedBox(width: 10),
                          Expanded(child: Text(f.label, style: const TextStyle(fontSize: 13))),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // ── Plan Cards ──
                  if (filteredPlans.isEmpty)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 24),
                      child: Center(child: Text('Memuat paket...', style: TextStyle(color: Colors.grey.shade500))),
                    ),
                  for (final plan in filteredPlans)
                    _planCard(plan),

                  // ── Messages ──
                  if (_error != null) ...[
                    const SizedBox(height: 12),
                    _messageBanner(_error!, isError: true),
                  ],
                  if (_success != null) ...[
                    const SizedBox(height: 12),
                    _messageBanner(_success!, isError: false),
                  ],
                  if (_notice != null) ...[
                    const SizedBox(height: 12),
                    _messageBanner(_notice!, isError: false),
                  ],

                  const SizedBox(height: 20),

                  // ── Subscribe Button ──
                  if (!(isVvip && _activeTab == 'premium'))
                    SizedBox(
                      width: double.infinity,
                      child: FilledButton.icon(
                        onPressed: _subscribing ? null : _subscribe,
                        icon: _subscribing
                            ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                            : Icon(_activeTab == 'vvip' ? Icons.diamond : Icons.workspace_premium, size: 18),
                        label: Text(_subscribing ? 'Memproses...' : 'Bayar & Aktifkan ${_activeTab == 'vvip' ? 'VVIP' : 'Premium'}'),
                        style: FilledButton.styleFrom(
                          backgroundColor: _activeTab == 'vvip' ? Colors.purpleAccent : AppTheme.brand,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        ),
                      ),
                    ),

                  // ── Blocked for VVIP buying Premium ──
                  if (isVvip && _activeTab == 'premium')
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.purpleAccent.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.purpleAccent.withValues(alpha: 0.3)),
                      ),
                      child: Column(
                        children: [
                          const Icon(Icons.diamond, size: 36, color: Colors.purpleAccent),
                          const SizedBox(height: 10),
                          const Text('Akun VVIP sudah aktif', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                          const SizedBox(height: 4),
                          Text(
                            'VVIP sudah mencakup semua fitur Premium dan lebih banyak lagi.',
                            textAlign: TextAlign.center,
                            style: TextStyle(color: Colors.grey.shade400, fontSize: 12),
                          ),
                          const SizedBox(height: 12),
                          FilledButton(
                            onPressed: () => setState(() => _activeTab = 'vvip'),
                            style: FilledButton.styleFrom(backgroundColor: Colors.purpleAccent),
                            child: const Text('Lihat Paket VVIP'),
                          ),
                        ],
                      ),
                    ),

                  const SizedBox(height: 16),

                  // ── Cancel Button ──
                  if (isPremium)
                    Center(
                      child: TextButton(
                        onPressed: _subscribing ? null : _cancelSubscription,
                        child: Text('Batalkan langganan', style: TextStyle(color: Colors.grey.shade500, fontSize: 12)),
                      ),
                    ),

                  const SizedBox(height: 20),

                  // ── Payment Info ──
                  ], // end else (non-history)
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppTheme.surface,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppTheme.surfaceLight),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.credit_card, size: 16, color: AppTheme.brand),
                            const SizedBox(width: 6),
                            const Text('Metode Pembayaran', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Diproses via Midtrans — transfer bank, e-wallet, QRIS.',
                          style: TextStyle(color: Colors.grey.shade400, fontSize: 11),
                        ),
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 6,
                          runSpacing: 6,
                          children: ['BCA', 'Mandiri', 'BRI', 'BNI', 'GoPay', 'OVO', 'DANA', 'ShopeePay', 'QRIS']
                              .map((m) => Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: AppTheme.surfaceLight,
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(m, style: TextStyle(color: Colors.grey.shade300, fontSize: 10, fontWeight: FontWeight.w600)),
                                  ))
                              .toList(),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  // ── Helpers ──

  Widget _statusBadge({
    required IconData icon,
    required Color color,
    required String title,
    required String subtitle,
    Widget? extra,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Row(
        children: [
          Icon(icon, size: 28, color: color),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: color)),
                const SizedBox(height: 2),
                Text(subtitle, style: TextStyle(color: Colors.grey.shade400, fontSize: 11)),
                ?extra,
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _tierTab(String tab, String label, IconData icon, Color activeColor) {
    final active = _activeTab == tab;
    return GestureDetector(
      onTap: () => setState(() {
        _activeTab = tab;
        if (tab != 'history') {
          final filtered = _plans.where((p) => p.tier == tab).toList();
          if (filtered.isNotEmpty) {
            _selectedPlanId = filtered.last.id;
          }
        }
      }),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
        decoration: BoxDecoration(
          color: active ? activeColor : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 16, color: active ? Colors.white : Colors.grey),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: active ? Colors.white : Colors.grey,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _planCard(SubscriptionPlan plan) {
    final selected = _selectedPlanId == plan.id;
    final isVvip = plan.tier == 'vvip';
    final accentColor = isVvip ? Colors.purpleAccent : AppTheme.brand;

    return GestureDetector(
      onTap: () => setState(() => _selectedPlanId = plan.id),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppTheme.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: selected ? accentColor : AppTheme.surfaceLight,
            width: selected ? 2 : 1,
          ),
          boxShadow: selected
              ? [BoxShadow(color: accentColor.withValues(alpha: 0.15), blurRadius: 12, offset: const Offset(0, 4))]
              : null,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(plan.badge, style: const TextStyle(fontSize: 28)),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(plan.name, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800)),
                      Text(plan.description, style: TextStyle(color: Colors.grey.shade400, fontSize: 11)),
                    ],
                  ),
                ),
                if (selected)
                  Icon(Icons.check_circle, color: accentColor, size: 22),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(plan.formattedPrice, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800)),
                const SizedBox(width: 4),
                Padding(
                  padding: const EdgeInsets.only(bottom: 3),
                  child: Text('/ ${plan.durationDays} hari', style: TextStyle(color: Colors.grey.shade400, fontSize: 11)),
                ),
              ],
            ),
            if (plan.savings != null) ...[
              const SizedBox(height: 4),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.green.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(plan.savings!, style: const TextStyle(color: Colors.greenAccent, fontSize: 10, fontWeight: FontWeight.w700)),
              ),
            ],
            const SizedBox(height: 10),
            ...plan.features.map((f) => Padding(
                  padding: const EdgeInsets.only(bottom: 4),
                  child: Row(
                    children: [
                      Icon(Icons.check, size: 14, color: accentColor),
                      const SizedBox(width: 6),
                      Text(f, style: TextStyle(color: Colors.grey.shade300, fontSize: 12)),
                    ],
                  ),
                )),
          ],
        ),
      ),
    );
  }

  Widget _messageBanner(String message, {required bool isError}) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: (isError ? Colors.red : Colors.green).withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: (isError ? Colors.red : Colors.green).withValues(alpha: 0.3)),
      ),
      child: Row(
        children: [
          Icon(
            isError ? Icons.error_outline : Icons.check_circle,
            size: 18,
            color: isError ? Colors.redAccent : Colors.greenAccent,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              message,
              style: TextStyle(color: isError ? Colors.redAccent : Colors.greenAccent, fontSize: 12),
            ),
          ),
        ],
      ),
    );
  }

  // ── History Section ──

  Widget _buildHistorySection() {
    if (_history.isEmpty) {
      return Container(
        padding: const EdgeInsets.symmetric(vertical: 40),
        child: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.history, size: 48, color: Colors.grey.shade600),
              const SizedBox(height: 12),
              Text('Belum ada riwayat langganan', style: TextStyle(color: Colors.grey.shade400, fontSize: 14)),
              const SizedBox(height: 4),
              Text('Pilih paket Premium atau VVIP untuk memulai', style: TextStyle(color: Colors.grey.shade600, fontSize: 12)),
            ],
          ),
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Riwayat Langganan', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Colors.grey.shade100)),
        const SizedBox(height: 4),
        Text('${_history.length} transaksi', style: TextStyle(color: Colors.grey.shade500, fontSize: 12)),
        const SizedBox(height: 12),
        for (final item in _history)
          _historyCard(item),
      ],
    );
  }

  Widget _historyCard(SubscriptionHistoryItem item) {
    final isActive = item.isActive;
    final isVvip = item.tier == 'vvip';
    final accentColor = isVvip ? Colors.purpleAccent : Colors.amber;

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: isActive ? accentColor.withValues(alpha: 0.5) : AppTheme.surfaceLight,
          width: isActive ? 1.5 : 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(isVvip ? Icons.diamond : Icons.workspace_premium, size: 20, color: accentColor),
              const SizedBox(width: 8),
              Expanded(
                child: Text(item.planName, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: isActive
                      ? accentColor.withValues(alpha: 0.15)
                      : Colors.grey.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  item.statusLabel,
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    color: isActive ? accentColor : Colors.grey,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Text(item.amountLabel, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800)),
              const SizedBox(width: 8),
              Text('· ${item.plan.contains('yearly') ? '365' : '30'} hari', style: TextStyle(color: Colors.grey.shade500, fontSize: 11)),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              _historyMeta(Icons.calendar_today, 'Dibeli: ${_formatDate(item.paidAt)}'),
              if (item.isActive && item.daysRemaining > 0) ...[
                const SizedBox(width: 12),
                _historyMeta(Icons.timer, '${item.daysRemaining} hari lagi'),
              ],
            ],
          ),
          if (item.expiresAt != null) ...[
            const SizedBox(height: 4),
            _historyMeta(Icons.event_busy, 'Berakhir: ${_formatDate(item.expiresAt)}'),
          ],
        ],
      ),
    );
  }

  Widget _historyMeta(IconData icon, String text) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 12, color: Colors.grey.shade600),
        const SizedBox(width: 4),
        Text(text, style: TextStyle(color: Colors.grey.shade500, fontSize: 11)),
      ],
    );
  }

  String _formatDate(String? iso) {
    if (iso == null || iso.isEmpty) return '-';
    try {
      final dt = DateTime.parse(iso);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      return '${dt.day} ${months[dt.month - 1]} ${dt.year}';
    } catch (_) {
      return iso;
    }
  }

  Future<void> _cancelSubscription() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Batalkan Langganan'),
        content: const Text('Langganan akan berakhir saat masa aktif habis.'),
        actions: [
          TextButton(onPressed: () => Navigator.of(ctx).pop(false), child: const Text('Batal')),
          FilledButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            style: FilledButton.styleFrom(backgroundColor: Colors.redAccent),
            child: const Text('Ya, Batalkan'),
          ),
        ],
      ),
    );
    if (confirmed != true) return;

    setState(() => _subscribing = true);
    try {
      await _repo.cancel();
      if (mounted) {
        setState(() {
          _success = 'Langganan akan berakhir saat masa aktif habis.';
          _subscribing = false;
        });
        _load();
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = 'Gagal membatalkan: $e';
          _subscribing = false;
        });
      }
    }
  }

  // ── Feature lists ──

  static const _premiumFeatures = [
    _FeatureItem(label: 'Bebas iklan saat membaca', icon: Icons.visibility_off, color: Colors.blueAccent),
    _FeatureItem(label: 'Akses episode premium lebih cepat', icon: Icons.flash_on, color: Colors.amber),
    _FeatureItem(label: 'Badge Premium eksklusif', icon: Icons.star, color: Colors.yellow),
    _FeatureItem(label: 'Dukungan langsung ke kreator', icon: Icons.forum, color: Colors.pinkAccent),
    _FeatureItem(label: 'Akses prioritas fitur baru', icon: Icons.shield, color: Colors.greenAccent),
  ];

  static const _vvipFeatures = [
    _FeatureItem(label: 'Bebas iklan saat membaca', icon: Icons.visibility_off, color: Colors.blueAccent),
    _FeatureItem(label: 'Semua episode premium terbuka', icon: Icons.lock_open, color: Colors.amber),
    _FeatureItem(label: 'Badge VVIP eksklusif', icon: Icons.diamond, color: Colors.purpleAccent),
    _FeatureItem(label: 'Akses fitur terbaru lebih dulu', icon: Icons.flash_on, color: Colors.cyanAccent),
    _FeatureItem(label: 'Badge Premium eksklusif', icon: Icons.star, color: Colors.yellow),
    _FeatureItem(label: 'Akses prioritas fitur baru', icon: Icons.shield, color: Colors.greenAccent),
  ];
}

/// Helper class for feature items.
class _FeatureItem {
  final String label;
  final IconData icon;
  final Color color;

  const _FeatureItem({required this.label, required this.icon, required this.color});
}

/// WebView halaman pembayaran Midtrans untuk subscription.
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
          _checkPaymentStatus(url);
        },
      ))
      ..loadRequest(Uri.parse(widget.redirectUrl));
  }

  void _checkPaymentStatus(String url) {
    if (url.contains('status_code=200') || url.contains('transaction_status=settlement') || url.contains('transaction_status=capture')) {
      _verifyAndClose(true);
    } else if (url.contains('status_code=202') || url.contains('transaction_status=pending')) {
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
      final res = await api.post(ApiConstants.midtransVerifyPayment, {'order_id': widget.orderId});
      final data = res['data'] as Map<String, dynamic>? ?? {};
      final status = data['status'] as String? ?? '';
      if (mounted) {
        Navigator.of(context).pop(status == 'success');
      }
    } catch (_) {
      if (mounted) Navigator.of(context).pop(false);
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
        title: const Text('Pembayaran Langganan', style: TextStyle(fontSize: 16)),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => Navigator.of(context).pop(false),
        ),
      ),
      body: Stack(
        children: [
          WebViewWidget(controller: _controller),
          if (_isLoading) const Center(child: CircularProgressIndicator()),
        ],
      ),
    );
  }
}
