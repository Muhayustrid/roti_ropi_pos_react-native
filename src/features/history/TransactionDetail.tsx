import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Colors, Typography, Spacing } from '../../theme/tokens';
import { PosCard, PosPaddedCard, SpreadRow, SectionTitle, ToneIcon } from '../../components/PosCard';
import { PosBadge } from '../../components/PosBadge';
import { PosBanner } from '../../components/PosBanner';
import { PosButton } from '../../components/PosButton';
import { PosIcon } from '../../components/PosIcon';
import { formatRupiah } from '../../utils/money';
import type { Transaction } from '../../types';

export interface TransactionDetailProps {
  transaction: Transaction;
  onRefund?: () => void;
  onResumeDraft?: () => void;
  onPrint?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function TransactionDetail({
  transaction,
  onRefund,
  onResumeDraft,
  onPrint,
  style,
}: TransactionDetailProps) {
  const isSuccess = transaction.status === 'Berhasil';
  const isRefunded = transaction.status === 'Dikembalikan';
  const isDraft = transaction.status === 'Draf';

  return (
    <View style={[styles.container, style]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Status Hero */}
        <View style={styles.heroSection}>
          <ToneIcon
            tone={isSuccess ? 'Bread' : isRefunded ? 'Cake' : 'Card'}
            size={56}
            style={styles.heroIcon}
          >
            <PosIcon
              name={isSuccess ? 'check' : isRefunded ? 'refund' : 'draft'}
              size={28}
              color={isSuccess ? Colors.BrandInk : isRefunded ? Colors.DangerInk : Colors.Text2}
            />
          </ToneIcon>

          <PosBadge
            label={transaction.status}
            variant={isSuccess ? 'Success' : isRefunded ? 'Danger' : 'Neutral'}
            style={styles.statusBadge}
          />

          <Text style={styles.trxId}>{transaction.id}</Text>
          <Text style={styles.trxDate}>
            {transaction.date} · {transaction.time}
          </Text>
        </View>

        {/* Draft Warning Banner */}
        {isDraft ? (
          <PosBanner
            variant="Warning"
            title="Belum dikirim atau dibayar"
            body="Lanjutkan pesanan ini untuk menyelesaikan pembayaran."
            style={styles.banner}
          />
        ) : null}

        {/* Refund Details Banner/Card */}
        {isRefunded ? (
          <PosCard style={styles.refundCard}>
            <Text style={styles.refundTitle}>Informasi Pengembalian</Text>
            {transaction.refundReason ? (
              <SpreadRow label="Alasan" value={transaction.refundReason} style={styles.detailRow} />
            ) : null}
            <SpreadRow
              label="Metode Pengembalian"
              value={transaction.refundMethod || 'Pengembalian Tunai'}
              style={styles.detailRow}
            />
            <SpreadRow
              label="Total Dikembalikan"
              value={formatRupiah(transaction.total)}
              valueColor={Colors.DangerInk}
              boldValue
              style={styles.detailRow}
            />
          </PosCard>
        ) : null}

        {/* Customer & Info Card */}
        <PosPaddedCard style={styles.infoCard}>
          <SpreadRow label="Pelanggan" value={transaction.customerName} />
          <SpreadRow label="Jumlah Item" value={`${transaction.itemCount} item`} />
          <SpreadRow label="Metode Pembayaran" value={transaction.method} />
          {!isDraft && !isRefunded ? (
            <SpreadRow
              label="Total Pembayaran"
              value={formatRupiah(transaction.total)}
              boldValue
              valueColor={Colors.BrandInk}
            />
          ) : null}
        </PosPaddedCard>

        {/* Items List Section */}
        <PosCard style={styles.itemsCard}>
          <SectionTitle
            title={
              isRefunded
                ? 'Item Dikembalikan'
                : isDraft
                ? 'Ringkasan Pesanan'
                : 'Item Pesanan'
            }
            style={styles.sectionTitle}
          />

          <View style={styles.itemList}>
            {transaction.lines.map((line, index) => (
              <View key={`${line.productName}-${index}`} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {line.productName}
                  </Text>
                  <Text style={styles.itemQtyPrice}>
                    {line.quantity} × {formatRupiah(line.price)}
                  </Text>
                </View>
                <Text style={styles.itemTotal}>
                  {formatRupiah(line.quantity * line.price)}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          {/* Breakdown Totals */}
          <View style={styles.totalsSection}>
            <SpreadRow label="Subtotal" value={formatRupiah(transaction.subtotal)} />
            <SpreadRow
              label={isDraft ? 'Perkiraan Pajak (10%)' : 'Pajak (10%)'}
              value={formatRupiah(transaction.tax)}
            />
            <View style={styles.dividerSolid} />
            <SpreadRow
              label={isRefunded ? 'Total Dikembalikan' : 'Total'}
              value={formatRupiah(transaction.total)}
              boldValue
              valueColor={isRefunded ? Colors.DangerInk : Colors.BrandInk}
            />
          </View>
        </PosCard>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {isSuccess && onRefund ? (
            <PosButton
              label="Mulai Pengembalian"
              variant="Outline"
              onPress={onRefund}
              fullWidth
              accessibilityLabel="Mulai pengembalian transaksi ini"
            />
          ) : null}

          {isDraft && onResumeDraft ? (
            <PosButton
              label="Lanjutkan Pesanan"
              variant="Primary"
              onPress={onResumeDraft}
              fullWidth
              accessibilityLabel="Lanjutkan pesanan draf ini"
            />
          ) : null}

          {isSuccess && onPrint ? (
            <PosButton
              label="Cetak Struk"
              variant="Outline"
              onPress={onPrint}
              fullWidth
              accessibilityLabel="Cetak struk transaksi"
            />
          ) : null}
        </View>
      </ScrollView>
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
    paddingBottom: Spacing.s8,
    gap: Spacing.s4,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: Spacing.s2,
  },
  heroIcon: {
    marginBottom: Spacing.s2,
  },
  heroIconText: {
    ...Typography.Xl,
  },
  statusBadge: {
    marginBottom: Spacing.s2,
  },
  trxId: {
    ...Typography.LgBold,
    color: Colors.Text,
    marginBottom: 2,
  },
  trxDate: {
    ...Typography.Sm,
    color: Colors.Text2,
  },
  banner: {
    width: '100%',
  },
  refundCard: {
    padding: Spacing.s4,
    backgroundColor: Colors.DangerSoft,
    borderColor: Colors.Danger,
    borderWidth: 1,
    gap: Spacing.s2,
  },
  refundTitle: {
    ...Typography.SmSemi,
    color: Colors.DangerInk,
    marginBottom: Spacing.s1,
  },
  detailRow: {
    marginVertical: 2,
  },
  infoCard: {
    gap: Spacing.s2,
  },
  itemsCard: {
    padding: Spacing.s4,
  },
  sectionTitle: {
    marginBottom: Spacing.s3,
  },
  itemList: {
    gap: Spacing.s2,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    marginRight: Spacing.s2,
  },
  itemName: {
    ...Typography.SmMedium,
    color: Colors.Text,
  },
  itemQtyPrice: {
    ...Typography.Xs,
    color: Colors.Text2,
  },
  itemTotal: {
    ...Typography.SmSemi,
    color: Colors.Text,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.Border,
    borderStyle: 'dashed',
    marginVertical: Spacing.s3,
  },
  dividerSolid: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.Border,
    marginVertical: Spacing.s2,
  },
  totalsSection: {
    gap: 2,
  },
  actionsContainer: {
    gap: Spacing.s3,
    marginTop: Spacing.s2,
  },
});
