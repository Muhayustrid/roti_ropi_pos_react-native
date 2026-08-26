import fs from 'node:fs';
import path from 'node:path';
import { sampleTransactions } from '../mock/data';
import {
  calculateRefundSummary,
  createInitialRefundFlowState,
  defaultRefundMethod,
  refundFlowReducer,
  resolveRefundReason,
} from '../features/refund/refundFlow';

const transaction = sampleTransactions[0];

describe('refund flow state', () => {
  test('push, back, and replace preserve step history', () => {
    const initial = createInitialRefundFlowState(transaction);
    const reason = refundFlowReducer(initial, { type: 'PUSH_STEP', step: 'reason' });
    const checking = refundFlowReducer(reason, { type: 'PUSH_STEP', step: 'checking' });
    const success = refundFlowReducer(checking, {
      type: 'REPLACE_STEP',
      step: 'success',
    });

    expect(success).toMatchObject({
      step: 'success',
      history: ['items', 'reason'],
    });
    expect(refundFlowReducer(success, { type: 'BACK' })).toMatchObject({
      step: 'reason',
      history: ['items'],
    });
  });

  test('select all and quantity changes clamp to remaining quantities', () => {
    const initial = createInitialRefundFlowState(transaction);
    const all = refundFlowReducer(initial, {
      type: 'SELECT_ALL_REMAINING',
      transaction,
    });
    expect(all.quantities).toEqual({ 0: 2, 1: 3 });

    const clamped = refundFlowReducer(all, {
      type: 'SET_QUANTITY',
      transaction,
      lineIndex: 0,
      quantity: 99,
    });
    expect(clamped.quantities[0]).toBe(2);
  });

  test('reason note and method update without losing selection', () => {
    let state = createInitialRefundFlowState(transaction);
    state = refundFlowReducer(state, {
      type: 'SET_QUANTITY',
      transaction,
      lineIndex: 0,
      quantity: 1,
    });
    state = refundFlowReducer(state, { type: 'SET_REASON', reasonCode: 'Other' });
    state = refundFlowReducer(state, { type: 'SET_NOTE', note: ' Kemasan rusak ' });
    state = refundFlowReducer(state, {
      type: 'SET_METHOD',
      method: 'Pengembalian Tunai',
    });

    expect(state).toMatchObject({
      quantities: { 0: 1 },
      reasonCode: 'Other',
      note: ' Kemasan rusak ',
      method: 'Pengembalian Tunai',
    });
  });
});

describe('refund flow composition', () => {
  test('all steps live under one refund shell and mutate state after checking', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'src/features/refund/RefundFlowScreen.tsx'),
      'utf8'
    );

    for (const component of [
      '<RefundItemSelection',
      '<RefundReasonScreen',
      '<RefundMethodScreen',
      '<RefundConfirmationScreen',
      '<CheckingScreen',
      '<RefundSuccessScreen',
    ]) {
      expect(source).toContain(component);
    }
    expect(source).toContain('flowLabel="pengembalian"');
    expect(source).toContain('type="refund"');
    expect(source).toMatch(
      /handleCompleteChecking[\s\S]*actions\.completeRefund[\s\S]*REPLACE_STEP/
    );
  });
});

describe('refund calculations', () => {
  test('maps default methods and validates custom reason', () => {
    expect(defaultRefundMethod('QRIS')).toBe('Pengembalian QRIS');
    expect(defaultRefundMethod('Tunai')).toBe('Pengembalian Tunai');
    expect(resolveRefundReason('Other', '  Kemasan rusak  ')).toBe('Kemasan rusak');
    expect(resolveRefundReason('Other', '   ')).toBeNull();
    expect(resolveRefundReason('WrongOrder', '')).toBe('Salah pesanan');
  });

  test('calculates proportional tax and selected lines', () => {
    const summary = calculateRefundSummary(transaction, { 0: 1 });

    expect(summary).toEqual({
      subtotal: 12000,
      tax: 1200,
      total: 13200,
      quantity: 1,
      lines: [{ lineIndex: 0, quantity: 1 }],
    });
  });
});
