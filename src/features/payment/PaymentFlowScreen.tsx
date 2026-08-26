import React, { useReducer } from 'react';
import { useWindowDimensions } from 'react-native';
import { PaymentFlowShell } from '../../components/PaymentFlowShell';
import { usePosActions } from '../../state/PosContext';
import { CheckingScreen } from '../opening/CheckingScreen';
import { CashEntryScreen } from './CashEntryScreen';
import { PaymentConfirmationScreen } from './PaymentConfirmationScreen';
import { PaymentScreen } from './PaymentScreen';
import { PaymentSuccessScreen } from './PaymentSuccessScreen';
import { SplitPaymentScreen } from './SplitPaymentScreen';

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

const titles: Record<PaymentFlowStep, string> = {
  method: 'Pilih Pembayaran',
  cash: 'Pembayaran · Tunai',
  split: 'Pembayaran Terpisah',
  confirmation: 'Konfirmasi Pembayaran',
  checking: 'Memeriksa Pembayaran',
  success: 'Transaksi Berhasil',
};

export interface PaymentFlowScreenProps {
  onClose: () => void;
  width?: number;
  height?: number;
}

export function PaymentFlowScreen({
  onClose,
  width: customWidth,
  height: customHeight,
}: PaymentFlowScreenProps) {
  const dimensions = useWindowDimensions();
  const width = customWidth ?? dimensions.width;
  const height = customHeight ?? dimensions.height;
  const [state, dispatch] = useReducer(paymentFlowReducer, initialPaymentFlowState);
  const actions = usePosActions();

  const pushStep = (step: PaymentFlowStep) =>
    dispatch({ type: 'PUSH_STEP', step });
  const goBack = () => dispatch({ type: 'BACK' });
  const finishChecking = () =>
    dispatch({ type: 'REPLACE_STEP', step: 'success' });
  const handleClose = () => {
    if (state.step === 'success') actions.resetSession();
    onClose();
  };

  let content: React.ReactNode;
  switch (state.step) {
    case 'method':
      content = (
        <PaymentScreen
          showHeader={false}
          width={width}
          height={height}
          onProceedToCash={() => pushStep('cash')}
          onProceedToSplit={() => pushStep('split')}
          onProceedToConfirmation={() => pushStep('confirmation')}
        />
      );
      break;
    case 'cash':
      content = (
        <CashEntryScreen
          showHeader={false}
          width={width}
          height={height}
          onComplete={() => pushStep('checking')}
        />
      );
      break;
    case 'split':
      content = (
        <SplitPaymentScreen
          showHeader={false}
          width={width}
          height={height}
          allocations={state.allocations}
          onChangeAllocation={(methodId, amount) =>
            dispatch({ type: 'SET_ALLOCATION', methodId, amount })
          }
          onComplete={() => pushStep('checking')}
        />
      );
      break;
    case 'confirmation':
      content = (
        <PaymentConfirmationScreen
          onBack={goBack}
          onConfirm={() => pushStep('checking')}
        />
      );
      break;
    case 'checking':
      content = (
        <CheckingScreen
          type="payment"
          durationMs={2000}
          onCancel={goBack}
          onComplete={finishChecking}
        />
      );
      break;
    case 'success':
      content = (
        <PaymentSuccessScreen
          showHeader={false}
          onNewTransaction={onClose}
        />
      );
      break;
  }

  return (
    <PaymentFlowShell
      title={titles[state.step]}
      canGoBack={true}
      onBack={state.history.length > 0 ? goBack : onClose}
      onClose={handleClose}
      width={width}
      height={height}
    >
      {content}
    </PaymentFlowShell>
  );
}
