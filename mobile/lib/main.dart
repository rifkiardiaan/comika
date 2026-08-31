import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'screens/webview_screen.dart';
import 'services/api_service.dart';
import 'services/update_service.dart';
import 'screens/update_dialog.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  // Set status bar style
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.light,
    systemNavigationBarColor: Color(0xFF0A0A0F),
    systemNavigationBarIconBrightness: Brightness.light,
  ));

  // Force portrait orientation
  SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  runApp(const ComikaApp());
}

class ComikaApp extends StatefulWidget {
  const ComikaApp({super.key});

  @override
  State<ComikaApp> createState() => _ComikaAppState();
}

class _ComikaAppState extends State<ComikaApp> {
  @override
  void initState() {
    super.initState();
    _checkForUpdate();
  }

  /// Cek update di background — tidak blocking UI.
  Future<void> _checkForUpdate() async {
    // Tunggu sebentar agar splash screen tampil dulu
    await Future.delayed(const Duration(seconds: 3));

    if (!mounted) return;

    try {
      final updateInfo = await UpdateService.instance.checkForUpdate();
      if (updateInfo != null && mounted) {
        // Tampilkan dialog update (dari context yang valid)
        showUpdateDialog(context, updateInfo);
      }
    } catch (_) {
      // Abaikan error — update check tidak boleh crash app
    }
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'COMIKA',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        colorScheme: ColorScheme.dark(
          primary: const Color(0xFF7C3AED),
          secondary: const Color(0xFFEC4899),
          surface: const Color(0xFF0A0A0F),
        ),
        scaffoldBackgroundColor: const Color(0xFF0A0A0F),
        fontFamily: 'Inter',
      ),
      home: const WebViewScreen(),
    );
  }
}
