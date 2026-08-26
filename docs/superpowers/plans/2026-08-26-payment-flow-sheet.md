# Payment Flow Sheet Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render the complete mock payment flow as one 75%/100% bottom sheet on compact and short-height layouts while preserving full-screen adaptive payment on usable tablet layouts.

**Architecture:** `/payment` becomes the sole main-flow route and renders `PaymentFlowScreen`, which owns internal step history and split allocations. A focused `PaymentFlowShell` chooses sheet or full-screen presentation, reusing shared bottom-sheet snap rules extracted from `PosCartSheet`; existing payment screens become embeddable by optionally hiding their own headers.

**Tech Stack:** Expo SDK 57, Expo Router, React Native 0.86, React 19, strict TypeScript, Jest with `ts-jest`, existing `Animated` and `PanResponder` APIs.

**Spec:** `docs/superpowers/specs/2026-08-26-payment-flow-sheet-design.md`

## Global Constraints

- Keep Phase 1 local/mock-only; add no backend, ERP integration, persistence, or settlement model.
- Add no dependency or native module.
- Keep minimum Android API 24.
- Keep minimum touch target `48dp` and minimum text `12sp`.
- Width `<700dp` opens sheet at `75%`.
- Width `>=700dp` with height `<600dp` opens sheet at `100%`.
- Width `>=700dp` with height `>=600dp` remains full-screen.
- Height animation must use `useNativeDriver: false`.
- Spring calls must use only `stiffness`, `damping`, and `mass` configuration family.
- Attach pan handlers only to drag/header area; never to scroll, input, keypad, or footer content.
- Preserve current uncommitted cart and stock fixes in `PosCartSheet.tsx`, `CashierScreen.tsx`, `ProductCard.tsx`, and their tests.
- Run Jest with `--modulePathIgnorePatterns '/\.claude/worktrees/'` while temporary worktrees remain under the repository.

## File Structure

- Create `src/utils/bottomSheet.ts`: shared pure snap state machine and spring constants.
- Create `src/components/PaymentFlowShell.tsx`: responsive full-screen/sheet presentation, header, backdrop, drag, and Android-back delegation.
- Create `src/features/payment/PaymentConfirmationScreen.tsx`: embedded QRIS/card confirmation content and sticky actions.
- Create `src/features/payment/PaymentFlowScreen.tsx`: internal step reducer, history, split allocation lifetime, checking transition, success reset/close behavior.
- Create `src/__tests__/payment-flow.test.tsx`: pure flow/snap/presentation tests plus source contracts for gesture and navigation ownership.
- Modify `src/components/PosCartSheet.tsx`: consume and re-export shared bottom-sheet rules without changing its approved 75%/100% behavior.
- Modify `src/features/payment/PaymentScreen.tsx`: optional header and internal confirmation callback; remove nested `ResponsiveModal` from main behavior.
- Modify `src/features/payment/CashEntryScreen.tsx`: optional header only.
- Modify `src/features/payment/SplitPaymentScreen.tsx`: optional header plus controlled allocations.
- Modify `src/features/payment/PaymentSuccessScreen.tsx`: optional header only.
- Modify `app/payment.tsx`: render `PaymentFlowScreen` and close via Expo Router.
- Modify `app/_layout.tsx`: present `/payment` as transparent modal route so cashier remains visible behind compact sheet.
- Modify `src/features/cashier/CashierScreen.tsx`: close cart sheet before pushing `/payment`.
- Modify `src/__mocks__/react-native.ts`: minimal `BackHandler` mock for flow component tests.
- Modify `src/__tests__/payment.test.tsx`, `src/__tests__/cart-sheet-snapping.test.ts`, and `src/__tests__/routing.test.ts`: update public contracts while retaining existing assertions.

---

### Task 1: Extract Shared Bottom-Sheet Snap Rules

