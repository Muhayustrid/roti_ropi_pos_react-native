import React from 'react';
import { Alert, View, StyleSheet, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Typography, Spacing } from '../../src/theme/tokens';
import { PosTopBar } from '../../src/components/PosBars';
import { TransactionDetail } from '../../src/features/history/TransactionDetail';
import { usePosState } from '../../src/state/PosContext';

export default function TransactionDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const state = usePosState();

  const transaction = state.transactions.find((t) => t.id === id) || state.transactions[0];

  const isDraft = transaction?.status === 'Draf';
  const title = isDraft ? 'Pesanan Draf' : 'Detail Transaksi';
  const handlePrint = () => {
    Alert.alert('Cetak Struk', 'Struk berhasil dikirim ke printer.');
  };

  return (
    <View style={styles.container}>
      <PosTopBar title={title} onBack={() => router.back()} />
      {transaction ? (
        <TransactionDetail
          transaction={transaction}
          onRefund={() =>
            router.push(`/refund/${encodeURIComponent(transaction.id)}`)
          }
          onResumeDraft={() => router.replace('/(pos)')}
          onPrint={handlePrint}
        />
      ) : (
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Transaksi tidak ditemukan</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.Bg,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.s6,
  },
  notFoundText: {
    ...Typography.SmMedium,
    color: Colors.Text2,
  },
});
