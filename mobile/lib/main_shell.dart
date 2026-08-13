import 'package:flutter/material.dart';

import 'features/home/presentation/home_screen.dart';
import 'features/discover/presentation/discover_screen.dart';
import 'features/library/presentation/library_screen.dart';
import 'features/profile/presentation/profile_screen.dart';

/// Shell utama aplikasi dengan bottom navigation:
/// Beranda · Jelajahi · Perpustakaan · Profil
class MainShell extends StatefulWidget {
  const MainShell({super.key});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _tabIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _tabIndex,
        children: const [
          HomeScreen(),
          DiscoverScreen(),
          LibraryScreen(),
          ProfileScreen(),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _tabIndex,
        onTap: (i) => setState(() => _tabIndex = i),
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Beranda'),
          BottomNavigationBarItem(icon: Icon(Icons.explore), label: 'Jelajahi'),
          BottomNavigationBarItem(icon: Icon(Icons.bookmark), label: 'Simpan'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profil'),
        ],
      ),
    );
  }
}