**Files:**
- Create: `src/utils/bottomSheet.ts`
- Modify: `src/components/PosCartSheet.tsx:24-61`
- Modify: `src/__tests__/cart-sheet-snapping.test.ts:1-157`
- Test: `src/__tests__/cart-sheet-snapping.test.ts`

**Interfaces:**
- Produces: `SHEET_COLLAPSED_RATIO`, `SHEET_SPRING_CONFIG`, `SheetSnapState`, `SheetSnapAction`, and `resolveSheetSnap(currentState, gesture)`.
- Preserves: current `PosCartSheet` exports `SHEET_HEIGHT_COLLAPSED_RATIO`, `SPRING_CONFIG`, `SheetSnapState`, `SnapAction`, and `resolveCartSheetSnap` as aliases for existing callers/tests.

- [ ] **Step 1: Add failing generic snap tests**

Add imports and assertions to `src/__tests__/cart-sheet-snapping.test.ts`:

```ts
import {
  SHEET_COLLAPSED_RATIO,
  SHEET_SPRING_CONFIG,
  resolveSheetSnap,
} from '../utils/bottomSheet';

test('shared bottom sheet rules preserve 75% and 100% transitions', () => {
  expect(SHEET_COLLAPSED_RATIO).toBe(0.75);
  expect(resolveSheetSnap('collapsed', { dy: -60, vy: 0 })).toBe('expanded');
  expect(resolveSheetSnap('expanded', { dy: 60, vy: 0 })).toBe('collapsed');
  expect(resolveSheetSnap('collapsed', { dy: 70, vy: 0 })).toBe('dismiss');
  expect(Object.keys(SHEET_SPRING_CONFIG).sort()).toEqual([
    'damping',
    'mass',
    'stiffness',
  ]);
});
```

- [ ] **Step 2: Run test and verify RED**

Run:

```bash
npm test -- src/__tests__/cart-sheet-snapping.test.ts --runInBand --modulePathIgnorePatterns '/\.claude/worktrees/'
```

Expected: FAIL because `../utils/bottomSheet` does not exist.

- [ ] **Step 3: Implement shared pure rules**

Create `src/utils/bottomSheet.ts`:

```ts
export const SHEET_COLLAPSED_RATIO = 0.75;

export const SHEET_SPRING_CONFIG = {
  stiffness: 300,
  damping: 30,
  mass: 1,
};

export type SheetSnapState = 'collapsed' | 'expanded';
export type SheetSnapAction = SheetSnapState | 'dismiss';

export function resolveSheetSnap(
  currentState: SheetSnapState,
  gesture: { dy: number; vy?: number }
): SheetSnapAction {
  const velocityY = gesture.vy ?? 0;

  if (currentState === 'collapsed') {
    if (gesture.dy > 60 || velocityY > 0.8) return 'dismiss';
    if (gesture.dy < -50 || velocityY < -0.5) return 'expanded';
    return 'collapsed';
  }

  if (gesture.dy > 50 || velocityY > 0.5) return 'collapsed';
  return 'expanded';
}
```

Replace the duplicated declarations in `PosCartSheet.tsx` with imports and compatibility aliases:

```ts
import {
  SHEET_COLLAPSED_RATIO,
  SHEET_SPRING_CONFIG,
  resolveSheetSnap,
  type SheetSnapAction,
  type SheetSnapState as SharedSheetSnapState,
} from '../utils/bottomSheet';

export const SHEET_HEIGHT_COLLAPSED_RATIO = SHEET_COLLAPSED_RATIO;
export const SPRING_CONFIG = SHEET_SPRING_CONFIG;
export type SheetSnapState = SharedSheetSnapState;
export type SnapAction = SheetSnapAction;
export const resolveCartSheetSnap = resolveSheetSnap;
```

Do not alter cart rendering, backdrop, 75% height, full-height expansion, sticky footer, or gesture attachment.

- [ ] **Step 4: Run cart sheet test and verify GREEN**

Run the command from Step 2.

