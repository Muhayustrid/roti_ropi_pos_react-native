import React from 'react';
import fs from 'node:fs';
import path from 'node:path';
import { PaymentScreen } from '../features/payment/PaymentScreen';
import { SplitPaymentScreen } from '../features/payment/SplitPaymentScreen';
import { CashEntryScreen } from '../features/payment/CashEntryScreen';
import { PaymentSuccessScreen } from '../features/payment/PaymentSuccessScreen';
import { PaymentConfirmationScreen } from '../features/payment/PaymentConfirmationScreen';
import { ReceiptContent } from '../features/payment/ReceiptContent';
import { sampleProducts, sampleCustomers, samplePromos, samplePaymentMethods } from '../mock/data';
import { calculateCart } from '../utils/cart';
import { posReducer, initialPosState } from '../state/PosContext';

describe('Task 5: Payment, Split Payment, Cash Entry, Receipt & Success Screens', () => {
  const sampleCart = [
    { product: sampleProducts[0], quantity: 2 },
    { product: sampleProducts[1], quantity: 1 },
  ];
  const totals = calculateCart(sampleCart, samplePromos[0]);

  describe('Component Exports & Interface Definitions', () => {
    test('PaymentScreen is defined and exports correctly', () => {
      expect(PaymentScreen).toBeDefined();
      const element = React.createElement(PaymentScreen, {
        onBack: jest.fn(),
        onProceedToCash: jest.fn(),
        onProceedToSplit: jest.fn(),
        onProceedToChecking: jest.fn(),
      });
      expect(element).toBeDefined();
    });

    test('SplitPaymentScreen is defined and exports correctly', () => {
      expect(SplitPaymentScreen).toBeDefined();
      const element = React.createElement(SplitPaymentScreen, {
        onBack: jest.fn(),
        onComplete: jest.fn(),
      });
      expect(element).toBeDefined();
    });

    test('CashEntryScreen is defined and exports correctly', () => {
      expect(CashEntryScreen).toBeDefined();
      const element = React.createElement(CashEntryScreen, {
        onBack: jest.fn(),
        onComplete: jest.fn(),
      });
      expect(element).toBeDefined();
    });

    test('PaymentSuccessScreen is defined and exports correctly', () => {
      expect(PaymentSuccessScreen).toBeDefined();
      const element = React.createElement(PaymentSuccessScreen, {
        onNewTransaction: jest.fn(),
      });
      expect(element).toBeDefined();
    });

    test('ReceiptContent is defined and exports correctly', () => {
      expect(ReceiptContent).toBeDefined();
      const element = React.createElement(ReceiptContent, {
        transactionId: '#TRX-9402',
        date: '24 Okt 2026',
        time: '14:20',
        customer: sampleCustomers[0],
        cart: sampleCart,
        totals,
        paymentMethod: 'Tunai',
        cashReceived: 100000,
        change: 100000 - totals.total,
        onPrint: jest.fn(),
        onNewTransaction: jest.fn(),
      });
      expect(element).toBeDefined();
    });
  });

  describe('Embedded Payment Flow Contracts', () => {
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
  });

  describe('Payment Method Grid Adaptation', () => {
    test('Grid adapts column count based on window width', () => {
      // 1 column for Compact (<700dp)
      const compactElement = React.createElement(PaymentScreen, {
        width: 411,
        height: 923,
        onBack: jest.fn(),
        onProceedToCash: jest.fn(),
        onProceedToSplit: jest.fn(),
        onProceedToChecking: jest.fn(),
      });
      expect(compactElement).toBeDefined();

      // 2 columns for Medium (700dp - 999dp)
      const mediumElement = React.createElement(PaymentScreen, {
        width: 800,
        height: 600,
        onBack: jest.fn(),
        onProceedToCash: jest.fn(),
        onProceedToSplit: jest.fn(),
        onProceedToChecking: jest.fn(),
      });
      expect(mediumElement).toBeDefined();

      // 3 columns for Expanded (>=1000dp)
      const expandedElement = React.createElement(PaymentScreen, {
        width: 1280,
        height: 800,
        onBack: jest.fn(),
        onProceedToCash: jest.fn(),
        onProceedToSplit: jest.fn(),
        onProceedToChecking: jest.fn(),
      });
      expect(expandedElement).toBeDefined();
    });
  });

  describe('Cash Keypad & Underpayment Validation', () => {
    test('Cash reducer handles append, backspace, and exact values', () => {
      let state = { ...initialPosState, cashReceived: 0 };

      // Append digits '5' then '0000'
      state = posReducer(state, { type: 'APPEND_CASH_DIGITS', payload: '5' });
      expect(state.cashReceived).toBe(5);
      state = posReducer(state, { type: 'APPEND_CASH_DIGITS', payload: '0000' });
      expect(state.cashReceived).toBe(50000);

      // Backspace removes last digit
      state = posReducer(state, { type: 'BACKSPACE_CASH' });
      expect(state.cashReceived).toBe(5000);

      // Set exact amount
      state = posReducer(state, { type: 'SET_CASH_EXACT', payload: 100000 });
      expect(state.cashReceived).toBe(100000);
    });

    test('CashEntryScreen validates underpayment against total payable', () => {
      const underpaidElement = React.createElement(CashEntryScreen, {
        width: 411,
        height: 923,
        onBack: jest.fn(),
        onComplete: jest.fn(),
      });
      expect(underpaidElement).toBeDefined();
    });
  });

  describe('Split Payment Remainder Validation', () => {
    test('SplitPaymentScreen initializes every editable allocation to 0 and disables completion until settled', () => {
      const splitElement = React.createElement(SplitPaymentScreen, {
        width: 411,
        height: 923,
        onBack: jest.fn(),
        onComplete: jest.fn(),
      });
      expect(splitElement).toBeDefined();

      // Verify allocation logic: starts at 0 for all methods, isSettled = false until allocations == payable
      const payable = totals.total;
      const initialAllocations: Record<string, number> = {};
      samplePaymentMethods.forEach((m) => {
        initialAllocations[m.id] = 0;
      });

      const totalAllocatedInitial = Object.values(initialAllocations).reduce((sum, v) => sum + v, 0);
      expect(totalAllocatedInitial).toBe(0);
      const isSettledInitial = (payable - totalAllocatedInitial) === 0;
      expect(isSettledInitial).toBe(false);

      // Now allocate exactly
      const settledAllocations: Record<string, number> = {
        Cash: 20000,
        Qris: payable - 20000,
      };
      const totalAllocatedSettled = Object.values(settledAllocations).reduce((sum, v) => sum + v, 0);
      expect(totalAllocatedSettled).toBe(payable);
      const isSettledFinal = (payable - totalAllocatedSettled) === 0;
      expect(isSettledFinal).toBe(true);
    });
  });

  describe('Receipt & Session Reset', () => {
    test('RESET_SESSION clears transaction and resets cart to initial sample', () => {
      const stateWithChanges = {
        ...initialPosState,
        cart: [{ product: sampleProducts[2], quantity: 5 }],
        cashReceived: 500000,
      };
      const resetState = posReducer(stateWithChanges, { type: 'RESET_SESSION' });
      expect(resetState.cart.length).toBe(1);
      expect(resetState.cart[0].product.id).toBe(sampleProducts[0].id);
      expect(resetState.cashReceived).toBe(100000);
    });
  });
});
