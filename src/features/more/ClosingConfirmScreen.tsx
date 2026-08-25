import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Colors, Typography, Spacing } from '../../theme/tokens';
import { PosTopBar } from '../../components/PosBars';
import { PosBanner } from '../../components/PosBanner';
import { PosCard, PosPaddedCard, SpreadRow, SectionTitle } from '../../components/PosCard';
import { PosButton } from '../../components/PosButton';
import { formatRupiah, formatSignedRupiah } from '../../utils/money';
import { getWindowClass } from '../../utils/layout';
import { usePosState, usePosDerived } from '../../state/PosContext';
import { sampleSession } from '../../mock/data';

export interface ClosingConfirmScreenProps {
  onBack?: () => void;
  onConfirmClosing?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function ClosingConfirmScreen({
  onBack,
  onConfirmClosing,
  style,
}: ClosingConfirmScreenProps) {
  const { width, height } = useWindowDimensions();
  const windowClass = getWindowClass(width, height);
  const state = usePosState();
  const derived = usePosDerived();

  const isTwoUp = windowClass.isExpanded || (windowClass.isMedium && width >= 700);

  return (
    <View style={[styles.container, style]}>
      <PosTopBar title="Konfirmasi Penutupan" onBack={onBack} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.bodyWrapper}>
          {/* Warning Banner */}
          <PosBanner
            variant="Warning"
            title="Peringatan penutupan"
            body="Ini menutup sesi saat ini. Penjualan baru tidak dapat ditambahkan setelahnya."
            style={styles.banner}
          />

          {/* Two-Up: Session Info & Collected Summary */}
          <View style={[styles.twoUpRow, isTwoUp && styles.twoUpFlex]}>
            <PosPaddedCard style={styles.flexCard}>
              <SectionTitle title="Detail Sesi" />
              <SpreadRow label="Kasir" value={sampleSession.cashier} />
              <SpreadRow label="Outlet" value={sampleSession.outlet} />
              <SpreadRow label="Profil POS" value={sampleSession.posProfile} />
              <SpreadRow label="Durasi Sesi" value={sampleSession.duration} />
            </PosPaddedCard>

            <PosPaddedCard style={styles.flexCard}>
              <SectionTitle title="Terkumpul" />
              <SpreadRow label="Total Perkiraan" value={formatRupiah(derived.closingExpected)} />
              <SpreadRow label="Total Terhitung" value={formatRupiah(derived.closingCounted)} />
              <SpreadRow
                label="Total Selisih"
                value={formatSignedRupiah(derived.closingDifference)}
                boldValue
                valueColor={
                  derived.closingDifference === 0
                    ? Colors.SuccessInk
                    : Colors.DangerInk
                }
              />
            </PosPaddedCard>
          </View>

          {/* Breakdown Table Card */}
          <PosCard style={styles.tableCard}>
            <SectionTitle title="Rincian Pembayaran" />

            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, styles.methodCol]}>Metode</Text>
              <Text style={[styles.headerCell, styles.numCol]}>Perkiraan</Text>
              <Text style={[styles.headerCell, styles.numCol]}>Terhitung</Text>
              <Text style={[styles.headerCell, styles.numCol]}>Selisih</Text>
            </View>

            <View style={styles.divider} />

            {/* Table Rows */}
            {state.closingRows.map((row) => {
              // ponytail: local difference calculation for Phase 1 mockup presentation; Phase 2 replaces with ERPNext preview/submit values
              const diff = row.difference ?? row.counted - row.expected;
              return (
                <View key={row.method} style={styles.tableRow}>
                  <Text style={[styles.cellText, styles.methodCol]}>{row.method}</Text>
                  <Text style={[styles.cellText, styles.numCol]}>
                    {formatRupiah(row.expected)}
                  </Text>
                  <Text style={[styles.cellText, styles.numCol]}>
                    {formatRupiah(row.counted)}
                  </Text>
                  <Text
                    style={[
                      styles.cellText,
                      styles.numCol,
                      diff === 0 ? styles.balancedText : styles.diffText,
                    ]}
                  >
                    {formatSignedRupiah(diff)}
                  </Text>
                </View>
              );
            })}
          </PosCard>

          {/* Total Closing Card */}
          <PosCard style={styles.totalCard}>
            <SpreadRow
              label="Total Penutupan Kas"
              value={formatRupiah(derived.closingCounted)}
              boldValue
              valueColor={Colors.BrandInk}
            />
          </PosCard>

          {/* Confirm Action Button */}
          <View style={styles.actionFooter}>
            <PosButton
              label="Konfirmasi & Tutup Shift"
              variant="Primary"
              onPress={() => onConfirmClosing?.()}
              fullWidth
              accessibilityLabel="Konfirmasi dan tutup shift secara permanen"
            />
          </View>
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
  },
  bodyWrapper: {
    maxWidth: 980,
    width: '100%',
    alignSelf: 'center',
    gap: Spacing.s4,
  },
  banner: {
    width: '100%',
  },
  twoUpRow: {
    gap: Spacing.s4,
  },
  twoUpFlex: {
    flexDirection: 'row',
  },
  flexCard: {
    flex: 1,
    gap: Spacing.s2,
  },
  tableCard: {
    padding: Spacing.s4,
    gap: Spacing.s2,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: Spacing.s1,
  },
  headerCell: {
    ...Typography.XsSemi,
    color: Colors.Text2,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.s2,
    alignItems: 'center',
  },
  cellText: {
    ...Typography.Sm,
    color: Colors.Text,
  },
  methodCol: {
    flex: 1.2,
  },
  numCol: {
    flex: 1,
    textAlign: 'right',
  },
  balancedText: {
    color: Colors.SuccessInk,
    ...Typography.SmSemi,
  },
  diffText: {
    color: Colors.DangerInk,
    ...Typography.SmSemi,
  },
  totalCard: {
    padding: Spacing.s4,
    backgroundColor: Colors.BrandSoft,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.Border,
    marginVertical: Spacing.s1,
  },
  actionFooter: {
    marginTop: Spacing.s2,
  },
});