Expected: all `cart-sheet-snapping` tests PASS.

- [ ] **Step 5: Commit this isolated refactor**

```bash
git add src/utils/bottomSheet.ts src/components/PosCartSheet.tsx src/__tests__/cart-sheet-snapping.test.ts
git commit -m "refactor: share bottom sheet snap rules

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

Do not include unrelated modified files in this commit.

---

### Task 2: Build Payment Flow State and Responsive Shell

**Files:**
- Create: `src/components/PaymentFlowShell.tsx`
- Create: `src/features/payment/PaymentFlowScreen.tsx`
- Create: `src/__tests__/payment-flow.test.tsx`
- Modify: `src/__mocks__/react-native.ts:1-41`
- Test: `src/__tests__/payment-flow.test.tsx`

**Interfaces:**
- Produces `PaymentFlowStep = 'method' | 'cash' | 'split' | 'confirmation' | 'checking' | 'success'`.
- Produces `PaymentFlowState`, `PaymentFlowAction`, `initialPaymentFlowState`, and `paymentFlowReducer(state, action)`.
- Produces `getPaymentPresentation(width, height): 'sheet' | 'fullscreen'`.
- Produces `getInitialPaymentSnap(width, height): SheetSnapState`.
- Produces `PaymentFlowShell` props: `title`, `canGoBack`, `onBack`, `onClose`, optional `width`, optional `height`, and `children`.

- [ ] **Step 1: Write failing reducer and presentation tests**

Create `src/__tests__/payment-flow.test.tsx`:

```ts
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
});
```

- [ ] **Step 2: Run test and verify RED**

```bash
npm test -- src/__tests__/payment-flow.test.tsx --runInBand --modulePathIgnorePatterns '/\.claude/worktrees/'
```

Expected: FAIL because both new production modules are missing.

- [ ] **Step 3: Implement pure flow reducer**

At the top of new `src/features/payment/PaymentFlowScreen.tsx`, add:

```ts
export type PaymentFlowStep =
  | 'method'
  | 'cash'
  | 'split'
  | 'confirmation'
  | 'checking'
  | 'success';

export interface PaymentFlowState {
  step: PaymentFlowStep;
  history: PaymentFlowStep[];
  allocations: Record<string, number>;
}

export type PaymentFlowAction =
  | { type: 'PUSH_STEP'; step: PaymentFlowStep }
  | { type: 'REPLACE_STEP'; step: PaymentFlowStep }
  | { type: 'BACK' }
  | { type: 'SET_ALLOCATION'; methodId: string; amount: number };

export const initialPaymentFlowState: PaymentFlowState = {
  step: 'method',
  history: [],
  allocations: {},
};

export function paymentFlowReducer(
  state: PaymentFlowState,
  action: PaymentFlowAction
): PaymentFlowState {
  switch (action.type) {
    case 'PUSH_STEP':
      return { ...state, step: action.step, history: [...state.history, state.step] };
    case 'REPLACE_STEP':
      return { ...state, step: action.step };
    case 'BACK': {
      const previous = state.history[state.history.length - 1];
      if (!previous) return state;
      return {
        ...state,
        step: previous,
        history: state.history.slice(0, -1),
      };
    }
    case 'SET_ALLOCATION':
      return {
        ...state,
        allocations: {
          ...state.allocations,
          [action.methodId]: Math.max(0, action.amount),
        },
      };
  }
}
```

Leave component body as a minimal exported placeholder returning `null` only until Task 4; Task 4 replaces it before feature completion.

- [ ] **Step 4: Implement responsive shell**

Create `src/components/PaymentFlowShell.tsx` using existing React Native primitives and `PosTopBar`. Required pure helpers:

```ts
export type PaymentPresentation = 'sheet' | 'fullscreen';

export function getPaymentPresentation(
  width: number,
  height: number
): PaymentPresentation {
  return width >= 700 && height >= 600 ? 'fullscreen' : 'sheet';
}

