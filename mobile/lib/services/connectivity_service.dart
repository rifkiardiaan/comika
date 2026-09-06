import 'dart:async';
import 'dart:io';

/// Service untuk mendeteksi status koneksi internet.
/// Menggunakan Socket probe untuk cek koneksi tanpa dependency tambahan.
class ConnectivityService {
  ConnectivityService._();
  static final ConnectivityService instance = ConnectivityService._();

  final StreamController<bool> _controller = StreamController<bool>.broadcast();
  Timer? _timer;
  bool _isOnline = true;

  /// Stream yangemit true/false sesuai status online/offline.
  Stream<bool> get onStatusChanged => _controller.stream;

  /// Status online saat ini.
  bool get isOnline => _isOnline;

  /// Mulai monitoring koneksi setiap [interval].
  void startMonitoring({Duration interval = const Duration(seconds: 5)}) {
    _timer?.cancel();
    _timer = Timer.periodic(interval, (_) => _check());
    _check(); // Initial check
  }

  /// Stop monitoring.
  void stopMonitoring() {
    _timer?.cancel();
    _timer = null;
  }

  /// Cek koneksi internet sekali.
  Future<bool> check() async {
    await _check();
    return _isOnline;
  }

  Future<void> _check() async {
    try {
      final result = await InternetAddress.lookup('google.com')
          .timeout(const Duration(seconds: 3));
      final online = result.isNotEmpty && result[0].rawAddress.isNotEmpty;
      if (online != _isOnline) {
        _isOnline = online;
        _controller.add(online);
      }
    } catch (_) {
      if (_isOnline) {
        _isOnline = false;
        _controller.add(false);
      }
    }
  }

  void dispose() {
    _timer?.cancel();
    _controller.close();
  }
}
