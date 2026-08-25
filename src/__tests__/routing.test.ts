import fs from 'node:fs';
import path from 'node:path';

describe('Expo Router contracts', () => {
  test('cashier checkout uses the canonical payment route', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'src/features/cashier/CashierScreen.tsx'),
      'utf8'
    );

    expect(source).toContain("router.push('/payment')");
    expect(source).not.toContain("router.push('/(pos)/payment')");
  });
});