export function getInitialPaymentSnap(
  width: number,
  height: number
): SheetSnapState {
  return width >= 700 && height < 600 ? 'expanded' : 'collapsed';
}
```

For full-screen, render `PosTopBar` and content in an opaque `flex: 1` container. For sheet:

- compute collapsed height as `windowHeight * SHEET_COLLAPSED_RATIO`;
- compute expanded height as full `windowHeight`;
- initialize `Animated.Value` from `getInitialPaymentSnap`;
- attach `PanResponder` only to header/drag wrapper;
- call `resolveSheetSnap` on release;
- animate dismiss to height `0`, then call `onClose`;
- render absolute backdrop before sheet;
- use `PosTopBar` with `onBack={canGoBack ? onBack : undefined}`;
- put a `48dp` close `Pressable` in `PosTopBar.trailing` with accessibility label `Tutup pembayaran`;
- label handle `Perbesar pembayaran` or `Kecilkan pembayaran` based on snap;
- use `SHEET_SPRING_CONFIG` and `useNativeDriver: false` for every spring;
- use `BackHandler.addEventListener('hardwareBackPress', ...)` to call `onBack` when `canGoBack`, otherwise `onClose`, always returning `true` while mounted.

Add this minimal mock to `src/__mocks__/react-native.ts`:

```ts
export const BackHandler = {
  addEventListener: () => ({ remove: () => {} }),
};
```

- [ ] **Step 5: Run test and verify GREEN**

Run the command from Step 2.

Expected: all payment-flow reducer and shell tests PASS.

- [ ] **Step 6: Commit state and shell**

```bash
git add src/components/PaymentFlowShell.tsx src/features/payment/PaymentFlowScreen.tsx src/__tests__/payment-flow.test.tsx src/__mocks__/react-native.ts
git commit -m "feat: add responsive payment flow shell

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Make Existing Payment Steps Embeddable

**Files:**
- Create: `src/features/payment/PaymentConfirmationScreen.tsx`
- Modify: `src/features/payment/PaymentScreen.tsx:23-228`
- Modify: `src/features/payment/CashEntryScreen.tsx:20-213`
- Modify: `src/features/payment/SplitPaymentScreen.tsx:22-170`
- Modify: `src/features/payment/PaymentSuccessScreen.tsx:16-73`
- Modify: `src/__tests__/payment.test.tsx:18-109`
- Test: `src/__tests__/payment.test.tsx`

**Interfaces:**
- `PaymentScreen` adds `showHeader?: boolean` and `onProceedToConfirmation?: () => void`; non-cash primary action calls the confirmation callback.
- `CashEntryScreen` adds `showHeader?: boolean`.
- `SplitPaymentScreen` adds `showHeader?: boolean`, `allocations?: Record<string, number>`, and `onChangeAllocation?: (methodId: string, amount: number) => void`.
- `PaymentSuccessScreen` adds `showHeader?: boolean`.
- `PaymentConfirmationScreen` consumes `onBack` and `onConfirm` callbacks.

- [ ] **Step 1: Add failing component contract tests**

Extend `src/__tests__/payment.test.tsx`:

```ts
import fs from 'node:fs';
import path from 'node:path';
import { PaymentConfirmationScreen } from '../features/payment/PaymentConfirmationScreen';

test('payment steps support flow-owned headers and confirmation', () => {
  expect(
    React.createElement(PaymentScreen, {
      showHeader: false,
      onProceedToCash: jest.fn(),
      onProceedToSplit: jest.fn(),
      onProceedToConfirmation: jest.fn(),
    })
  ).toBeDefined();
  expect(
    React.createElement(CashEntryScreen, { showHeader: false })
  ).toBeDefined();
  expect(
    React.createElement(SplitPaymentScreen, {
      showHeader: false,
      allocations: { Cash: 20000 },
      onChangeAllocation: jest.fn(),
    })
  ).toBeDefined();
  expect(
    React.createElement(PaymentSuccessScreen, { showHeader: false })
  ).toBeDefined();
  expect(
    React.createElement(PaymentConfirmationScreen, {
      onBack: jest.fn(),
      onConfirm: jest.fn(),
    })
  ).toBeDefined();
});

test('main payment selection no longer owns a nested ResponsiveModal', () => {
  const source = fs.readFileSync(
    path.join(process.cwd(), 'src/features/payment/PaymentScreen.tsx'),
    'utf8'
  );

  expect(source).not.toContain('<ResponsiveModal');
  expect(source).toContain('onProceedToConfirmation?.()');
});
```

