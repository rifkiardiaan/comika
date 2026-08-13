import 'package:flutter_test/flutter_test.dart';

import 'package:comika_mobile/main.dart';

void main() {
  testWidgets('COMIKA app renders login screen when logged out', (WidgetTester tester) async {
    await tester.pumpWidget(const ComikaApp());
    await tester.pump();

    // Belum login → layar login tampil
    expect(find.text('Selamat Datang Kembali'), findsOneWidget);
    expect(find.text('Masuk'), findsOneWidget);
  });
}
