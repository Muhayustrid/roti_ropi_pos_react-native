import type { Transaction } from '../../types';

export type RefundFlowStep =
  | 'items'
  | 'reason'
  | 'method'
  | 'confirmation'
  | 'checking'
  | 'success';

export type RefundReasonCode =
  | 'WrongOrder'
  | 'DamagedProduct'
  | 'CustomerChangedMind'
  | 'Other';

export interface RefundFlowState {
  step: RefundFlowStep;
  history: RefundFlowStep[];
  quantities: Record<number, number>;
  reasonCode: RefundReasonCode | null;
  note: string;
  method: string;
}

export type RefundFlowAction =
  | { type: 'PUSH_STEP'; step: RefundFlowStep }
  | { type: 'REPLACE_STEP'; step: RefundFlowStep }
  | { type: 'BACK' }
  | { type: 'SELECT_ALL_REMAINING'; transaction: Transaction }
  | {
      type: 'SET_QUANTITY';
      transaction: Transaction;
      lineIndex: number;
      quantity: number;
    }
  | { type: 'SET_REASON'; reasonCode: RefundReasonCode }
  | { type: 'SET_NOTE'; note: string }
  | { type: 'SET_METHOD'; method: string };

export interface RefundSummary {
  subtotal: number;
  tax: number;
  total: number;
  quantity: number;
  lines: Array<{ lineIndex: number; quantity: number }>;
}

const reasonLabels: Record<Exclude<RefundReasonCode, 'Other'>, string> = {
  WrongOrder: 'Salah pesanan',
  DamagedProduct: 'Produk rusak',
  CustomerChangedMind: 'Pelanggan berubah pikiran',
};

export function createInitialRefundFlowState(
  transaction: Transaction
): RefundFlowState {
  return {
    step: 'items',
    history: [],
    quantities: {},
    reasonCode: null,
    note: '',
    method: defaultRefundMethod(transaction.method),
  };
}

export function getRemainingQuantity(
  transaction: Transaction,
  lineIndex: number
): number {
  const line = transaction.lines[lineIndex];
  if (!line) return 0;
  const refunded = transaction.refundedLines?.[lineIndex]?.quantity ?? 0;
  return Math.max(0, line.quantity - refunded);
}

export function refundFlowReducer(
  state: RefundFlowState,
  action: RefundFlowAction
): RefundFlowState {
  switch (action.type) {
    case 'PUSH_STEP':
      return {
        ...state,
        step: action.step,
        history: [...state.history, state.step],
      };
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
    case 'SELECT_ALL_REMAINING':
      return {
        ...state,
        quantities: Object.fromEntries(
          action.transaction.lines
            .map((_, lineIndex) => [
              lineIndex,
              getRemainingQuantity(action.transaction, lineIndex),
            ])
            .filter(([, quantity]) => quantity > 0)
        ),
      };
    case 'SET_QUANTITY': {
      const remaining = getRemainingQuantity(action.transaction, action.lineIndex);
      const quantity = Math.min(Math.max(0, Math.floor(action.quantity)), remaining);
      return {
        ...state,
        quantities: { ...state.quantities, [action.lineIndex]: quantity },
      };
    }
    case 'SET_REASON':
      return { ...state, reasonCode: action.reasonCode };
    case 'SET_NOTE':
      return { ...state, note: action.note };
    case 'SET_METHOD':
      return { ...state, method: action.method };
  }
}

export function defaultRefundMethod(method: string): string {
  return method === 'Tunai' ? 'Pengembalian Tunai' : `Pengembalian ${method}`;
}

export function resolveRefundReason(
  reasonCode: RefundReasonCode | null,
  note: string
): string | null {
  if (!reasonCode) return null;
  if (reasonCode === 'Other') return note.trim() || null;
  return reasonLabels[reasonCode];
}

export function calculateRefundSummary(
  transaction: Transaction,
  quantities: Record<number, number>
): RefundSummary {
  const lines = transaction.lines.flatMap((line, lineIndex) => {
    const quantity = Math.min(
      Math.max(0, Math.floor(quantities[lineIndex] ?? 0)),
      getRemainingQuantity(transaction, lineIndex)
    );
    return quantity > 0 ? [{ lineIndex, quantity, price: line.price }] : [];
  });
  const subtotal = lines.reduce(
    (sum, line) => sum + line.quantity * line.price,
    0
  );
  const tax =
    transaction.subtotal > 0
      ? Math.round((transaction.tax * subtotal) / transaction.subtotal)
      : 0;

  return {
    subtotal,
    tax,
    total: Math.min(transaction.total, subtotal + tax),
    quantity: lines.reduce((sum, line) => sum + line.quantity, 0),
    lines: lines.map(({ lineIndex, quantity }) => ({ lineIndex, quantity })),
  };
}