- [ ] **Step 2: Run test and verify RED**

```bash
npm test -- src/__tests__/payment.test.tsx --runInBand --modulePathIgnorePatterns '/\.claude/worktrees/'
```

Expected: FAIL because `PaymentConfirmationScreen` and new props do not exist.

- [ ] **Step 3: Extract internal confirmation screen**

Create `PaymentConfirmationScreen.tsx` with the current confirmation copy and summary fields from `PaymentScreen`:

```ts
export interface PaymentConfirmationScreenProps {
  onBack: () => void;
  onConfirm: () => void;
}
```

Render a `ScrollView` with `Periksa detail sebelum mengonfirmasi transaksi.`, total, customer, selected method, and item count. Render a sticky `PosActionFooter` outside the scroll with `Kembali` and `Konfirmasi Pembayaran`. Do not render `ResponsiveModal` or `PosTopBar`.

- [ ] **Step 4: Add optional headers and controlled split state**

For each existing screen, default `showHeader = true` and wrap only its `PosTopBar`:

```tsx
{showHeader ? <PosTopBar ... /> : null}
```

In `PaymentScreen`, remove `confirmModalVisible`, `ResponsiveModal`, and modal JSX. Replace non-cash handling with:

```ts
if (selectedMethod === 'Cash') {
  onProceedToCash?.();
} else {
  onProceedToConfirmation?.();
}
```

In `SplitPaymentScreen`, retain local allocation fallback for legacy direct routes but prefer controlled values:

```ts
const [localAllocations, setLocalAllocations] = useState<Record<string, number>>(
  () => Object.fromEntries(samplePaymentMethods.map((method) => [method.id, 0]))
);
const currentAllocations = allocations ?? localAllocations;

const handleUpdateAllocation = (methodId: string, amount: number) => {
  const normalizedAmount = Math.max(0, amount);
  if (onChangeAllocation) {
    onChangeAllocation(methodId, normalizedAmount);
  } else {
    setLocalAllocations((previous) => ({
      ...previous,
      [methodId]: normalizedAmount,
    }));
  }
};
```

Use `currentAllocations` for rendering and settlement calculation.

- [ ] **Step 5: Run payment tests and verify GREEN**

Run the command from Step 2.

Expected: all payment tests PASS.

- [ ] **Step 6: Run TypeScript for interface consistency**

```bash
npx tsc --noEmit
```

Expected: exit `0`.

- [ ] **Step 7: Commit embedded payment steps**

