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
import { PosPaddedCard, SpreadRow, SectionTitle, ToneIcon } from '../../components/PosCard';
import { PosBadge } from '../../components/PosBadge';
import { PosButton } from '../../components/PosButton';
import { PosIcon } from '../../components/PosIcon';
import { formatRupiah } from '../../utils/money';
import { getWindowClass } from '../../utils/layout';
import { usePosDerived, usePosActions } from '../../state/PosContext';
import { sampleSession, sampleClosedShift } from '../../mock/data';

export interface ShiftClosedScreenProps {
  onFinish?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function ShiftClosedScreen({ onFinish, style }: ShiftClosedScreenProps) {
  const { width, height } = useWindowDimensions();
  const windowClass = getWindowClass(width, height);
  const derived = usePosDerived();
  const actions = usePosActions();

  const handleFinish = () => {
    actions.resetSession();
    onFinish?.();
  };

  const isTwoUp = windowClass.isExpanded || (windowClass.isMedium && width >= 700);

  return (
    <View style={[styles.container, style]}>
      <PosTopBar title="Shift Ditutup" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.bodyWrapper}>
          {/* Status Check Hero */}
          <View style={styles.heroSection}>
            <ToneIcon tone="Bread" size={64} style={styles.heroIcon}>
              <PosIcon name="check" size={32} color={Colors.BrandInk} />
            </ToneIcon>
            <Text style={styles.heroTitle}>Shift berhasil dikirim</Text>
            <Text style={styles.refText}>{sampleClosedShift.reference}</Text>
            <PosBadge label="Terkirim" variant="Success" style={styles.badge} />
          </View>

          {/* Two-Up: Receipt Details & Payment Breakdown */}
          <View style={[styles.twoUpRow, isTwoUp && styles.twoUpFlex]}>
            {/* Detail Struk Card */}
            <PosPaddedCard style={styles.flexCard}>
              <SectionTitle title="Detail Struk" />
              <SpreadRow label="Kasir" value={sampleSession.cashier} />
              <SpreadRow label="Profil POS" value={sampleSession.posProfile} />
              <SpreadRow label="Ref Pembukaan" value={sampleSession.openingRef} />
              <SpreadRow label="Jumlah Transaksi" value={`${sampleClosedShift.invoiceCount} struk`} />
              <SpreadRow
                label="Grand Total"
                value={formatRupiah(derived.closingCounted)}
                boldValue
                valueColor={Colors.BrandInk}
              />
            </PosPaddedCard>

            {/* Payment Methods Card */}
            <PosPaddedCard style={styles.flexCard}>
              <SectionTitle title="Rincian Metode" />
              {sampleClosedShift.rows.map((row) => (
                <SpreadRow
                  key={row.method}
                  label={row.method}
                  value={formatRupiah(row.total)}
                  style={styles.methodRow}
                />
              ))}
              <View style={styles.divider} />
              <SpreadRow
                label="Status Rekonsiliasi"
                value="Shift seimbang"
                boldValue
                valueColor={Colors.SuccessInk}
              />
            </PosPaddedCard>
          </View>

          {/* Timestamp Footer Info */}
          <View style={styles.timestampCard}>
            <Text style={styles.timestampText}>
              Waktu Penutupan: {sampleClosedShift.timestamp}
            </Text>
          </View>

          {/* Finish Action */}
          <View style={styles.actionFooter}>
            <PosButton
              label="Selesai"
              variant="Primary"
              onPress={handleFinish}
              fullWidth
              accessibilityLabel="Selesai dan kembali ke halaman login"
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
  heroSection: {
    alignItems: 'center',
    paddingVertical: Spacing.s2,
  },
  heroIcon: {
    marginBottom: Spacing.s2,
  },
  heroIconText: {
    fontSize: 32,
    color: Colors.BrandInk,
  },
  heroTitle: {
    ...Typography.Xl,
    color: Colors.Text,
    marginBottom: 2,
  },
  refText: {
    ...Typography.SmMedium,
    color: Colors.Text2,
    marginBottom: Spacing.s2,
  },
  badge: {
    alignSelf: 'center',
    marginBottom: Spacing.s2,
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
  methodRow: {
    marginVertical: 2,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.Border,
    marginVertical: Spacing.s2,
  },
  timestampCard: {
    alignItems: 'center',
    paddingVertical: Spacing.s2,
  },
  timestampText: {
    ...Typography.Xs,
    color: Colors.Text3,
  },
  actionFooter: {
    marginTop: Spacing.s2,
  },
});
