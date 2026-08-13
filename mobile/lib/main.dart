import 'package:flutter/material.dart';

import 'core/theme/app_theme.dart';
import 'features/auth/presentation/login_screen.dart';
import 'main_shell.dart';
import 'services/auth_service.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const ComikaApp());
}

class ComikaApp extends StatelessWidget {
  const ComikaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'COMIKA',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.dark(),
      home: const AuthGate(),
    );
  }
}

/// Menentukan layar awal: MainShell jika sudah login, LoginScreen jika belum.
class AuthGate extends StatefulWidget {
  const AuthGate({super.key});

  @override
  State<AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends State<AuthGate> {
  @override
  void initState() {
    super.initState();
    AuthService.instance.init();
    AuthService.instance.addListener(_onAuthChanged);
  }

  @override
  void dispose() {
    AuthService.instance.removeListener(_onAuthChanged);
    super.dispose();
  }

  void _onAuthChanged() {
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    // MVP: tanpa penyimpanan token persisten, layar awal selalu login.
    return AuthService.instance.isLoggedIn ? const MainShell() : const LoginScreen();
  }
}