```bash
git add src/features/payment/PaymentScreen.tsx src/features/payment/CashEntryScreen.tsx src/features/payment/SplitPaymentScreen.tsx src/features/payment/PaymentSuccessScreen.tsx src/features/payment/PaymentConfirmationScreen.tsx src/__tests__/payment.test.tsx
git commit -m "refactor: embed payment steps in flow

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: Wire Complete Internal Payment Flow

**Files:**
- Modify: `src/features/payment/PaymentFlowScreen.tsx`
- Modify: `src/__tests__/payment-flow.test.tsx`
- Test: `src/__tests__/payment-flow.test.tsx`

**Interfaces:**
- `PaymentFlowScreen` consumes `onClose: () => void`, optional `width`, and optional `height`.
- Uses `PaymentFlowShell`, `PaymentScreen`, `CashEntryScreen`, `SplitPaymentScreen`, `PaymentConfirmationScreen`, `CheckingScreen`, and `PaymentSuccessScreen`.
- Uses `REPLACE_STEP` for `checking` to `success`, preserving the previous actionable step in history.

- [ ] **Step 1: Add failing flow composition source contracts**

Append to `payment-flow.test.tsx`:

```ts
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
```

- [ ] **Step 2: Run test and verify RED**

Run:

```bash
npm test -- src/__tests__/payment-flow.test.tsx --runInBand --modulePathIgnorePatterns '/\.claude/worktrees/'
```

Expected: FAIL because `PaymentFlowScreen` still has placeholder component body.

- [ ] **Step 3: Implement flow composition**

Use `useReducer(paymentFlowReducer, initialPaymentFlowState)`, `useWindowDimensions`, and `usePosActions`.

Define exact transitions:

```ts
const pushStep = (step: PaymentFlowStep) =>
  dispatch({ type: 'PUSH_STEP', step });
const goBack = () => dispatch({ type: 'BACK' });
const finishChecking = () =>
  dispatch({ type: 'REPLACE_STEP', step: 'success' });
const handleClose = () => {
  if (state.step === 'success') actions.resetSession();
  onClose();
};
```

Map titles:

```ts
const titles: Record<PaymentFlowStep, string> = {
  method: 'Pilih Pembayaran',
  cash: 'Pembayaran · Tunai',
  split: 'Pembayaran Terpisah',
  confirmation: 'Konfirmasi Pembayaran',
  checking: 'Memeriksa Pembayaran',
  success: 'Transaksi Berhasil',
};
```

Render exactly one child for `state.step`:

- `method`: `PaymentScreen showHeader={false}`, cash/split/confirmation callbacks push their steps;
- `cash`: `CashEntryScreen showHeader={false}`, completion pushes checking;
- `split`: controlled `allocations={state.allocations}` and `onChangeAllocation` dispatch, completion pushes checking;
- `confirmation`: `PaymentConfirmationScreen onBack={goBack}`, confirm pushes checking;
- `checking`: `CheckingScreen type="payment" durationMs={2000}`, cancel calls `goBack`, completion replaces with success;
- `success`: `PaymentSuccessScreen showHeader={false}`, new transaction calls route `onClose` after its existing reset.

Wrap the active child in `PaymentFlowShell` with `canGoBack={state.history.length > 0}`, except the success screen still follows the same history rule approved in the spec.

- [ ] **Step 4: Run flow and payment tests**

```bash
npm test -- src/__tests__/payment-flow.test.tsx src/__tests__/payment.test.tsx --runInBand --modulePathIgnorePatterns '/\.claude/worktrees/'
```

Expected: both suites PASS.

- [ ] **Step 5: Commit complete internal flow**

```bash
git add src/features/payment/PaymentFlowScreen.tsx src/__tests__/payment-flow.test.tsx
git commit -m "feat: compose payment steps in one flow

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: Connect Route Overlay and Close Cart Before Checkout

**Files:**
- Modify: `app/payment.tsx:1-32`
- Modify: `app/_layout.tsx:1-12`
- Modify: `src/features/cashier/CashierScreen.tsx:62-69`
- Modify: `src/__tests__/routing.test.ts:1-14`
- Modify: `src/__tests__/cashier-cart.test.tsx:140-160`
- Test: `src/__tests__/routing.test.ts`
- Test: `src/__tests__/cashier-cart.test.tsx`

**Interfaces:**
- `/payment` remains the public checkout route.
- `PaymentRoute` renders `PaymentFlowScreen onClose={...}`.
- Route close uses `router.dismissTo('/(pos)')`, which dismisses to cashier when present and navigates there when payment was opened directly.

- [ ] **Step 1: Add failing route and cart-close tests**

Extend `routing.test.ts`:

```ts
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
```

