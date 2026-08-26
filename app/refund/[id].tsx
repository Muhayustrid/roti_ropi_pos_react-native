import React, { useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PosButton } from '../../src/components/PosButton';
import { PosTopBar } from '../../src/components/PosBars';
import { RefundFlowScreen } from '../../src/features/refund/RefundFlowScreen';
import { usePosState } from '../../src/state/PosContext';
import { Colors, Spacing, Typography } from '../../src/theme/tokens';

export default function RefundRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const transaction = usePosState().transactions.find((item) => item.id === id);
  const initialTransaction = useRef(transaction).current;
  const canRefund =
    initialTransaction?.status === 'Berhasil' ||
    initialTransaction?.status === 'Dikembalikan Sebagian';

  if (initialTransaction && canRefund) {
    return (
      <RefundFlowScreen
        transaction={initialTransaction}
        onClose={() => router.back()}
      />
    );
  }

  return (
    <View style={styles.container}>
      <PosTopBar title="Pengembalian" onBack={() => router.back()} />
      <View style={styles.empty}>
        <Text style={styles.title}>
          {initialTransaction
            ? 'Transaksi tidak dapat dikembalikan'
            : 'Transaksi tidak ditemukan'}
        </Text>
        <PosButton label="Kembali" onPress={() => router.back()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.Bg },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.s4,
    padding: Spacing.s6,
  },
  title: { ...Typography.Lg, color: Colors.Text, textAlign: 'center' },
});
