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

  test('payment route owns one internal flow and dismisses to cashier', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'app/payment.tsx'),
      'utf8'
    );

    expect(source).toContain('<PaymentFlowScreen');
    expect(source).toContain("router.dismissTo('/(pos)')");
    expect(source).not.toContain("router.push('/cash-entry')");
    expect(source).not.toContain("router.push('/split-payment')");
    expect(source).not.toContain("router.push('/checking?mode=payment')");
  });

  test('payment route uses transparent modal presentation', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'app/_layout.tsx'),
      'utf8'
    );

    expect(source).toContain('name="payment"');
    expect(source).toContain("presentation: 'transparentModal'");
    expect(source).toContain("backgroundColor: 'transparent'");
  });
});
