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

  test('refund route owns one internal flow from transaction detail', () => {
    const detailSource = fs.readFileSync(
      path.join(process.cwd(), 'app/transaction/[id].tsx'),
      'utf8'
    );
    const refundSource = fs.readFileSync(
      path.join(process.cwd(), 'app/refund/[id].tsx'),
      'utf8'
    );

    expect(detailSource).toContain(
      'router.push(`/refund/${encodeURIComponent(transaction.id)}`)'
    );
    expect(refundSource).toContain('<RefundFlowScreen');
    expect(refundSource).toContain('useRef(');
    expect(refundSource).not.toContain('state.transactions[0]');
  });

  test('payment and refund routes use transparent modal presentation', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'app/_layout.tsx'),
      'utf8'
    );

    expect(source).toContain('name="payment"');
    expect(source).toContain('name="refund/[id]"');
    expect(source.match(/presentation: 'transparentModal'/g)).toHaveLength(2);
    expect(source).toContain("backgroundColor: 'transparent'");
  });
});
