import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { PosTopBar } from '../../components/PosBars';
import { PosButton } from '../../components/PosButton';
import { PosCard, SectionTitle, SpreadRow } from '../../components/PosCard';
import { PosIcon } from '../../components/PosIcon';
import { usePosState } from '../../state/PosContext';
import {
  Colors,
  Radius,
  Sizes,
  Spacing,
  Typography,
} from '../../theme/tokens';
import { getWindowClass } from '../../utils/layout';
import { formatRupiah } from '../../utils/money';
import {
  buildReport,
  REPORT_PERIODS,
  type ReportBucket,
  type ReportPeriod,
} from './report';

export interface ReportScreenProps {
  onBack?: () => void;
}

export function ReportScreen({ onBack }: ReportScreenProps) {
  const { width, height } = useWindowDimensions();
  const windowClass = getWindowClass(width, height);
  const { transactions, printerSettings } = usePosState();
  const [period, setPeriod] = useState<ReportPeriod>('daily');
  const [isPrinting, setIsPrinting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const printTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const report = useMemo(
    () => buildReport(transactions, period),
    [period, transactions]
  );
  const dailyClosing = useMemo(
    () => buildReport(transactions, 'daily'),
    [transactions]
  );

  useEffect(() => {
    return () => {
      if (printTimer.current) clearTimeout(printTimer.current);
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    };
  }, []);

  const printClosing = () => {
    if (isPrinting) return;
    if (printTimer.current) clearTimeout(printTimer.current);
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    setFeedback(null);
    setIsPrinting(true);
    printTimer.current = setTimeout(() => {
      setIsPrinting(false);
      setFeedback(
        `Laporan closing berhasil dicetak (${printerSettings.copies}x, ${printerSettings.paperWidth})`
      );
      printTimer.current = null;
      feedbackTimer.current = setTimeout(() => {
        setFeedback(null);
        feedbackTimer.current = null;
      }, 2500);
    }, 1200);
  };

  const metrics = [
    {
      label: 'Penjualan Bersih',
      value: formatRupiah(report.netSales),
      color: Colors.BrandInk,
    },
    {
      label: 'Transaksi Berhasil',
      value: `${report.successfulTransactions}`,
      color: Colors.SuccessInk,
    },
    {
      label: 'Total Refund',
      value: formatRupiah(report.refundTotal),
      color: Colors.DangerInk,
    },
    {
      label: 'Rata-rata Transaksi',
      value: formatRupiah(report.averageTransaction),
      color: Colors.Text,
    },
  ];

  return (
    <View style={styles.container}>
      <PosTopBar title="Laporan" onBack={onBack} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <PosCard style={styles.filterCard}>
            <Text style={styles.filterTitle}>Periode Laporan</Text>
            <View style={styles.periodRow}>
              {REPORT_PERIODS.map((option) => {
                const selected = period === option.key;
                return (
                  <Pressable
                    key={option.key}
                    onPress={() => setPeriod(option.key)}
                    accessibilityRole="button"
                    accessibilityLabel={`Tampilkan laporan ${option.label.toLowerCase()}`}
                    accessibilityState={{ selected }}
                    style={({ pressed }) => [
                      styles.periodButton,
                      selected && styles.periodButtonSelected,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.periodText,
                        selected && styles.periodTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.rangeLabel}>{report.rangeLabel}</Text>
          </PosCard>

          <View style={styles.metricGrid}>
            {metrics.map((metric) => (
              <PosCard
                key={metric.label}
                style={[
                  styles.metricCard,
                  windowClass.isExpanded && styles.metricCardExpanded,
                ]}
              >
                <Text style={styles.metricLabel}>{metric.label}</Text>
                <Text style={[styles.metricValue, { color: metric.color }]}>
                  {metric.value}
                </Text>
              </PosCard>
            ))}
          </View>

          <PosCard style={styles.sectionCard}>
            <SectionTitle title="Tren Omzet" />
            <RevenueChart buckets={report.buckets} />
          </PosCard>

          <View
            style={[
              styles.breakdownGrid,
              windowClass.hasSideRail && styles.breakdownGridExpanded,
            ]}
          >
            <PosCard style={styles.breakdownCard}>
              <SectionTitle title="Metode Pembayaran" />
              {report.paymentMethods.length > 0 ? (
                report.paymentMethods.map((method) => (
                  <SpreadRow
                    key={method.label}
                    label={method.label}
                    value={formatRupiah(method.value)}
                  />
                ))
              ) : (
                <EmptyText text="Belum ada pembayaran pada periode ini" />
              )}
            </PosCard>

            <PosCard style={styles.breakdownCard}>
              <SectionTitle title="Produk Terlaris" />
              {report.topProducts.length > 0 ? (
                report.topProducts.map((product, index) => (
                  <View key={product.name} style={styles.productRow}>
                    <Text style={styles.productName}>
                      {index + 1}. {product.name}
                    </Text>
                    <Text style={styles.productQuantity}>
                      {product.quantity} item
                    </Text>
                  </View>
                ))
              ) : (
                <EmptyText text="Belum ada produk pada periode ini" />
              )}
            </PosCard>
          </View>

          <PosCard style={styles.closingCard}>
            <View style={styles.closingHeader}>
              <View style={styles.closingIcon}>
                <PosIcon name="draft" size={22} color={Colors.BrandInk} />
              </View>
              <View style={styles.closingInfo}>
                <Text style={styles.closingTitle}>Laporan Closing Harian</Text>
                <Text style={styles.closingDescription}>
                  Closing {dailyClosing.rangeLabel} · {formatRupiah(dailyClosing.netSales)}
                </Text>
              </View>
            </View>
            <PosButton
              label="Cetak Laporan Closing"
              onPress={printClosing}
              loading={isPrinting}
              disabled={isPrinting}
              fullWidth
              leading={
                <PosIcon name="draft" size={20} color={Colors.OnFill} />
              }
              accessibilityLabel="Cetak laporan closing harian"
            />
            {isPrinting ? (
              <Text style={styles.printingText} accessibilityLiveRegion="polite">
                Mencetak laporan…
              </Text>
            ) : null}
            {feedback ? (
              <View style={styles.feedback} accessibilityLiveRegion="polite">
                <Text style={styles.feedbackText}>{feedback}</Text>
              </View>
            ) : null}
          </PosCard>
        </View>
      </ScrollView>
    </View>
  );
}

function RevenueChart({ buckets }: { buckets: ReportBucket[] }) {
  const maxValue = Math.max(...buckets.map((bucket) => bucket.value), 1);
  const hasRevenue = buckets.some((bucket) => bucket.value > 0);

  if (!hasRevenue) {
    return <EmptyText text="Belum ada transaksi pada periode ini" />;
  }

  return (
    <View style={styles.chart}>
      {buckets.map((bucket) => (
        <View
          key={bucket.key}
          style={styles.barCell}
          accessible={true}
          accessibilityLabel={`${bucket.fullLabel}, ${formatRupiah(bucket.value)}`}
        >
          <Text style={styles.barValue}>{formatCompactRupiah(bucket.value)}</Text>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.bar,
                { height: Math.max(4, Math.round((bucket.value / maxValue) * 112)) },
              ]}
            />
          </View>
          <Text style={styles.barLabel}>{bucket.label}</Text>
        </View>
      ))}
    </View>
  );
}

function EmptyText({ text }: { text: string }) {
  return <Text style={styles.emptyText}>{text}</Text>;
}

function formatCompactRupiah(value: number) {
  if (value >= 1_000_000) {
    return `Rp ${(value / 1_000_000).toFixed(1).replace('.', ',').replace(',0', '')}jt`;
  }
  if (value >= 1_000) return `Rp ${Math.round(value / 1_000)}rb`;
  return `Rp ${Math.round(value)}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.Bg,
  },
  scrollContent: {
    padding: Spacing.s4,
    paddingBottom: Spacing.s8,
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 980,
    gap: Spacing.s4,
  },
  filterCard: {
    padding: Spacing.s4,
    gap: Spacing.s3,
  },
  filterTitle: {
    ...Typography.MdSemi,
    color: Colors.Text,
  },
  periodRow: {
    flexDirection: 'row',
    gap: Spacing.s1,
  },
  periodButton: {
    flex: 1,
    minWidth: 0,
    minHeight: Sizes.touch,
    paddingHorizontal: Spacing.s1,
    borderWidth: 1,
    borderColor: Colors.Border,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodButtonSelected: {
    borderWidth: 2,
    borderColor: Colors.Brand,
    backgroundColor: Colors.BrandSoft,
  },
  periodText: {
    ...Typography.SmSemi,
    color: Colors.Text2,
    textAlign: 'center',
  },
  periodTextSelected: {
    color: Colors.BrandInk,
  },
  rangeLabel: {
    ...Typography.SmMedium,
    color: Colors.Text2,
    textAlign: 'center',
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.s3,
  },
  metricCard: {
    flexGrow: 1,
    flexBasis: '47%',
    minWidth: 0,
    padding: Spacing.s4,
    gap: Spacing.s1,
  },
  metricCardExpanded: {
    flexBasis: '22%',
  },
  metricLabel: {
    ...Typography.Sm,
    color: Colors.Text2,
  },
  metricValue: {
    ...Typography.Xl,
  },
  sectionCard: {
    padding: Spacing.s4,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.s1,
    paddingTop: Spacing.s2,
  },
  barCell: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
  },
  barValue: {
    ...Typography.XsMedium,
    color: Colors.Text2,
    textAlign: 'center',
    minHeight: 32,
  },
  barTrack: {
    height: 116,
    width: '62%',
    minWidth: 8,
    justifyContent: 'flex-end',
    backgroundColor: Colors.SurfaceAlt,
    borderRadius: Radius.sm,
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    backgroundColor: Colors.BrandFill,
    borderTopLeftRadius: Radius.sm,
    borderTopRightRadius: Radius.sm,
  },
  barLabel: {
    ...Typography.XsSemi,
    color: Colors.Text,
    textAlign: 'center',
    marginTop: Spacing.s2,
  },
  breakdownGrid: {
    gap: Spacing.s4,
  },
  breakdownGridExpanded: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  breakdownCard: {
    flex: 1,
    width: '100%',
    padding: Spacing.s4,
  },
  productRow: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.s3,
  },
  productName: {
    ...Typography.Sm,
    color: Colors.Text2,
    flex: 1,
  },
  productQuantity: {
    ...Typography.SmSemi,
    color: Colors.Text,
  },
  emptyText: {
    ...Typography.Sm,
    color: Colors.Text3,
    textAlign: 'center',
    paddingVertical: Spacing.s5,
  },
  closingCard: {
    padding: Spacing.s4,
    gap: Spacing.s3,
  },
  closingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s3,
  },
  closingIcon: {
    width: Sizes.touch,
    height: Sizes.touch,
    borderRadius: Radius.full,
    backgroundColor: Colors.BrandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closingInfo: {
    flex: 1,
  },
  closingTitle: {
    ...Typography.MdSemi,
    color: Colors.Text,
  },
  closingDescription: {
    ...Typography.Sm,
    color: Colors.Text2,
    marginTop: 2,
  },
  printingText: {
    ...Typography.SmMedium,
    color: Colors.BrandInk,
    textAlign: 'center',
  },
  feedback: {
    backgroundColor: Colors.SuccessSoft,
    borderRadius: Radius.md,
    padding: Spacing.s3,
  },
  feedbackText: {
    ...Typography.SmSemi,
    color: Colors.SuccessInk,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.78,
  },
});
