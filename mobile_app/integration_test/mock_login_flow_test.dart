import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';

import 'package:bumas_app/main.dart' as app;

Future<void> waitFor(
  WidgetTester tester,
  Finder finder, {
  Duration timeout = const Duration(seconds: 20),
}) async {
  final deadline = DateTime.now().add(timeout);
  while (DateTime.now().isBefore(deadline)) {
    await tester.pump(const Duration(milliseconds: 200));
    if (finder.evaluate().isNotEmpty) {
      return;
    }
  }
  throw TestFailure('Timeout waiting for: $finder');
}

Future<void> waitForText(
  WidgetTester tester,
  String text, {
  Duration timeout = const Duration(seconds: 20),
}) async {
  await waitFor(tester, find.text(text), timeout: timeout);
}

Future<void> selectMockRole(WidgetTester tester, String roleLabel) async {
  // Open dropdown.
  await tester.tap(find.byType(DropdownButtonFormField));
  await tester.pump(const Duration(milliseconds: 300));

  // Pick role from menu.
  await tester.tap(find.text(roleLabel).last);
  await tester.pump(const Duration(milliseconds: 300));
}

Future<void> mockLoginAndLogout(
  WidgetTester tester, {
  required String roleLabel,
  required String expectedTitle,
}) async {
  await waitForText(tester, 'Login BUMAS');
  await selectMockRole(tester, roleLabel);

  await tester.tap(find.text('Masuk (Mock)'));
  await tester.pump(const Duration(milliseconds: 300));

  await waitForText(tester, expectedTitle);

  await tester.tap(find.byTooltip('Logout'));
  await tester.pump(const Duration(milliseconds: 300));

  await waitForText(tester, 'Login BUMAS');
}

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('mock login routes by role and logout returns to login',
      (tester) async {
    await app.main();
    await tester.pump(const Duration(milliseconds: 300));

    await mockLoginAndLogout(
      tester,
      roleLabel: 'Admin',
      expectedTitle: 'Admin Dashboard',
    );

    await mockLoginAndLogout(
      tester,
      roleLabel: 'Warung',
      expectedTitle: 'Warung POS',
    );

    await mockLoginAndLogout(
      tester,
      roleLabel: 'Kurir',
      expectedTitle: 'Delivery Orders',
    );

    await mockLoginAndLogout(
      tester,
      roleLabel: 'Gudang',
      expectedTitle: 'Stock Overview',
    );
  });
}
