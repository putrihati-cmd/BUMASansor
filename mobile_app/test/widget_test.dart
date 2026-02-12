import 'package:bumas_app/app.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('app builds', (tester) async {
    await tester.pumpWidget(const ProviderScope(child: BumasApp()));
    expect(find.byType(BumasApp), findsOneWidget);
  });
}
