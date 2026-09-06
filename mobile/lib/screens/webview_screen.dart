import 'dart:async';
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import '../services/connectivity_service.dart';

/// URL web app COMIKA.
/// Ganti ke domain production setelah deploy.
/// - Dev: http://10.0.2.2:5173  (Android emulator → localhost)
/// - Prod: https://comika.app
const String kWebAppUrl = String.fromEnvironment(
  'WEB_APP_URL',
  defaultValue: 'https://comika.free.nf/',
);

class WebViewScreen extends StatefulWidget {
  const WebViewScreen({super.key});

  @override
  State<WebViewScreen> createState() => _WebViewScreenState();
}

class _WebViewScreenState extends State<WebViewScreen> {
  late final WebViewController _controller;
  bool _isLoading = true;
  bool _hasError = false;
  String? _errorMessage;
  int _loadProgress = 0;

  @override
  void initState() {
    super.initState();
    _listenConnectivity();
    _initWebView();
  }

  @override
  void dispose() {
    _connectivitySub?.cancel();
    super.dispose();
  }

  void _initWebView() {
    final controller = WebViewController();

    controller
      // JavaScript harus aktif agar React app berjalan
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      // Set user agent agar web app tahu ini mobile app
      ..setUserAgent('COMIKA/1.0 (Android Mobile App)')
      // Handle navigasi
      ..setNavigationDelegate(NavigationDelegate(
        onPageStarted: (url) {
          if (mounted) {
            setState(() {
              _isLoading = true;
              _hasError = false;
              _errorMessage = null;
            });
          }
        },
        onProgress: (progress) {
          if (mounted) {
            setState(() => _loadProgress = progress);
          }
        },
        onPageFinished: (url) {
          if (mounted) {
            setState(() => _isLoading = false);
          }
          // Sembunyikan splash screen / status bar overlay
          _injectStatusBarFix();
        },
        onWebResourceError: (error) {
          if (!mounted) return;
          // Hanya navigasi halaman utama yang fatal. Error dari sub-resource
          // (mis. panggilan API yang gagal saat offline) TIDAK boleh menutupi
          // web app — halaman komik offline tetap bisa dibuka dari cache.
          if (error.isForMainFrame == true) {
            setState(() {
              _isLoading = false;
              _hasError = true;
              _errorMessage = error.description;
            });
          }
        },
        // Cegah navigasi ke URL eksternal (buka di browser)
        onNavigationRequest: (request) {
          final uri = Uri.parse(request.url);
          // Izinkan file:// untuk upload gambar
          if (uri.scheme == 'file') return NavigationDecision.navigate;

          // Izinkan URL yang masih di domain yang sama atau localhost
          return NavigationDecision.navigate;
        },
      ))
      // Load web app
      ..loadRequest(Uri.parse(kWebAppUrl));

    _controller = controller;
  }

  /// Suntik CSS/JS untuk menyesuaikan UI mobile
  void _injectStatusBarFix() {
    _controller.runJavaScript('''
      // Tambahkan padding top untuk status bar
      document.body.style.paddingTop = 'env(safe-area-inset-top, 0px)';
      
      // Dispatch event bahwa ini adalah mobile app
      window.__COMIKA_MOBILE__ = true;
    ''');
  }

  /// Handle tombol back Android
  Future<bool> _onWillPop() async {
    if (await _controller.canGoBack()) {
      await _controller.goBack();
      return false; // Jangan tutup app
    }
    return true; // Tutup app
  }

  void _retry() {
    setState(() {
      _hasError = false;
      _isLoading = true;
    });
    _controller.loadRequest(Uri.parse(kWebAppUrl));
  }

  /// Navigasi langsung ke halaman Komik Offline — berguna saat offline karena
  /// komik yang sudah didownload tetap bisa dibaca tanpa koneksi.
  void _openOfflineComics() {
    setState(() {
      _hasError = false;
      _isLoading = true;
    });
    final base = kWebAppUrl.endsWith('/') ? kWebAppUrl : '$kWebAppUrl/';
    _controller.loadRequest(Uri.parse('${base}komik-offline'));
  }

  /// Coba muat ulang otomatis saat koneksi kembali pulih.
  StreamSubscription<bool>? _connectivitySub;

