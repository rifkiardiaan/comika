import 'dart:io';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import '../../../core/constants/api_constants.dart';
import '../../../core/theme/app_theme.dart';
import '../../../models/downloaded_episode.dart';
import '../../../models/user.dart';
import '../../../services/api_service.dart';
import '../../../services/auth_service.dart';
import '../../../services/download_service.dart';
import '../../auth/presentation/login_screen.dart';
import '../../creator/presentation/creator_dashboard_screen.dart';
import '../../downloads/presentation/saved_comics_screen.dart';
import '../../gamification/data/gamification_repository.dart';
import '../../reader/presentation/reader_screen.dart';
import '../../subscription/presentation/subscription_screen.dart';
import '../../wallet/presentation/wallet_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  GamificationProfile? _gamification;
  bool _loadingGamification = false;
  bool _uploadingAvatar = false;
  bool _deletingAvatar = false;

  // Download state
  List<DownloadedEpisode> _downloads = [];
  bool _loadingDownloads = true;
  String _totalSize = '0KB';
  int _comicCount = 0;
  int _episodeCount = 0;

  @override
  void initState() {
    super.initState();
    _loadGamification();
    _loadDownloads();
  }

  Future<void> _loadGamification() async {
    if (AuthService.instance.user == null || _loadingGamification) return;
    setState(() => _loadingGamification = true);
    try {
      final profile = await GamificationRepository().fetchProfile();
      if (mounted) setState(() => _gamification = profile);
    } catch (_) {
      // Ringkasan gamification opsional — abaikan error agar profil tetap tampil.
    } finally {
      if (mounted) setState(() => _loadingGamification = false);
    }
  }

  /// Panggil ulang bila user sudah login namun ringkasan belum dimuat
  void _ensureGamificationLoaded() {
    if (AuthService.instance.user != null && _gamification == null) {
      _loadGamification();
    }
  }

  Future<void> _loadDownloads() async {
    if (!mounted) return;
    setState(() => _loadingDownloads = true);
    try {
      final items = await DownloadService.instance.getAll();
      // Verify files still exist
      final valid = <DownloadedEpisode>[];
      for (final item in items) {
        if (item.localPagePaths.isNotEmpty && await File(item.localPagePaths.first).exists()) {
          valid.add(item);
        }
      }
      final totalSize = await DownloadService.instance.totalSizeLabel();
      final comicCount = valid.map((e) => e.comicId).toSet().length;
      if (mounted) {
        setState(() {
          _downloads = valid;
          _totalSize = totalSize;
          _comicCount = comicCount;
          _episodeCount = valid.length;
          _loadingDownloads = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _loadingDownloads = false);
    }
  }

  Future<void> _deleteAvatar() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Hapus Avatar'),
        content: const Text('Foto profil akan dihapus dan diganti dengan inisial nama.'),
        actions: [
          TextButton(onPressed: () => Navigator.of(ctx).pop(false), child: const Text('Batal')),
          FilledButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            style: FilledButton.styleFrom(backgroundColor: Colors.redAccent),
            child: const Text('Hapus'),
          ),
        ],
      ),
    );
    if (confirmed != true) return;

    setState(() => _deletingAvatar = true);
    try {
      await AuthService.instance.deleteAvatar();
      if (mounted) {
        setState(() {});
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Avatar berhasil dihapus.')),
        );
      }
    } on ApiException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Gagal menghapus avatar.')),
        );
      }
    } finally {
      if (mounted) setState(() => _deletingAvatar = false);
    }
  }

  void _showAvatarOptions() {
    final hasAvatar = AuthService.instance.user?.avatarUrl != null &&
        AuthService.instance.user!.avatarUrl!.isNotEmpty;
    showModalBottomSheet(
      context: context,
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.camera_alt),
              title: const Text('Ubah Foto Profil'),
              onTap: () {
                Navigator.of(ctx).pop();
                _pickAndUploadAvatar();
              },
            ),
            if (hasAvatar)
              ListTile(
                leading: const Icon(Icons.delete_outline, color: Colors.redAccent),
                title: const Text('Hapus Foto Profil', style: TextStyle(color: Colors.redAccent)),
                onTap: () {
                  Navigator.of(ctx).pop();
                  _deleteAvatar();
                },
              ),
          ],
        ),
      ),
    );
  }

  Future<void> _pickAndUploadAvatar() async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(
      source: ImageSource.gallery,
      maxWidth: 512,
      maxHeight: 512,
      imageQuality: 80,
    );
    if (picked == null) return;

    setState(() => _uploadingAvatar = true);
    try {
      await AuthService.instance.uploadAvatar(picked.path);
      if (mounted) {
        setState(() {});
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Avatar berhasil diperbarui.')),
        );
      }
    } on ApiException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Gagal mengupload avatar.')),
        );
      }
    } finally {
      if (mounted) setState(() => _uploadingAvatar = false);
    }
  }

  Future<void> _showChangePasswordDialog(BuildContext context) async {
    final current = TextEditingController();
    final next = TextEditingController();
    String? error;
    var loading = false;

    await showDialog<void>(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (dialogContext, setDialogState) => AlertDialog(
          title: const Text('Ganti Password'),
          content: SizedBox(
            width: 420,
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    'Sesi di perangkat lain akan otomatis keluar setelah password diganti.',
                    style: TextStyle(color: Colors.grey.shade400, fontSize: 12),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: current,
                    obscureText: true,
                    decoration: InputDecoration(
                      labelText: 'Password Saat Ini',
                      prefixIcon: const Icon(Icons.lock_outline, size: 20),
                      filled: true,
                      fillColor: AppTheme.surfaceLight,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: next,
                    obscureText: true,
                    decoration: InputDecoration(
                      labelText: 'Password Baru (min. 8 karakter)',
                      prefixIcon: const Icon(Icons.password, size: 20),
                      filled: true,
                      fillColor: AppTheme.surfaceLight,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                    ),
                  ),
                  if (error != null) ...[const SizedBox(height: 12), Text(error!, style: const TextStyle(color: Colors.redAccent, fontSize: 12))],
                ],
              ),
            ),
          ),
          actions: [
            TextButton(
              onPressed: loading ? null : () => Navigator.of(dialogContext).pop(),
              child: const Text('Batal'),
            ),
            FilledButton(
              onPressed: loading
                  ? null
                  : () async {
                      if (next.text.length < 8) {
                        setDialogState(() => error = 'Password baru minimal 8 karakter.');
                        return;
                      }
                      setDialogState(() {
                        loading = true;
                        error = null;
                      });
                      try {
                        await AuthService.instance.changePassword(
                          currentPassword: current.text,
                          newPassword: next.text,
                        );
                        if (dialogContext.mounted) {
                          Navigator.of(dialogContext).pop();
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Password berhasil diubah.')),
                          );
                        }
                      } on ApiException catch (e) {
                        setDialogState(() {
                          error = e.message;
                          loading = false;
                        });
                      } catch (_) {
                        setDialogState(() {
                          error = 'Tidak dapat terhubung ke server. Coba lagi.';
                          loading = false;
                        });
                      }
                    },
              style: FilledButton.styleFrom(backgroundColor: AppTheme.brand),
              child: loading
                  ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : const Text('Simpan'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    _ensureGamificationLoaded();

    final user = AuthService.instance.user;

    if (user == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Profil')),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.person_outline, size: 56, color: Colors.grey),
                const SizedBox(height: 12),
                const Text('Masuk untuk melihat profil', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                const SizedBox(height: 6),
                Text('Akses komik offline dan kelola akunmu', style: TextStyle(color: Colors.grey.shade400, fontSize: 12)),
                const SizedBox(height: 20),
                FilledButton(
                  onPressed: () => Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const LoginScreen()),
                  ),
                  style: FilledButton.styleFrom(
                    backgroundColor: AppTheme.brand,
                    padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: const Text('Masuk Sekarang', style: TextStyle(fontWeight: FontWeight.w700)),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Profil')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Header user dengan avatar yang bisa diklik
          GestureDetector(
            onTap: _uploadingAvatar || _deletingAvatar ? null : _showAvatarOptions,
            child: Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [AppTheme.brand.withValues(alpha: 0.4), AppTheme.surface],
                ),
                borderRadius: BorderRadius.circular(18),
              ),
              child: Row(
                children: [
                  Stack(
                    clipBehavior: Clip.none,
                    children: [
                      _buildAvatar(user),
                      Positioned(
                        right: -2,
                        bottom: -2,
                        child: Container(
                          width: 24,
                          height: 24,
                          decoration: BoxDecoration(
                            color: AppTheme.brand,
                            shape: BoxShape.circle,
                            border: Border.all(color: AppTheme.surface, width: 2),
                          ),
                          child: _uploadingAvatar || _deletingAvatar
                              ? const SizedBox(
                                  width: 12,
                                  height: 12,
                                  child: CircularProgressIndicator(strokeWidth: 1.5, color: Colors.white),
                                )
                              : const Icon(Icons.camera_alt, size: 12, color: Colors.white),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Flexible(
                              child: Text(
                                user.name,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w800),
                              ),
                            ),
                            const SizedBox(width: 6),
                            _roleChip(user.role),
                          ],
                        ),
                        const SizedBox(height: 2),
                        Text('@${user.username}', style: TextStyle(color: Colors.grey.shade400, fontSize: 12)),
                        const SizedBox(height: 6),
                        Text(
                          '${user.coinBalance} koin',
                          style: const TextStyle(color: Colors.amber, fontSize: 13, fontWeight: FontWeight.w700),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          if (_uploadingAvatar)
            Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Text(
                'Mengupload avatar...',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey.shade500, fontSize: 11),
              ),
            ),

          const SizedBox(height: 16),

          // Notifikasi verifikasi email (jika belum diverifikasi)
          if (!user.isEmailVerified)
            Container(
              margin: const EdgeInsets.only(bottom: 14),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.amber.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: Colors.amber.withValues(alpha: 0.3)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.verified_outlined, color: Colors.amber, size: 20),
                  const SizedBox(width: 10),
                  const Expanded(
                    child: Text(
                      'Verifikasi email kamu untuk mengamankan akun. Cek inbox atau lakukan via web COMIKA.',
                      style: TextStyle(color: Colors.amber, fontSize: 12),
                    ),
                  ),
                ],
              ),
            ),

          // Pengingat expiry langganan (jika akan habis dalam 3 hari)
          if (user.isPremium || user.isVvip) _buildExpiryReminder(user),

          // Kartu gamification (level, XP, streak, achievement)
          if (_gamification != null) _gamificationCard(_gamification!),

          // === Komik Offline Section ===
          _buildDownloadSection(),

          // Menu
          _menuTile(
            icon: Icons.bookmark,
            color: Colors.blueAccent,
            title: 'Komik Offline',
            subtitle: _episodeCount > 0
                ? '$_episodeCount episode · $_comicCount komik'
                : 'Download komik untuk baca offline',
            onTap: () => Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => const SavedComicsScreen()),
            ),
          ),
          _menuTile(
            icon: Icons.workspace_premium,
            color: Colors.amber,
            title: 'Premium & VVIP',
            subtitle: user.isVvip
                ? '💎 VVIP aktif'
                : user.isPremium
                    ? '🎉 Premium aktif'
                    : 'Upgrade akses & buka semua episode',
            onTap: () => Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => const SubscriptionScreen()),
            ),
          ),
          _menuTile(
            icon: Icons.emoji_events_outlined,
            color: Colors.orangeAccent,
            title: 'Prestasi & Level',
            subtitle: _gamification == null
                ? 'XP, streak & achievement'
                : 'Level ${_gamification!.level} · ${_gamification!.earnedCount} achievement',
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Detail prestasi tersedia di web COMIKA')),
              );
            },
          ),
          _menuTile(
            icon: Icons.account_balance_wallet,
            color: Colors.amber,
            title: 'Dompet Koin',
            subtitle: 'Top-up & riwayat transaksi',
            onTap: () => Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => const WalletScreen()),
            ),
          ),
          _menuTile(
            icon: Icons.edit_outlined,
            color: AppTheme.brand,
            title: 'Edit Nama',
            subtitle: user.name,
            onTap: () => _showEditNameDialog(context),
          ),
          _menuTile(
            icon: Icons.lock_outline,
            color: Colors.blueAccent,
            title: 'Ganti Password',
            subtitle: 'Perbarui password akunmu',
            onTap: () => _showChangePasswordDialog(context),
          ),
          _menuTile(
            icon: Icons.person_outline,
            color: AppTheme.brand,
            title: 'Info Akun',
            subtitle: user.email,
            onTap: () {},
          ),
          if (user.isCreator)
            _menuTile(
              icon: Icons.palette_outlined,
              color: Colors.pinkAccent,
              title: 'Dashboard Creator',
              subtitle: 'Statistik, laporan pembacaan & pendapatan',
              onTap: () => Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const CreatorDashboardScreen()),
              ),
            ),
          if (user.isAdmin)
            _menuTile(
              icon: Icons.shield_outlined,
              color: Colors.greenAccent,
              title: 'Admin',
              subtitle: 'Panel admin tersedia di web',
              onTap: () {},
            ),

          // Ban status indicator
          if (user.isBlocked)
            Container(
              margin: const EdgeInsets.only(bottom: 14),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.red.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: Colors.red.withValues(alpha: 0.3)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.block, color: Colors.redAccent, size: 20),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          user.isPermanentlyBanned ? 'Akun Diblokir Permanen' : 'Akun Diblokir',
                          style: const TextStyle(color: Colors.redAccent, fontSize: 13, fontWeight: FontWeight.w700),
                        ),
                        if (user.banReason != null && user.banReason!.isNotEmpty)
                          Text(user.banReason!, style: TextStyle(color: Colors.grey.shade400, fontSize: 11)),
                      ],
                    ),
                  ),
                ],
              ),
            ),

          const SizedBox(height: 24),
          // Logout
          OutlinedButton.icon(
            onPressed: () async {
              await AuthService.instance.logout();
              if (context.mounted) {
                setState(() => _gamification = null);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Berhasil keluar. Sampai jumpa!')),
                );
              }
            },
            icon: const Icon(Icons.logout, size: 18),
            label: const Text('Keluar'),
            style: OutlinedButton.styleFrom(
              foregroundColor: Colors.redAccent,
              side: BorderSide(color: Colors.red.withValues(alpha: 0.4)),
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _gamificationCard(GamificationProfile profile) {
    final progress = (profile.levelProgress * 100).clamp(0.0, 100.0);

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [AppTheme.brand.withValues(alpha: 0.35), AppTheme.surface],
        ),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppTheme.brand.withValues(alpha: 0.35)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 48,
                height: 48,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(colors: [AppTheme.brand, AppTheme.pink]),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: const Icon(Icons.auto_awesome, color: Colors.white, size: 24),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Level', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Colors.grey)),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.baseline,
                      textBaseline: TextBaseline.alphabetic,
                      children: [
                        Text(
                          '${profile.level}',
                          style: const TextStyle(fontSize: 30, fontWeight: FontWeight.w900),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          '${profile.totalXp} XP',
                          style: TextStyle(color: Colors.grey.shade400, fontSize: 12, fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  const Icon(Icons.local_fire_department, color: Colors.orangeAccent, size: 20),
                  const SizedBox(height: 2),
                  Text(
                    '${profile.streakCurrent} hari',
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: Colors.orangeAccent),
                  ),
                  Text(
                    'streak',
                    style: TextStyle(color: Colors.grey.shade500, fontSize: 10),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 14),
          // Progress bar XP menuju level berikutnya
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: LinearProgressIndicator(
              value: progress / 100,
              minHeight: 8,
              backgroundColor: Colors.white.withValues(alpha: 0.1),
              valueColor: const AlwaysStoppedAnimation(AppTheme.brand),
            ),
          ),
          const SizedBox(height: 6),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '${profile.xpIntoLevel} XP masuk level ini',
                style: TextStyle(color: Colors.grey.shade400, fontSize: 10),
              ),
              Text(
                '${profile.xpToNextLevel} XP ke level ${profile.level + 1}',
                style: TextStyle(color: Colors.grey.shade400, fontSize: 10),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              _statChip(
                icon: Icons.menu_book_outlined,
                label: '${profile.episodesRead} dibaca',
              ),
              const SizedBox(width: 8),
              _statChip(
                icon: Icons.emoji_events_outlined,
                label: '${profile.earnedCount} achievement',
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _statChip({required IconData icon, required String label}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.06),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 13, color: Colors.grey.shade300),
          const SizedBox(width: 5),
          Text(
            label,
            style: TextStyle(color: Colors.grey.shade200, fontSize: 11, fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }

  /// Tampilkan banner pengingat jika langganan akan habis dalam 3 hari.
  Widget _buildExpiryReminder(User user) {
    final untilStr = user.isVvip ? user.vvipUntil : user.premiumUntil;
    if (untilStr == null || untilStr.isEmpty) return const SizedBox.shrink();

    DateTime? expiry;
    try {
      expiry = DateTime.parse(untilStr);
    } catch (_) {
      return const SizedBox.shrink();
    }

    final daysLeft = expiry.difference(DateTime.now()).inDays;
    if (daysLeft > 3 || daysLeft < 0) return const SizedBox.shrink();

    final tier = user.isVvip ? 'VVIP' : 'Premium';
    final color = user.isVvip ? Colors.purpleAccent : Colors.amber;

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Row(
        children: [
          Icon(
            daysLeft == 0 ? Icons.warning : Icons.info_outline,
            color: daysLeft == 0 ? Colors.redAccent : color,
            size: 20,
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  daysLeft == 0
                      ? 'Langganan $tier habis hari ini!'
                      : 'Langganan $tier habis dalam $daysLeft hari',
                  style: TextStyle(
                    color: daysLeft == 0 ? Colors.redAccent : color,
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                if (daysLeft > 0)
                  Text(
                    'Perpanjang agar akses tetap aktif',
                    style: TextStyle(color: Colors.grey.shade500, fontSize: 11),
                  ),
              ],
            ),
          ),
          Icon(Icons.chevron_right, color: color, size: 18),
        ],
      ),
    );
  }

  /// Section download offline — ringkasan + komik terakhir didownload.
  Widget _buildDownloadSection() {
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.surfaceLight),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
            child: Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: Colors.blueAccent.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.bookmark, size: 20, color: Colors.blueAccent),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Komik Offline', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                      Text(
                        _loadingDownloads
                            ? 'Memuat...'
                            : '$_totalSize · $_comicCount komik · $_episodeCount episode',
                        style: TextStyle(color: Colors.grey.shade500, fontSize: 11),
                      ),
                    ],
                  ),
                ),
                if (_episodeCount > 0)
                  TextButton(
                    onPressed: () => Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => const SavedComicsScreen()),
                    ),
                    child: const Text('Lihat Semua'),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          // Download list or empty state
          if (_loadingDownloads)
            const Padding(
              padding: EdgeInsets.all(24),
              child: Center(child: CircularProgressIndicator(strokeWidth: 2)),
            )
          else if (_downloads.isEmpty)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              child: Column(
                children: [
                  Icon(Icons.bookmark_border, size: 32, color: Colors.grey.shade700),
                  const SizedBox(height: 8),
                  Text('Belum ada download', style: TextStyle(color: Colors.grey.shade500, fontSize: 12)),
                  const SizedBox(height: 4),
                  Text(
                    'Download episode untuk baca tanpa internet',
                    style: TextStyle(color: Colors.grey.shade600, fontSize: 11),
                  ),
                ],
              ),
            )
          else
            _buildDownloadedList(),
        ],
      ),
    );
  }

  /// Daftar komik yang sudah didownload (max 5 terbaru).
  Widget _buildDownloadedList() {
    // Group by comicId and take latest 5 comics
    final grouped = <int, List<DownloadedEpisode>>{};
    for (final d in _downloads) {
      grouped.putIfAbsent(d.comicId, () => []).add(d);
    }
    final comicIds = grouped.keys.take(5).toList();

    return Column(
      children: [
        for (int i = 0; i < comicIds.length; i++)
          _DownloadedComicTile(
            episodes: grouped[comicIds[i]]!,
            onTap: () => Navigator.of(context).push(
              MaterialPageRoute(
                builder: (_) => ReaderScreen(
                  comicId: grouped[comicIds[i]]!.first.comicId,
                  episodeId: grouped[comicIds[i]]!.first.episodeId,
                ),
              ),
            ),
            onSeeAll: () => Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => const SavedComicsScreen()),
            ),
            showDivider: i < comicIds.length - 1,
          ),
        if (grouped.length > 5)
          Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Center(
              child: TextButton(
                onPressed: () => Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const SavedComicsScreen()),
                ),
                child: Text(
                  'Lihat ${grouped.length - 5} komik lainnya',
                  style: const TextStyle(fontSize: 12, color: AppTheme.brand),
                ),
              ),
            ),
          ),
        const SizedBox(height: 4),
      ],
    );
  }

  Widget _buildAvatar(User user) {
    final url = ApiConstants.assetUrl(user.avatarUrl);
    if (url.isNotEmpty) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(18),
        child: Image.network(
          url,
          width: 60,
          height: 60,
          fit: BoxFit.cover,
          errorBuilder: (_, _, _) => _avatarFallback(user.name),
        ),
      );
    }
    return _avatarFallback(user.name);
  }

  Widget _avatarFallback(String name) {
    return Container(
      width: 60,
      height: 60,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        gradient: const LinearGradient(colors: [AppTheme.brand, AppTheme.pink]),
        borderRadius: BorderRadius.circular(18),
      ),
      child: Text(
        name.isEmpty ? 'C' : name.characters.first.toUpperCase(),
        style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: Colors.white),
      ),
    );
  }

  Future<void> _showEditNameDialog(BuildContext context) async {
    final controller = TextEditingController(text: AuthService.instance.user?.name ?? '');
    String? error;
    var loading = false;

    await showDialog<void>(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (dialogContext, setDialogState) => AlertDialog(
          title: const Text('Edit Nama'),
          content: SizedBox(
            width: 420,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                TextField(
                  controller: controller,
                  maxLength: 100,
                  decoration: InputDecoration(
                    labelText: 'Nama Tampilan',
                    prefixIcon: const Icon(Icons.person_outline, size: 20),
                    filled: true,
                    fillColor: AppTheme.surfaceLight,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide.none,
                    ),
                  ),
                ),
                if (error != null) ...[const SizedBox(height: 8), Text(error!, style: const TextStyle(color: Colors.redAccent, fontSize: 12))],
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: loading ? null : () => Navigator.of(dialogContext).pop(),
              child: const Text('Batal'),
            ),
            FilledButton(
              onPressed: loading
                  ? null
                  : () async {
                      final name = controller.text.trim();
                      if (name.isEmpty) {
                        setDialogState(() => error = 'Nama tidak boleh kosong.');
                        return;
                      }
                      setDialogState(() {
                        loading = true;
                        error = null;
                      });
                      try {
                        await AuthService.instance.updateProfile(name: name);
                        if (dialogContext.mounted) {
                          Navigator.of(dialogContext).pop();
                          setState(() {}); // refresh header
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Nama berhasil diperbarui.')),
                          );
                        }
                      } on ApiException catch (e) {
                        setDialogState(() {
                          error = e.message;
                          loading = false;
                        });
                      } catch (_) {
                        setDialogState(() {
                          error = 'Tidak dapat terhubung ke server. Coba lagi.';
                          loading = false;
                        });
                      }
                    },
              style: FilledButton.styleFrom(backgroundColor: AppTheme.brand),
              child: loading
                  ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : const Text('Simpan'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _roleChip(String role) {
    final label = switch (role) {
      'admin' => 'Admin',
      'creator' => 'Creator',
      _ => 'Pembaca',
    };
    final color = switch (role) {
      'admin' => Colors.greenAccent,
      'creator' => Colors.pinkAccent,
      _ => Colors.grey,
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(label, style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.w700)),
    );
  }

  Widget _menuTile({
    required IconData icon,
    required Color color,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Material(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(14),
        child: ListTile(
          onTap: onTap,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          leading: Container(
            width: 42,
            height: 42,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, size: 20, color: color),
          ),
          title: Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
          subtitle: Text(subtitle, maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(color: Colors.grey.shade500, fontSize: 11)),
          trailing: const Icon(Icons.chevron_right, size: 20, color: Colors.grey),
        ),
      ),
    );
  }
}