Extend `cashier-cart.test.tsx`:

```ts
test('checkout closes cart sheet before opening payment', () => {
  const source = fs.readFileSync(
    path.join(process.cwd(), 'src/features/cashier/CashierScreen.tsx'),
    'utf8'
  );
  const checkoutHandler = source.match(
    /const handleCheckout = useCallback\(\(\) => \{([\s\S]*?)\n\s*\}, \[onCheckout, router\]\);/
  )?.[1];

  expect(checkoutHandler).toContain('setCartSheetVisible(false)');
  expect(checkoutHandler).toContain("router.push('/payment')");
});
```

- [ ] **Step 2: Run tests and verify RED**

```bash
npm test -- src/__tests__/routing.test.ts src/__tests__/cashier-cart.test.tsx --runInBand --modulePathIgnorePatterns '/\.claude/worktrees/'
```

Expected: FAIL because route still pushes separate payment routes, root stack is opaque, and checkout does not close `cartSheetVisible`.

- [ ] **Step 3: Replace payment route adapter**

Use:

```tsx
import React from 'react';
import { useRouter } from 'expo-router';
import { PaymentFlowScreen } from '../src/features/payment/PaymentFlowScreen';

export default function PaymentRoute() {
  const router = useRouter();
  return (
    <PaymentFlowScreen onClose={() => router.dismissTo('/(pos)')} />
  );
}
```

- [ ] **Step 4: Configure transparent payment route**

Expand `app/_layout.tsx` stack:

```tsx
<Stack screenOptions={{ headerShown: false }}>
  <Stack.Screen
    name="payment"
    options={{
      presentation: 'transparentModal',
      animation: 'none',
      contentStyle: { backgroundColor: 'transparent' },
    }}
  />
</Stack>
```

The full-screen branch of `PaymentFlowShell` must paint `Colors.Bg` explicitly.

- [ ] **Step 5: Close cart sheet on checkout**

At the start of `handleCheckout`:

```ts
setCartSheetVisible(false);
_setCartModalVisible(false);
```

Preserve the existing custom `onCheckout` branch and canonical `router.push('/payment')` branch.

- [ ] **Step 6: Run route and cashier tests and verify GREEN**

Run the command from Step 2.

Expected: both suites PASS.

- [ ] **Step 7: Run TypeScript**

```bash
npx tsc --noEmit
```

Expected: exit `0`, including Expo Router option and `dismissTo` types.

- [ ] **Step 8: Commit route integration**

```bash
git add app/payment.tsx app/_layout.tsx src/features/cashier/CashierScreen.tsx src/__tests__/routing.test.ts src/__tests__/cashier-cart.test.tsx
git commit -m "feat: open payment flow as responsive overlay

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: Verify Regression Coverage and Android Behavior

**Files:**
- Modify only if a verification failure exposes a requirement gap.
- Verify: all files changed in Tasks 1-5 plus existing cart/stock modifications.

**Interfaces:**
- No new interface. This task proves the full feature against the approved spec.

- [ ] **Step 1: Run focused payment, sheet, routing, and cashier tests**

```bash
npm test -- \
  src/__tests__/payment-flow.test.tsx \
  src/__tests__/payment.test.tsx \
  src/__tests__/cart-sheet-snapping.test.ts \
  src/__tests__/routing.test.ts \
  src/__tests__/cashier-cart.test.tsx \
  --runInBand \
  --modulePathIgnorePatterns '/\.claude/worktrees/'
