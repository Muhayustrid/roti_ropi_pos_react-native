import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Colors, Typography, Spacing } from '../../theme/tokens';
import { PosCard } from '../../components/PosCard';
import { PosBadge } from '../../components/PosBadge';
import { PosIcon } from '../../components/PosIcon';
import { getWindowClass } from '../../utils/layout';
import { formatRupiah } from '../../utils/money';
import { usePosState, usePosDerived, usePosActions } from '../../state/PosContext';
import { useRouter } from 'expo-router';
import { TransactionDetail } from './TransactionDetail';
import type { HistoryFilterType, Transaction } from '../../types';

export interface HistoryScreenProps {
  onSelectTransaction?: (transaction: Transaction) => void;
  style?: StyleProp<ViewStyle>;
}

const FILTER_TABS: { key: HistoryFilterType; label: string }[] = [
  { key: 'All', label: 'Semua' },
  { key: 'Success', label: 'Berhasil' },
  { key: 'Refunded', label: 'Dikembalikan' },
  { key: 'Draft', label: 'Draf' },
];

export function HistoryScreen({ onSelectTransaction, style }: HistoryScreenProps) {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const windowClass = getWindowClass(width, height);
  const state = usePosState();
  const derived = usePosDerived();
  const actions = usePosActions();

  const handleSelect = (trx: Transaction) => {
    actions.selectTransaction(trx.id);
    onSelectTransaction?.(trx);
  };

  const renderItem = ({ item }: { item: Transaction }) => {
    const isSelected = item.id === state.selectedTransactionId;
    const isSuccess = item.status === 'Berhasil';
    const isRefunded =
      item.status === 'Dikembalikan' ||
      item.status === 'Dikembalikan Sebagian';
    const isDraft = item.status === 'Draf';

    return (
      <PosCard
        style={[
          styles.rowCard,
          windowClass.hasSidePane && isSelected && styles.selectedRowCard,
        ]}
        onPress={() => handleSelect(item)}
        accessibilityLabel={`Transaksi ${item.id}, ${item.status}, ${formatRupiah(item.total)}`}
      >
        <View style={styles.rowTop}>
          <View style={styles.rowLeft}>
            <Text style={styles.rowId}>{item.id}</Text>
            <Text style={styles.rowTime}>
              {item.date} · {item.time}
            </Text>
          </View>
          <View style={styles.rowRight}>
            <Text style={styles.rowTotal}>{formatRupiah(item.total)}</Text>
            <PosBadge
              label={item.status}
              variant={isSuccess ? 'Success' : isRefunded ? 'Danger' : 'Neutral'}
            />
          </View>
        </View>

        <View style={styles.rowBottom}>
          <Text style={styles.rowCustomer} numberOfLines={1}>
            {item.customerName} · {item.itemCount} item
          </Text>
          <Text
            style={[
              styles.rowMethod,
              isRefunded && styles.refundText,
              isDraft && styles.draftText,
            ]}
          >
            {isDraft
              ? 'Lanjutkan pesanan'
              : isRefunded
              ? item.refundMethod || 'Pengembalian Tunai'
              : item.method}
          </Text>
        </View>
      </PosCard>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {/* Filter Tabs Header */}
      <View style={styles.filterHeader}>
        <View style={styles.tabBar}>
          {FILTER_TABS.map((tab) => {
            const isActive = state.historyFilter === tab.key;
            return (
              <Pressable
                key={tab.key}
                style={[styles.tabButton, isActive && styles.activeTabButton]}
                onPress={() => actions.setHistoryFilter(tab.key)}
                accessible={true}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={`Filter ${tab.label}`}
              >
                <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
                  {tab.label}
                </Text>
                {isActive ? <View style={styles.activeIndicator} /> : null}
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Main Content Area: Master-Detail or Single List */}
      <View style={styles.contentRow}>
        <View
          style={[
            styles.listPane,
            windowClass.hasSidePane && {
              width: windowClass.isExpanded ? 380 : 320,
              borderRightWidth: 1,
              borderRightColor: Colors.Border,
            },
          ]}
        >
          <FlatList
            data={derived.visibleTransactions}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <PosIcon name="time" size={32} color={Colors.Text2} />
                <Text style={styles.emptyTitle}>Tidak ada transaksi</Text>
                <Text style={styles.emptySubtitle}>
                  Belum ada transaksi pada kategori filter ini.
                </Text>
              </View>
            }
          />
        </View>

        {/* Master Detail Side Pane */}
        {windowClass.hasSidePane ? (
          <View style={styles.detailPane}>
            {derived.selectedTransaction ? (
              <TransactionDetail
                transaction={derived.selectedTransaction}
                onRefund={() =>
                  derived.selectedTransaction &&
                  router.push(`/transaction/${encodeURIComponent(derived.selectedTransaction.id)}`)
                }
                onPrint={() => router.back()}
              />
            ) : (
              <View style={styles.emptyDetail}>
                <Text style={styles.emptyDetailText}>Pilih transaksi untuk melihat detail</Text>
              </View>
            )}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.Bg,
  },
  filterHeader: {
    backgroundColor: Colors.Surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.Border,
  },
  tabBar: {
    flexDirection: 'row',
    height: 48,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: 48,
  },
  activeTabButton: {},
  tabLabel: {
    ...Typography.SmMedium,
    color: Colors.Text2,
  },
  activeTabLabel: {
    ...Typography.SmSemi,
    color: Colors.BrandInk,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.Brand,
  },
  contentRow: {
    flex: 1,
    flexDirection: 'row',
  },
  listPane: {
    flex: 1,
  },
  listContent: {
    padding: Spacing.s4,
    gap: Spacing.s3,
  },
  rowCard: {
    padding: Spacing.s3,
    gap: Spacing.s2,
  },
  selectedRowCard: {
    borderColor: Colors.Brand,
    borderWidth: 2,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  rowLeft: {
    gap: 2,
  },
  rowId: {
    ...Typography.SmSemi,
    color: Colors.Text,
  },
  rowTime: {
    ...Typography.Xs,
    color: Colors.Text2,
  },
  rowRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  rowTotal: {
    ...Typography.SmSemi,
    color: Colors.Text,
  },
  rowBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.Border,
    paddingTop: Spacing.s2,
    marginTop: 2,
  },
  rowCustomer: {
    ...Typography.Xs,
    color: Colors.Text2,
    flex: 1,
    marginRight: Spacing.s2,
  },
  rowMethod: {
    ...Typography.XsSemi,
    color: Colors.Text2,
  },
  refundText: {
    color: Colors.DangerInk,
  },
  draftText: {
    color: Colors.BrandInk,
  },
  detailPane: {
    flex: 1,
    backgroundColor: Colors.Surface,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.s8,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: Spacing.s2,
  },
  emptyTitle: {
    ...Typography.MdSemi,
    color: Colors.Text,
    marginBottom: 4,
  },
  emptySubtitle: {
    ...Typography.Sm,
    color: Colors.Text2,
    textAlign: 'center',
  },
  emptyDetail: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.s6,
  },
  emptyDetailText: {
    ...Typography.SmMedium,
    color: Colors.Text2,
  },
});
