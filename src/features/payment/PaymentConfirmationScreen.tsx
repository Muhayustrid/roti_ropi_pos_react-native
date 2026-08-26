import React from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Colors, Spacing, Typography } from '../../theme/tokens';
import { PosActionFooter } from '../../components/PosBars';
import { PosButton } from '../../components/PosButton';
import { PosPaddedCard, SpreadRow } from '../../components/PosCard';
import { samplePaymentMethods } from '../../mock/data';
import { usePosDerived, usePosState } from '../../state/PosContext';
import { formatRupiah } from '../../utils/money';

export interface PaymentConfirmationScreenProps {
  onBack: () => void;
  onConfirm: () => void;
}

export function PaymentConfirmationScreen({
  onBack,
  onConfirm,
}: PaymentConfirmationScreenProps) {
  const { width } = useWindowDimensions();
  const state = usePosState();
  const derived = usePosDerived();
  const method =
    samplePaymentMethods.find((option) => option.id === state.paymentMethod) ??
    samplePaymentMethods[0];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrapper}>
          <Text style={styles.subtitle}>
            Periksa detail sebelum mengonfirmasi transaksi.
          </Text>
          <PosPaddedCard style={styles.summaryCard}>
            <SpreadRow
              label="Total Tagihan"
              value={formatRupiah(derived.totals.total)}
              boldValue
              valueColor={Colors.BrandInk}
            />
            <SpreadRow label="Pelanggan" value={state.customer.name} />
            <SpreadRow label="Metode" value={method.label} />
            <SpreadRow
              label="Jumlah Item"
              value={`${derived.totals.itemCount} item`}
            />
          </PosPaddedCard>
        </View>
      </ScrollView>
      <PosActionFooter width={width}>
        <View style={styles.actions}>
          <PosButton
            label="Kembali"
            variant="Outline"
            onPress={onBack}
            style={styles.action}
          />
          <PosButton
            label="Konfirmasi Pembayaran"
            variant="Primary"
            onPress={onConfirm}
            style={styles.action}
          />
        </View>
      </PosActionFooter>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.Bg,
  },
  scrollContent: {
    padding: Spacing.s4,
    alignItems: 'center',
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 560,
  },
  subtitle: {
    ...Typography.Sm,
    color: Colors.Text2,
    marginBottom: Spacing.s3,
  },
  summaryCard: {
    backgroundColor: Colors.SurfaceAlt,
    borderWidth: 1,
    borderColor: Colors.Border,
    gap: Spacing.s2,
  },
  actions: {
    width: '100%',
    flexDirection: 'row',
    gap: Spacing.s2,
  },
  action: {
    flex: 1,
  },
});
