import React from 'react';
import { useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { HistoryScreen } from '../../src/features/history/HistoryScreen';
import { getWindowClass } from '../../src/utils/layout';
import type { Transaction } from '../../src/types';

export default function HistoryRoute() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const windowClass = getWindowClass(width, height);

  const handleSelectTransaction = (transaction: Transaction) => {
    if (!windowClass.hasSidePane) {
      router.push(`/transaction/${encodeURIComponent(transaction.id)}`);
    }
  };

  return <HistoryScreen onSelectTransaction={handleSelectTransaction} />;
}
