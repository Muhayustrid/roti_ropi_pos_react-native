import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Colors, Radius, Typography, Spacing } from '../../theme/tokens';
import { PosCard, SpreadRow } from '../../components/PosCard';
import { PosButton } from '../../components/PosButton';
import { formatRupiah } from '../../utils/money';
import type { CartLine, CartTotals, Customer } from '../../types';

export interface ReceiptContentProps {
  transactionId?: string;
  date?: string;
  time?: string;
  cashierName?: string;
  outletName?: string;
  customer: Customer;
  cart: CartLine[];
  totals: CartTotals;
  paymentMethod: string;
  cashReceived?: number;
  change?: number;
  onPrint?: () => void;
  onNewTransaction?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function ReceiptContent({
  transactionId = '#TRX-9402',
  date = '24 Okt 2026',
  time = '14:20',
  cashierName = 'Siti Rahma',
  outletName = 'Roti Ropi Bakery',
  customer,
  cart,
  totals,
  paymentMethod,
  cashReceived,
  change = 0,
  onPrint,
  onNewTransaction,
  style,
}: ReceiptContentProps) {
  const [printStatus, setPrintStatus] = useState<string | null>(null);

  const handlePrint = () => {
    onPrint?.();
    setPrintStatus('Mencetak struk…');
    setTimeout(() => {
      setPrintStatus('Struk berhasil dicetak');
      setTimeout(() => {
        setPrintStatus(null);
      }, 2500);
    }, 1200);
  };

  const isCash = paymentMethod.toLowerCase().includes('tunai') || paymentMethod.toLowerCase().includes('cash');

  return (
    <View style={[styles.container, style]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <PosCard style={styles.receiptCard}>
          {/* Store Info Header */}
          <View style={styles.header}>
            <Text style={styles.storeName}>ROTI ROPI</Text>
            <Text style={styles.storeAddress}>{outletName}</Text>
            <Text style={styles.receiptMeta}>
              {date} · {time} · {cashierName}
            </Text>
            <Text style={styles.trxId}>{transactionId}</Text>
          </View>

          <View style={styles.dividerDashed} />

          {/* Customer */}
          <View style={styles.customerRow}>
            <Text style={styles.customerLabel}>Pelanggan:</Text>
            <Text style={styles.customerValue}>{customer.name}</Text>
          </View>

          <View style={styles.dividerDashed} />

          {/* Item List */}
          <View style={styles.itemsSection}>
            {cart.map((line, idx) => (
              <View key={`${line.product.id}-${idx}`} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {line.product.name}
                  </Text>
                  <Text style={styles.itemQtyPrice}>
                    {line.quantity} × {formatRupiah(line.product.price)}
                  </Text>
                </View>
                <Text style={styles.itemTotal}>
                  {formatRupiah(line.product.price * line.quantity)}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.dividerDashed} />

          {/* Totals Breakdown */}
          <View style={styles.totalsSection}>
            <SpreadRow label="Subtotal" value={formatRupiah(totals.subtotal)} />
            {totals.promoDiscount > 0 ? (
              <SpreadRow
                label="Promosi"
                value={`−${formatRupiah(totals.promoDiscount)}`}
                valueColor={Colors.SuccessInk}
              />
            ) : null}
            {totals.couponDiscount > 0 ? (
              <SpreadRow
                label="Kupon"
                value={`−${formatRupiah(totals.couponDiscount)}`}
                valueColor={Colors.SuccessInk}
              />
            ) : null}
            <SpreadRow label="Pajak (10%)" value={formatRupiah(totals.tax)} />
            <View style={styles.dividerSolid} />
            <SpreadRow
              label="Total"
              value={formatRupiah(totals.total)}
              boldValue
              valueColor={Colors.BrandInk}
            />
          </View>

          <View style={styles.dividerDashed} />

          {/* Payment Method Details */}
          <View style={styles.paymentSection}>
            <SpreadRow label="Metode" value={paymentMethod} />
            {isCash && cashReceived !== undefined ? (
              <>
                <SpreadRow label="Diterima" value={formatRupiah(cashReceived)} />
                <SpreadRow
                  label="Kembalian"
                  value={formatRupiah(change)}
                  boldValue
                  valueColor={Colors.Text}
                />
              </>
            ) : null}
          </View>

          <View style={styles.dividerDashed} />

          {/* Footer Thank You */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Terima kasih atas kunjungan Anda</Text>
            <Text style={styles.footerSubtext}>Simpan struk ini sebagai bukti pembayaran yang sah</Text>
          </View>
        </PosCard>

        {/* Print Feedback Notification */}
        {printStatus ? (
          <View style={styles.feedbackBox}>
            <Text style={styles.feedbackText}>{printStatus}</Text>
          </View>
        ) : null}

        {/* Action Buttons */}
        <View style={styles.actionsWrapper}>
          <PosButton
            label="Cetak Struk"
            variant="Outline"
            onPress={handlePrint}
            style={styles.printBtn}
            accessibilityLabel="Cetak struk transaksi"
          />
          {onNewTransaction ? (
            <PosButton
              label="Transaksi Baru"
              variant="Primary"
              onPress={onNewTransaction}
              style={styles.newTrxBtn}
              accessibilityLabel="Mulai transaksi baru"
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
    alignItems: 'center',
    paddingBottom: Spacing.s8,
  },
  receiptCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: Colors.Surface,
    borderRadius: Radius.lg,
    padding: Spacing.s4,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.s2,
  },
  storeName: {
    ...Typography.LgBold,
    color: Colors.Text,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  storeAddress: {
    ...Typography.Sm,
    color: Colors.Text2,
    marginBottom: 2,
  },
  receiptMeta: {
    ...Typography.Xs,
    color: Colors.Text2,
    marginBottom: 2,
  },
  trxId: {
    ...Typography.XsSemi,
    color: Colors.BrandInk,
  },
  dividerDashed: {
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
  customerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customerLabel: {
    ...Typography.Sm,
    color: Colors.Text2,
  },
  customerValue: {
    ...Typography.SmSemi,
    color: Colors.Text,
  },
  itemsSection: {
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
  totalsSection: {
    gap: 2,
  },
  paymentSection: {
    gap: 2,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.s2,
  },
  footerText: {
    ...Typography.SmMedium,
    color: Colors.Text,
    textAlign: 'center',
  },
  footerSubtext: {
    ...Typography.Xs,
    color: Colors.Text3,
    textAlign: 'center',
    marginTop: 2,
  },
  feedbackBox: {
    marginTop: Spacing.s3,
    paddingHorizontal: Spacing.s4,
    paddingVertical: Spacing.s2,
    backgroundColor: Colors.BrandSoft,
    borderRadius: Radius.full,
  },
  feedbackText: {
    ...Typography.SmSemi,
    color: Colors.BrandInk,
    textAlign: 'center',
  },
  actionsWrapper: {
    width: '100%',
    maxWidth: 380,
    marginTop: Spacing.s4,
    gap: Spacing.s3,
  },
  printBtn: {
    width: '100%',
  },
  newTrxBtn: {
    width: '100%',
  },
});