/// Tile komik yang sudah didownload — menampilkan cover, judul, dan jumlah episode.
class _DownloadedComicTile extends StatelessWidget {
  final List<DownloadedEpisode> episodes;
  final VoidCallback onTap;
  final VoidCallback onSeeAll;
  final bool showDivider;

  const _DownloadedComicTile({
    required this.episodes,
    required this.onTap,
    required this.onSeeAll,
    this.showDivider = true,
  });

  @override
  Widget build(BuildContext context) {
    final first = episodes.first;
    final totalSize = episodes.fold<int>(0, (sum, e) => sum + e.totalSizeBytes);
    final sizeLabel = totalSize < 1048576
        ? '${(totalSize / 1024).toStringAsFixed(0)}KB'
        : '${(totalSize / 1048576).toStringAsFixed(1)}MB';

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          child: Row(
            children: [
              // Cover thumbnail
              _ProfileCoverThumb(
                coverUrl: first.comicCoverUrl,
                localCoverPath: first.localCoverPath,
                title: first.comicTitle,
              ),
              const SizedBox(width: 12),
              // Info
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      first.comicTitle.isEmpty ? 'Komik #${first.comicId}' : first.comicTitle,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${episodes.length} episode · $sizeLabel',
                      style: TextStyle(color: Colors.grey.shade500, fontSize: 11),
                    ),
                  ],
                ),
              ),
              // Play button
              IconButton(
                icon: const Icon(Icons.play_circle, color: AppTheme.brand, size: 24),
                onPressed: onTap,
                visualDensity: VisualDensity.compact,
                tooltip: 'Baca',
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Cover thumbnail untuk profil download section.
class _ProfileCoverThumb extends StatelessWidget {
  final String? coverUrl;
  final String? localCoverPath;
  final String title;

  const _ProfileCoverThumb({required this.coverUrl, this.localCoverPath, required this.title});

  @override
  Widget build(BuildContext context) {
    final local = localCoverPath ?? '';
    if (local.isNotEmpty && File(local).existsSync()) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(10),
        child: Image.file(
          File(local),
          width: 44,
          height: 60,
          fit: BoxFit.cover,
          errorBuilder: (_, _, _) => _fallback(),
        ),
      );
    }
    final url = ApiConstants.assetUrl(coverUrl);
    if (url.isNotEmpty) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(10),
        child: Image.network(
          url,
          width: 44,
          height: 60,
          fit: BoxFit.cover,
          errorBuilder: (_, _, _) => _fallback(),
        ),
      );
    }
    return _fallback();
  }

  Widget _fallback() {
    return Container(
      width: 44,
      height: 60,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(10),
        gradient: const LinearGradient(colors: [Color(0xFF1E1B4B), Color(0xFF7C3AED)]),
      ),
      child: Text(
        title.isEmpty ? 'C' : title.characters.first.toUpperCase(),
        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Colors.white70),
      ),
    );
  }
}