```

Expected: all focused suites PASS with `0` failed tests.

- [ ] **Step 2: Run full automated checks**

```bash
npm test -- --runInBand --modulePathIgnorePatterns '/\.claude/worktrees/'
npx tsc --noEmit
npx eslint \
  app/_layout.tsx \
  app/payment.tsx \
  src/components/PaymentFlowShell.tsx \
  src/components/PosCartSheet.tsx \
  src/features/cashier/CashierScreen.tsx \
  src/features/cashier/ProductCard.tsx \
  src/features/payment/PaymentFlowScreen.tsx \
  src/features/payment/PaymentConfirmationScreen.tsx \
  src/features/payment/PaymentScreen.tsx \
  src/features/payment/CashEntryScreen.tsx \
  src/features/payment/SplitPaymentScreen.tsx \
  src/features/payment/PaymentSuccessScreen.tsx \
  src/utils/bottomSheet.ts \
  src/__tests__/payment-flow.test.tsx \
  src/__tests__/payment.test.tsx \
  src/__tests__/routing.test.ts \
  src/__tests__/cart-sheet-snapping.test.ts \
  src/__tests__/cashier-cart.test.tsx
git diff --check
```

Expected: every command exits `0`. Do not claim full repository lint if `.claude/worktrees` still causes unrelated duplicate-worktree lint failures; report changed-file lint exactly.

- [ ] **Step 3: Confirm Metro and Android connection**

Use the Android SDK binary if `adb` is not in `PATH`:

```bash
ADB="$HOME/Library/Android/sdk/platform-tools/adb"
curl -fsS http://localhost:8081/status
"$ADB" devices
"$ADB" reverse tcp:8081 tcp:8081
```

Expected: `packager-status:running`, one authorized emulator/device, and successful reverse command.

If Metro is not running, start the project command from `CLAUDE.md` in background before continuing:

```bash
NODE_ENV=development npx expo start --dev-client --lan --port 8081
```

- [ ] **Step 4: Manually verify compact flow at `411x923`**

Launch `com.rotiropi.pos`, add/open cart, press `Lanjut ke Pembayaran`, then verify:

1. cart sheet disappears before payment;
2. payment sheet opens at about `75%`;
3. tap backdrop closes to cashier without clearing cart;
4. reopen, drag to `100%`, drag back to `75%`, then dismiss downward;
5. QRIS/card confirmation appears inside the same sheet;
6. back returns one step and `X` exits entire flow;
7. cash keypad and scroll remain interactive;
8. split allocations remain after leaving and returning;
9. checking transitions to success inside the same sheet;
10. success `X` and `Transaksi Baru` reset and return to cashier.

Capture a screenshot at payment method, cash, checking, and success checkpoints. Inspect every screenshot for clipping, duplicate headers, blocked controls, and blank/opaque background.

- [ ] **Step 5: Manually verify short landscape at `923x411`**

Rotate or resize emulator, reopen payment, then verify:

1. sheet opens directly at `100%`;
2. header, scroll body, and sticky footer remain reachable;
3. cash keypad scrolls without dragging the sheet;
4. drag down reaches `75%`, another qualifying drag dismisses;
5. confirmation content and buttons are not clipped.

- [ ] **Step 6: Manually verify expanded tablet at `1280x800`**

Verify:

1. payment renders full-screen without backdrop or drag handle;
2. payment methods keep three-column grid;
3. cash keeps two-pane layout;
4. header has back on nested steps and `X` on right;
5. all steps, checking, and success remain in the internal flow.

- [ ] **Step 7: Inspect runtime errors**

```bash
ADB="$HOME/Library/Android/sdk/platform-tools/adb"
"$ADB" logcat -d | grep -E 'Unable to load script|Could not connect|FATAL EXCEPTION|ReactNativeJS.*Error' || true
```

Expected: no new matching runtime error after manual flow.

- [ ] **Step 8: Final review against spec**

Re-read `docs/superpowers/specs/2026-08-26-payment-flow-sheet-design.md` and check each requirement against code and manual evidence. Fix only requirement gaps; rerun affected focused tests plus Steps 1-2 after any fix.

- [ ] **Step 9: Commit final verification adjustments, if any**

If Task 6 required source/test changes:

```bash
git add <only-files-changed-in-task-6>
git commit -m "test: cover payment flow sheet behavior

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

If no files changed, do not create an empty commit.
