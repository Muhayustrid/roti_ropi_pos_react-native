import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PosButton } from '../../components/PosButton';
import { ToneIcon } from '../../components/PosCard';
import { PosIcon } from '../../components/PosIcon';
import { Colors, Spacing, Typography } from '../../theme/tokens';
import { formatRupiah } from '../../utils/money';

export interface RefundSuccessScreenProps {
  total: number;
  method: string;
  onClose: () => void;
}

export function RefundSuccessScreen({
  total,
  method,
  onClose,
}: RefundSuccessScreenProps) {
  return (
    <View style={styles.container}>
      <ToneIcon tone="Beverage" size={64}>
        <PosIcon name="check" size={32} color={Colors.SuccessInk} />
      </ToneIcon>
      <Text style={styles.title}>Pengembalian Berhasil</Text>
      <Text style={styles.total}>{formatRupiah(total)}</Text>
      <Text style={styles.method}>{method}</Text>
      <PosButton
        label="Kembali ke Detail"
        onPress={onClose}
        fullWidth
        accessibilityLabel="Kembali ke detail transaksi"
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.s6,
  },
  title: { ...Typography.Xl, color: Colors.Text, marginTop: Spacing.s4 },
  total: { ...Typography.Display, color: Colors.DangerInk, marginTop: Spacing.s3 },
  method: { ...Typography.Sm, color: Colors.Text2, marginTop: Spacing.s2 },
  button: { marginTop: Spacing.s6, maxWidth: 420 },
});
