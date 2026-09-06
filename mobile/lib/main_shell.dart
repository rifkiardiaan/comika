import 'dart:async';

import 'package:flutter/material.dart';

import 'features/home/presentation/home_screen.dart';
import 'features/discover/presentation/discover_screen.dart';
import 'features/discover/presentation/search_screen.dart';
import 'features/downloads/presentation/saved_comics_screen.dart';
import 'features/profile/presentation/profile_screen.dart';
import 'services/connectivity_service.dart';

/// Shell utama aplikasi dengan bottom navigation:
/// Beranda · Jelajahi · Cari · Offline · Profil
class MainShell extends StatefulWidget {
  const MainShell({super.key});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _tabIndex = 0;
  bool _isOnline = true;
  late StreamSubscription<bool> _connectivitySub;

  /// Index tab yang bisa diakses saat offline
  static const _offlineAllowedTabs = [3, 4]; // Offline, Profil

  @override
  void initState() {
    super.initState();
    _isOnline = ConnectivityService.instance.isOnline;
    _connectivitySub = ConnectivityService.instance.onStatusChanged.listen((online) {
      if (mounted) setState(() => _isOnline = online);
    });
    ConnectivityService.instance.startMonitoring();
  }

  @override
  void dispose() {
    _connectivitySub.cancel();
    super.dispose();
  }

  void _onTabTap(int index) {
    // Jika offline dan tab tidak diizinkan, tampilkan pesan
    if (!_isOnline && !_offlineAllowedTabs.contains(index)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Row(
            children: [
              Icon(Icons.wifi_off, size: 16, color: Colors.white),
              SizedBox(width: 8),
              Expanded(child: Text('Anda sedang offline. Buka tab Offline untuk akses komik yang sudah didownload.')),
            ],
          ),
          duration: Duration(seconds: 2),
        ),
      );
      return;
    }
    setState(() => _tabIndex = index);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _tabIndex,
        children: [
          _isOnline ? const HomeScreen() : const _OfflinePlaceholder(tabName: 'Beranda'),
          _isOnline ? const DiscoverScreen() : const _OfflinePlaceholder(tabName: 'Jelajahi'),
          _isOnline ? const SearchScreen() : const _OfflinePlaceholder(tabName: 'Cari'),
          const SavedComicsScreen(),
          const ProfileScreen(),
        ],
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: const Color(0xFF18181B),
          border: Border(
            top: BorderSide(color: Colors.white.withValues(alpha: 0.08), width: 0.5),
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.only(bottom: 4, left: 4, right: 4, top: 4),
            child: BottomNavigationBar(
              currentIndex: _tabIndex,
              onTap: _onTabTap,
              type: BottomNavigationBarType.fixed,
              elevation: 0,
              backgroundColor: Colors.transparent,
              selectedIconTheme: const IconThemeData(size: 25),
              unselectedIconTheme: const IconThemeData(size: 23),
              items: const [
                BottomNavigationBarItem(
                  icon: Icon(Icons.home_outlined),
                  activeIcon: Icon(Icons.home),
                  label: 'Beranda',
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.explore_outlined),
                  activeIcon: Icon(Icons.explore),
                  label: 'Jelajahi',
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.search),
                  label: 'Cari',
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.bookmark_border),
                  activeIcon: Icon(Icons.bookmark),
                  label: 'Offline',
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.person_outline),
                  activeIcon: Icon(Icons.person),
                  label: 'Profil',
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Placeholder widget yang ditampilkan saat tab tidak bisa diakses offline.
class _OfflinePlaceholder extends StatelessWidget {
  final String tabName;

  const _OfflinePlaceholder({required this.tabName});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: Colors.grey.shade900,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.wifi_off, size: 40, color: Colors.grey),
            ),
            const SizedBox(height: 20),
            const Text(
              'Anda Sedang Offline',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 8),
            Text(
              'Halaman $tabName membutuhkan koneksi internet.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey.shade500, fontSize: 13),
            ),
            const SizedBox(height: 16),
            Text(
              'Buka tab "Offline" untuk membaca komik yang sudah didownload.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
            ),
          ],
        ),
      ),
    );
  }
}