  void _listenConnectivity() {
    _connectivitySub = ConnectivityService.instance.onStatusChanged.listen((online) {
      if (online && _hasError && mounted) {
        _retry();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) async {
        if (didPop) return;
        final shouldPop = await _onWillPop();
        if (shouldPop && context.mounted) {
          Navigator.of(context).maybePop();
        }
      },
      child: Scaffold(
        backgroundColor: const Color(0xFF0A0A0F),
        body: SafeArea(
          top: false,
          child: Stack(
            children: [
              // WebView
              WebViewWidget(controller: _controller),

              // Loading bar
              if (_isLoading)
                Positioned(
                  top: 0,
                  left: 0,
                  right: 0,
                  child: Column(
                    children: [
                      // Status bar safe area
                      SizedBox(
                        height: MediaQuery.of(context).padding.top,
                      ),
                      // Progress bar
                      LinearProgressIndicator(
                        value: _loadProgress / 100,
                        backgroundColor: const Color(0xFF1A1A2E),
                        valueColor: const AlwaysStoppedAnimation<Color>(
                          Color(0xFF7C3AED),
                        ),
                        minHeight: 3,
                      ),
                    ],
                  ),
                ),

              // Splash screen overlay saat loading pertama kali
              if (_isLoading && _loadProgress == 0)
                Container(
                  color: const Color(0xFF0A0A0F),
                  child: Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 80,
                          height: 80,
                          alignment: Alignment.center,
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [
                                Color(0xFF7C3AED),
                                Color(0xFFEC4899),
                              ],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            borderRadius: BorderRadius.circular(22),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFF7C3AED).withValues(alpha: 0.3),
                                blurRadius: 30,
                                spreadRadius: 5,
                              ),
                            ],
                          ),
                          child: const Text(
                            'C',
                            style: TextStyle(
                              fontSize: 38,
                              fontWeight: FontWeight.w800,
                              color: Colors.white,
                            ),
                          ),
                        ),
                        const SizedBox(height: 24),
                        const Text(
                          'COMIKA',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                            letterSpacing: 2,
                          ),
                        ),
                        const SizedBox(height: 12),
                        const Text(
                          'Platform Komik & Webtoon Digital',
                          style: TextStyle(
                            fontSize: 13,
                            color: Color(0xFF9CA3AF),
                          ),
                        ),
                        const SizedBox(height: 32),
                        SizedBox(
                          width: 200,
                          child: LinearProgressIndicator(
                            backgroundColor: const Color(0xFF1A1A2E),
                            valueColor: const AlwaysStoppedAnimation<Color>(
                              Color(0xFF7C3AED),
                            ),
                            minHeight: 3,
                            borderRadius: BorderRadius.circular(2),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

              // Error screen
              if (_hasError)
                Container(
                  color: const Color(0xFF0A0A0F),
                  child: Center(
                    child: Padding(
                      padding: const EdgeInsets.all(32),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 80,
                            height: 80,
                            decoration: BoxDecoration(
                              color: const Color(0xFF1A1A2E),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: const Icon(
                              Icons.wifi_off_rounded,
                              size: 40,
                              color: Color(0xFFEF4444),
                            ),
                          ),
                          const SizedBox(height: 24),
                          const Text(
                            'Gagal Memuat',
                            style: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.w700,
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            _errorMessage ?? 'Periksa koneksi internet kamu',
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              fontSize: 14,
                              color: Color(0xFF9CA3AF),
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            ConnectivityService.instance.isOnline
                                ? 'Aplikasi akan mencoba lagi otomatis saat koneksi pulih.'
                                : 'Tidak ada koneksi internet. Komik yang sudah didownload tetap bisa dibuka lewat Komik Offline setelah aplikasi pernah dimuat sebelumnya.',
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              fontSize: 12,
                              color: Color(0xFF6B7280),
                            ),
                          ),
                          const SizedBox(height: 24),
                          GestureDetector(
                            onTap: _retry,
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 32,
                                vertical: 12,
                              ),
                              decoration: BoxDecoration(
                                gradient: const LinearGradient(
                                  colors: [
                                    Color(0xFF7C3AED),
                                    Color(0xFFEC4899),
                                  ],
                                ),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Text(
                                'Coba Lagi',
                                style: TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w600,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(height: 16),
                          // Buka komik offline — tetap bisa dibaca tanpa internet
                          GestureDetector(
                            onTap: _openOfflineComics,
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 28,
                                vertical: 12,
                              ),
                              decoration: BoxDecoration(
                                border: Border.all(
                                  color: const Color(0xFF3B82F6),
                                ),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(
                                    Icons.bookmark_outline_rounded,
                                    size: 16,
                                    color: Color(0xFF3B82F6),
                                  ),
                                  SizedBox(width: 8),
                                  Text(
                                    'Buka Komik Offline',
                                    style: TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w600,
                                      color: Color(0xFF3B82F6),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
