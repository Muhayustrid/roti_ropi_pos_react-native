import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/theme/tokens';
import { PosBrandBar } from '../../src/components/PosBars';
import { PosNavigation, type PosNavTab } from '../../src/components/PosNavigation';
import { HistoryScreen } from '../../src/features/history/HistoryScreen';
import { getWindowClass } from '../../src/utils/layout';
import type { Transaction } from '../../src/types';

export default function HistoryRoute() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const windowClass = getWindowClass(width, height);

  const handleSelectTab = (tab: PosNavTab) => {
    if (tab === 'cashier') router.replace('/(pos)');
    else if (tab === 'history') router.replace('/(pos)/history');
    else if (tab === 'more') router.replace('/(pos)/more');
  };

  const handleSelectTransaction = (transaction: Transaction) => {
    // If not in two-pane mode (e.g. compact or short-landscape), navigate to detail route
    if (!windowClass.hasSidePane) {
      router.push(`/transaction/${encodeURIComponent(transaction.id)}`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainRow}>
        {windowClass.hasSideRail ? (
          <PosNavigation
            activeTab="history"
            onSelectTab={handleSelectTab}
            width={width}
            height={height}
          />
        ) : null}

        <View style={styles.content}>
          <PosBrandBar title="Riwayat Transaksi" />
          <HistoryScreen onSelectTransaction={handleSelectTransaction} />
        </View>
      </View>

      {windowClass.isCompact ? (
        <PosNavigation
          activeTab="history"
          onSelectTab={handleSelectTab}
          width={width}
          height={height}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.Bg,
  },
  mainRow: {
    flex: 1,
    flexDirection: 'row',
  },
  content: {
    flex: 1,
  },
});
