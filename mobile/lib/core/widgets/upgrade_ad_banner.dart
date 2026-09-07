import 'dart:async';

import 'package:flutter/material.dart';

import '../../features/subscription/presentation/subscription_screen.dart';
import '../../services/connectivity_service.dart';

/// Iklan in-house COMIKA Premium — murni lokal (tanpa jaringan iklan eksternal)
/// sehingga tetap tampil meski tidak ada koneksi internet (komik offline).
///
/// - [full]: varian halaman penuh, muncul di sela-sela halaman baca.
/// - [banner]: varian kompak untuk daftar komik offline.
///
/// Tombol Upgrade hanya berjalan saat online; saat offline muncul hint
/// "Upgrade tersedia saat kamu online kembali" (sama seperti versi web).
class UpgradeAdBanner extends StatefulWidget {
  final bool full;

  const UpgradeAdBanner({super.key, this.full = true});

  @override
  State<UpgradeAdBanner> createState() => _UpgradeAdBannerState();
}

class _UpgradeAdBannerState extends State<UpgradeAdBanner> {
  static const int _skipAfterSeconds = 5;

  bool _dismissed = false;
  bool _hint = false;
  int _countdown = _skipAfterSeconds;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    if (widget.full) {
      _timer = Timer.periodic(const Duration(seconds: 1), (t) {
        if (!mounted) return;
        if (_countdown <= 0) {
          t.cancel();
          return;
        }
        setState(() => _countdown -= 1);
      });
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Future<void> _handleUpgrade() async {
    if (_hint) return;
    var online = ConnectivityService.instance.isOnline;
    if (!online) {
      try {
        online = await ConnectivityService.instance.check();
      } catch (_) {
        online = false;
      }
    }
    if (!mounted) return;
    if (online) {
      Navigator.of(context).push(
        MaterialPageRoute(builder: (_) => const SubscriptionScreen()),
      );
    } else {
      setState(() => _hint = true);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_dismissed) return const SizedBox.shrink();
    return widget.full ? _buildFull() : _buildBanner();
  }

  // ── Variant banner (kompak, untuk daftar offline) ──

  Widget _buildBanner() {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.fromLTRB(14, 12, 8, 12),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF312E81), Color(0xFF5B21B6), Color(0xFF9D174D)],
        ),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [Color(0xFFF59E0B), Color(0xFFF97316)]),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.workspace_premium, color: Colors.white, size: 22),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Hapus Iklan dengan COMIKA Premium',
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 2),
                Text(
                  'Baca komik tanpa gangguan iklan',
                  style: TextStyle(color: Colors.white70, fontSize: 11),
                ),
                if (_hint) ...[
                  const SizedBox(height: 4),
                  const Text(
                    'Upgrade tersedia saat kamu online kembali.',
                    style: TextStyle(fontSize: 10, color: Color(0xFFFCD34D)),
                  ),
                ],
              ],
            ),
          ),
          IconButton(
            onPressed: () => setState(() => _dismissed = true),
            icon: const Icon(Icons.close, size: 16, color: Colors.white54),
            visualDensity: VisualDensity.compact,
            tooltip: 'Tutup iklan',
          ),
          FilledButton(
            onPressed: _handleUpgrade,
            style: FilledButton.styleFrom(
              backgroundColor: const Color(0xFFF59E0B),
              foregroundColor: Colors.black,
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            child: const Text('Upgrade', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800)),
          ),
        ],
      ),
    );
  }

  // ── Variant full (halaman penuh, sela baca) ──

  Widget _buildFull() {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 16),
      padding: const EdgeInsets.fromLTRB(20, 8, 20, 4),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF1E1B4B), Color(0xFF18181B), Color(0xFF831843)],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white12),
      ),
      child: Column(
        children: [
          // Header: label IKLAN + close
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: Colors.black38,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: const Text(
                  'IKLAN',
                  style: TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 1,
                    color: Colors.white54,
                  ),
                ),
              ),
              const Spacer(),
              IconButton(
                onPressed: () => setState(() => _dismissed = true),
                icon: const Icon(Icons.close, size: 18, color: Colors.white54),
                visualDensity: VisualDensity.compact,
                tooltip: 'Tutup iklan',
              ),
            ],
          ),
          const SizedBox(height: 10),
          Container(
            width: 68,
            height: 68,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [Color(0xFFF59E0B), Color(0xFFF97316)]),
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Icon(Icons.workspace_premium, size: 32, color: Colors.white),
          ),
          const SizedBox(height: 14),
          const Text(
            'Hapus Semua Iklan!',
            style: TextStyle(fontSize: 19, fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 6),
          Text(
            'Nikmati pengalaman membaca komik yang lebih nyaman tanpa gangguan iklan dengan COMIKA Premium.',
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.white70, fontSize: 12, height: 1.5),
          ),
          const SizedBox(height: 16),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            alignment: WrapAlignment.center,
            children: [
              _benefitChip(Icons.visibility_off, 'Bebas iklan', Colors.blueAccent),
              _benefitChip(Icons.flash_on, 'Akses lebih cepat', Colors.amber),
              _benefitChip(Icons.star, 'Badge eksklusif', Colors.yellow),
              _benefitChip(Icons.forum, 'Dukung kreasi', Colors.greenAccent),
            ],
          ),
          const SizedBox(height: 18),
          SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed: _handleUpgrade,
              style: FilledButton.styleFrom(
                backgroundColor: const Color(0xFFF59E0B),
                foregroundColor: Colors.black,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              child: const Text('Upgrade ke Premium', style: TextStyle(fontWeight: FontWeight.w800)),
            ),
          ),
          if (_hint)
            Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Text(
                'Upgrade tersedia saat kamu online kembali.',
                style: const TextStyle(fontSize: 10, color: Color(0xFFFCD34D)),
              ),
            ),
          const SizedBox(height: 6),
          TextButton(
            onPressed: _countdown > 0 ? null : () => setState(() => _dismissed = true),
            child: Text(
              _countdown > 0 ? 'Lewati dalam ${_countdown}s' : 'Lewati Iklan',
              style: TextStyle(
                fontSize: 11,
                color: _countdown > 0 ? Colors.white38 : Colors.white70,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _benefitChip(IconData icon, String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.06),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 13, color: color),
          const SizedBox(width: 5),
          Text(label, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}