import React, { useMemo, useReducer } from 'react';
import { useWindowDimensions } from 'react-native';
import { PaymentFlowShell } from '../../components/PaymentFlowShell';
import { usePosActions } from '../../state/PosContext';
import type { Transaction } from '../../types';
import { CheckingScreen } from '../opening/CheckingScreen';
import { RefundConfirmationScreen } from './RefundConfirmationScreen';
import { RefundItemSelection } from './RefundItemSelection';
import { RefundMethodScreen } from './RefundMethodScreen';
import { RefundReasonScreen } from './RefundReasonScreen';
import { RefundSuccessScreen } from './RefundSuccessScreen';
import {
  calculateRefundSummary,
  createInitialRefundFlowState,
  refundFlowReducer,
  resolveRefundReason,
  type RefundFlowStep,
} from './refundFlow';

const titles: Record<RefundFlowStep, string> = {
  items: 'Pilih Item Pengembalian',
  reason: 'Alasan Pengembalian',
  method: 'Metode Pengembalian',
  confirmation: 'Konfirmasi Pengembalian',
  checking: 'Memproses Pengembalian',
  success: 'Pengembalian Berhasil',
};

export interface RefundFlowScreenProps {
  transaction: Transaction;
  onClose: () => void;
  width?: number;
  height?: number;
}

export function RefundFlowScreen({
  transaction,
  onClose,
  width: customWidth,
  height: customHeight,
}: RefundFlowScreenProps) {
  const dimensions = useWindowDimensions();
  const width = customWidth ?? dimensions.width;
  const height = customHeight ?? dimensions.height;
  const [state, dispatch] = useReducer(
    refundFlowReducer,
    transaction,
    createInitialRefundFlowState
  );
  const actions = usePosActions();
  const summary = useMemo(
    () => calculateRefundSummary(transaction, state.quantities),
    [state.quantities, transaction]
  );
  const reason = resolveRefundReason(state.reasonCode, state.note);

  const pushStep = (step: RefundFlowStep) =>
    dispatch({ type: 'PUSH_STEP', step });
  const goBack = () => dispatch({ type: 'BACK' });
  const handleCompleteChecking = () => {
    if (!reason || summary.quantity === 0) return;
    actions.completeRefund({
      transactionId: transaction.id,
      lines: summary.lines,
      reason,
      method: state.method,
    });
    dispatch({ type: 'REPLACE_STEP', step: 'success' });
  };

  let content: React.ReactNode;
  switch (state.step) {
    case 'items':
      content = (
        <RefundItemSelection
          transaction={transaction}
          quantities={state.quantities}
          onSelectAll={() =>
            dispatch({ type: 'SELECT_ALL_REMAINING', transaction })
          }
          onChangeQuantity={(lineIndex, quantity) =>
            dispatch({
              type: 'SET_QUANTITY',
              transaction,
              lineIndex,
              quantity,
            })
          }
          onContinue={() => pushStep('reason')}
        />
      );
      break;
    case 'reason':
      content = (
        <RefundReasonScreen
          reasonCode={state.reasonCode}
          note={state.note}
          onSelect={(reasonCode) => dispatch({ type: 'SET_REASON', reasonCode })}
          onChangeNote={(note) => dispatch({ type: 'SET_NOTE', note })}
          onContinue={() => pushStep('method')}
        />
      );
      break;
    case 'method':
      content = (
        <RefundMethodScreen
          originalMethod={transaction.method}
          method={state.method}
          onSelect={(method) => dispatch({ type: 'SET_METHOD', method })}
          onContinue={() => pushStep('confirmation')}
        />
      );
      break;
    case 'confirmation':
      content = (
        <RefundConfirmationScreen
          transaction={transaction}
          summary={summary}
          reason={reason ?? ''}
          method={state.method}
          onConfirm={() => pushStep('checking')}
        />
      );
      break;
    case 'checking':
      content = (
        <CheckingScreen
          type="refund"
          referenceId={transaction.id}
          durationMs={1200}
          onCancel={goBack}
          onComplete={handleCompleteChecking}
        />
      );
      break;
    case 'success':
      content = (
        <RefundSuccessScreen
          total={summary.total}
          method={state.method}
          onClose={onClose}
        />
      );
      break;
  }

  return (
    <PaymentFlowShell
      title={titles[state.step]}
      canGoBack={state.history.length > 0 && state.step !== 'success'}
      onBack={goBack}
      onClose={onClose}
      width={width}
      height={height}
      flowLabel="pengembalian"
    >
      {content}
    </PaymentFlowShell>
  );
}
