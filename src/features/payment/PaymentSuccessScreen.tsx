import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Colors, Typography, Spacing } from '../../theme/tokens';
import { PosTopBar } from '../../components/PosBars';
import { PosIcon } from '../../components/PosIcon';
import { ReceiptContent } from './ReceiptContent';
import { usePosState, usePosDerived, usePosActions } from '../../state/PosContext';
import { samplePaymentMethods } from '../../mock/data';

export interface PaymentSuccessScreenProps {
  onNewTransaction?: () => void;
  showHeader?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function PaymentSuccessScreen({
  onNewTransaction,
  showHeader = true,
  style,
}: PaymentSuccessScreenProps) {
  const state = usePosState();
  const derived = usePosDerived();
  const actions = usePosActions();

  const handleStartNewTransaction = () => {
    actions.resetSession();
    onNewTransaction?.();
  };

  const selectedMethod = state.paymentMethod;
  const currentMethodOption =
    samplePaymentMethods.find((m) => m.id === selectedMethod) || samplePaymentMethods[0];

  return (
    <View style={[styles.container, style]}>
      {showHeader ? (
        <PosTopBar
          title="Transaksi Berhasil"
          onBack={handleStartNewTransaction}
          backIsClose
        />
      ) : null}

      {/* Success Hero Header */}
      <View style={styles.successHeader}>
        <View style={styles.successIconCircle}>
          <PosIcon name="check" size={32} color={Colors.SuccessInk} />
        </View>
        <Text style={styles.successTitle}>Pembayaran Diterima</Text>
        <Text style={styles.successSubtitle}>
          Transaksi telah berhasil diproses dan dicatat
        </Text>
      </View>

      {/* Canonical Receipt Content */}
      <View style={styles.receiptWrapper}>
        <ReceiptContent
          transactionId="#TRX-9402"
          date="24 Okt 2026"
          time="14:20"
          customer={state.customer}
          cart={state.cart}
          totals={derived.totals}
          paymentMethod={currentMethodOption.label}
          cashReceived={state.cashReceived}
          change={derived.change}
          onNewTransaction={handleStartNewTransaction}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.Bg,
  },
  successHeader: {
    alignItems: 'center',
    paddingVertical: Spacing.s4,
    backgroundColor: Colors.Surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.Border,
  },
  successIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.SuccessSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.s2,
  },
  successCheckEmoji: {
    fontSize: 28,
    color: Colors.SuccessInk,
    fontWeight: '700',
  },
  successTitle: {
    ...Typography.LgBold,
    color: Colors.Text,
    marginBottom: 2,
  },
  successSubtitle: {
    ...Typography.Sm,
    color: Colors.Text2,
    textAlign: 'center',
    paddingHorizontal: Spacing.s4,
  },
  receiptWrapper: {
    flex: 1,
  },
});
