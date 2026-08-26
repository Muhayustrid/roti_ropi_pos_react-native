import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { PosButton } from '../../components/PosButton';
import { PosCard, SpreadRow } from '../../components/PosCard';
import { Colors, Spacing, Typography } from '../../theme/tokens';
import { formatRupiah } from '../../utils/money';
import type { Transaction } from '../../types';
import type { RefundSummary } from './refundFlow';

export interface RefundConfirmationScreenProps {
  transaction: Transaction;
  summary: RefundSummary;
  reason: string;
  method: string;
  onConfirm: () => void;
}

export function RefundConfirmationScreen({
  transaction,
  summary,
  reason,
  method,
  onConfirm,
}: RefundConfirmationScreenProps) {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <PosCard style={styles.card}>
          <Text style={styles.title}>Item Dikembalikan</Text>
          {summary.lines.map((selection) => {
            const line = transaction.lines[selection.lineIndex];
            return (
              <SpreadRow
                key={selection.lineIndex}
                label={`${selection.quantity} × ${line.productName}`}
                value={formatRupiah(selection.quantity * line.price)}
              />
            );
          })}
        </PosCard>
        <PosCard style={styles.card}>
          <SpreadRow label="Subtotal" value={formatRupiah(summary.subtotal)} />
          <SpreadRow label="Pajak" value={formatRupiah(summary.tax)} />
          <SpreadRow
            label="Total Pengembalian"
            value={formatRupiah(summary.total)}
            valueColor={Colors.DangerInk}
            boldValue
          />
        </PosCard>
        <PosCard style={styles.card}>
          <SpreadRow label="Alasan" value={reason} />
          <SpreadRow label="Metode" value={method} />
        </PosCard>
      </ScrollView>
      <View style={styles.footer}>
        <PosButton
          label={`Proses ${formatRupiah(summary.total)}`}
          onPress={onConfirm}
          variant="Danger"
          fullWidth
          accessibilityLabel="Proses pengembalian"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.s4, gap: Spacing.s3 },
  card: { padding: Spacing.s4 },
  title: { ...Typography.MdSemi, color: Colors.Text, marginBottom: Spacing.s2 },
  footer: {
    padding: Spacing.s4,
    backgroundColor: Colors.Surface,
    borderTopWidth: 1,
    borderTopColor: Colors.Border,
  },
});
