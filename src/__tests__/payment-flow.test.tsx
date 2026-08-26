import fs from 'node:fs';
import path from 'node:path';
import {
  getInitialPaymentSnap,
  getPaymentPresentation,
} from '../components/PaymentFlowShell';
import {
  initialPaymentFlowState,
  paymentFlowReducer,
} from '../features/payment/PaymentFlowScreen';

describe('payment flow state', () => {
  test('push, back, and replace preserve correct step history', () => {
    const cash = paymentFlowReducer(initialPaymentFlowState, {
      type: 'PUSH_STEP',
      step: 'cash',
    });
    expect(cash).toMatchObject({ step: 'cash', history: ['method'] });

    const checking = paymentFlowReducer(cash, {
      type: 'PUSH_STEP',
      step: 'checking',
    });
    const success = paymentFlowReducer(checking, {
      type: 'REPLACE_STEP',
      step: 'success',
    });
    expect(success).toMatchObject({
      step: 'success',
      history: ['method', 'cash'],
    });

    expect(paymentFlowReducer(success, { type: 'BACK' })).toMatchObject({
      step: 'cash',
      history: ['method'],
    });
  });

  test('split allocations survive internal navigation', () => {
    const allocated = paymentFlowReducer(initialPaymentFlowState, {
      type: 'SET_ALLOCATION',
      methodId: 'Cash',
      amount: 20000,
    });
    const split = paymentFlowReducer(allocated, {
      type: 'PUSH_STEP',
      step: 'split',
    });
    const checking = paymentFlowReducer(split, {
      type: 'PUSH_STEP',
      step: 'checking',
    });
    const back = paymentFlowReducer(checking, { type: 'BACK' });

    expect(back.allocations.Cash).toBe(20000);
  });
});

describe('payment presentation', () => {
  test.each([
    [411, 923, 'sheet', 'collapsed'],
    [923, 411, 'sheet', 'expanded'],
    [800, 600, 'fullscreen', 'expanded'],
    [1280, 800, 'fullscreen', 'expanded'],
  ] as const)(
    '%ix%i selects %s with %s initial snap',
    (width, height, presentation, snap) => {
      expect(getPaymentPresentation(width, height)).toBe(presentation);
      expect(getInitialPaymentSnap(width, height)).toBe(snap);
    }
  );

  test('payment shell isolates pan handlers from its content slot', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'src/components/PaymentFlowShell.tsx'),
      'utf8'
    );

    expect(source).toContain('<View {...panResponder.panHandlers}');
    expect(source).not.toMatch(/<Animated\.View[^>]*panResponder\.panHandlers/);
    expect(source).toContain('useNativeDriver: false');
  });

  test('payment sheet resets its snap when window dimensions change', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'src/components/PaymentFlowShell.tsx'),
      'utf8'
    );

    expect(source).toMatch(
      /useEffect\(\(\) => \{[\s\S]*setSnapState\(initialSnap\)[\s\S]*heightAnim\.setValue\(nextHeight\)/
    );
  });
});

test('complete payment flow is composed under one parent', () => {
  const source = fs.readFileSync(
    path.join(process.cwd(), 'src/features/payment/PaymentFlowScreen.tsx'),
    'utf8'
  );

  for (const component of [
    '<PaymentScreen',
    '<CashEntryScreen',
    '<SplitPaymentScreen',
    '<PaymentConfirmationScreen',
    '<CheckingScreen',
    '<PaymentSuccessScreen',
  ]) {
    expect(source).toContain(component);
  }
  expect(source).toContain("type: 'REPLACE_STEP', step: 'success'");
  expect(source).toContain('showHeader={false}');
});

test('success close resets session while incomplete close preserves it', () => {
  const source = fs.readFileSync(
    path.join(process.cwd(), 'src/features/payment/PaymentFlowScreen.tsx'),
    'utf8'
  );

  expect(source).toMatch(
    /if \(state\.step === 'success'\)[\s\S]*actions\.resetSession\(\)/
  );
  expect(source).not.toMatch(
    /const handleClose = \(\) => \{\s*actions\.resetSession\(\)/
  );
});
