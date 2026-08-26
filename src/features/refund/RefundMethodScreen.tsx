import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PosButton } from '../../components/PosButton';
import { PosCard } from '../../components/PosCard';
import { Colors, Spacing, Typography } from '../../theme/tokens';

export interface RefundMethodScreenProps {
  originalMethod: string;
  method: string;
  onSelect: (method: string) => void;
  onContinue: () => void;
}

export function RefundMethodScreen({
  originalMethod,
  method,
  onSelect,
  onContinue,
}: RefundMethodScreenProps) {
  const methods = Array.from(
    new Set([`Pengembalian ${originalMethod}`, 'Pengembalian Tunai'])
  );

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.helper}>Default mengikuti metode pembayaran transaksi.</Text>
        {methods.map((option) => (
          <PosCard
            key={option}
            onPress={() => onSelect(option)}
            selected={method === option}
            accessibilityLabel={`Metode ${option}`}
            style={styles.methodCard}
          >
            <Text style={styles.methodLabel}>{option}</Text>
          </PosCard>
        ))}
      </View>
      <View style={styles.footer}>
        <PosButton label="Lanjutkan" onPress={onContinue} fullWidth />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between' },
  content: { padding: Spacing.s4, gap: Spacing.s3 },
  helper: { ...Typography.Sm, color: Colors.Text2 },
  methodCard: { padding: Spacing.s4, minHeight: 56, justifyContent: 'center' },
  methodLabel: { ...Typography.MdSemi, color: Colors.Text },
  footer: {
    padding: Spacing.s4,
    backgroundColor: Colors.Surface,
    borderTopWidth: 1,
    borderTopColor: Colors.Border,
  },
});
