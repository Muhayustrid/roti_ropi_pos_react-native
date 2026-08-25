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
import { PosField } from '../../components/PosField';
import { PosButton } from '../../components/PosButton';
import { PosBadge } from '../../components/PosBadge';
import { formatRupiah, formatSignedRupiah } from '../../utils/money';
import { getWindowClass } from '../../utils/layout';
import { usePosState, usePosDerived, usePosActions } from '../../state/PosContext';
import { sampleSession } from '../../mock/data';

export interface ClosingScreenProps {
  onBack?: () => void;
  onReviewClosing?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function ClosingScreen({ onBack, onReviewClosing, style }: ClosingScreenProps) {
  const { width, height } = useWindowDimensions();
  const windowClass = getWindowClass(width, height);
  const state = usePosState();
  const derived = usePosDerived();
  const actions = usePosActions();

  const handleCountedChange = (method: string, text: string) => {
    const numericOnly = text.replace(/[^0-9]/g, '');
    const counted = parseInt(numericOnly, 10) || 0;
    actions.setCounted(method, counted);
  };

  const isTwoUp = windowClass.isExpanded || (windowClass.isMedium && width >= 700);

  return (
    <View style={[styles.container, style]}>
      <PosTopBar title="Saldo Penutupan" onBack={onBack} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.bodyWrapper}>
          {/* Banner Hero */}
          <PosBanner
            variant="Brand"
            title="Hitung setiap metode pembayaran"
            body="Periksa selisihnya sebelum menutup shift."
            style={styles.banner}
          />

          {/* Session Details Card */}
          <PosPaddedCard style={styles.sessionCard}>
            <SectionTitle title="Detail Sesi" />
            <SpreadRow label="Kasir" value={sampleSession.cashier} />
            <SpreadRow label="Outlet" value={sampleSession.outlet} />
            <SpreadRow label="Profil POS" value={sampleSession.posProfile} />
            <SpreadRow label="Ref Pembukaan" value={sampleSession.openingRef} />
          </PosPaddedCard>

          {/* Payment Counting Cards */}
          <View style={[styles.methodsGrid, isTwoUp && styles.twoUpGrid]}>
            {state.closingRows.map((row) => {
              // ponytail: local difference calculation for Phase 1 mockup presentation; Phase 2 replaces with ERPNext preview/submit values
              const diff = row.difference ?? row.counted - row.expected;
              const isBalanced = diff === 0;
              const isShort = diff < 0;

              return (
                <PosCard key={row.method} style={styles.countCard}>
                  <View style={styles.countCardHeader}>
                    <Text style={styles.methodName}>{row.method}</Text>
                    {isBalanced ? (
                      <PosBadge label="Seimbang" variant="Success" />
                    ) : (
                      <PosBadge
                        label={`${isShort ? 'Kurang' : 'Lebih'} ${formatRupiah(Math.abs(diff))}`}
                        variant="Danger"
                      />
                    )}
                  </View>

                  <View style={styles.divider} />

                  <SpreadRow label="Saldo Awal" value={formatRupiah(row.opening)} />
                  <SpreadRow label="Total Perkiraan" value={formatRupiah(row.expected)} />

                  <View style={styles.inputWrapper}>
                    <PosField
                      label="Jumlah Fisik / Terhitung"
                      value={row.counted.toString()}
                      onChangeText={(text) => handleCountedChange(row.method, text)}
                      keyboardType="numeric"
                      accessibilityLabel={`Jumlah fisik terhitung untuk ${row.method}`}
                    />
                  </View>
                </PosCard>
              );
            })}
          </View>

          {/* Shift Summary Card */}
          <PosCard style={styles.summaryCard}>
            <SectionTitle title="Ringkasan Shift" />
            <SpreadRow label="Total Perkiraan" value={formatRupiah(derived.closingExpected)} />
            <SpreadRow label="Total Terhitung" value={formatRupiah(derived.closingCounted)} />
            <View style={styles.dividerSolid} />
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
          </PosCard>

          {/* Sticky/Bottom Primary Action */}
          <View style={styles.actionFooter}>
            <PosButton
              label="Tinjau Penutupan"
              variant="Primary"
              onPress={() => onReviewClosing?.()}
              fullWidth
              accessibilityLabel="Tinjau konfirmasi penutupan shift"
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
  sessionCard: {
    gap: Spacing.s2,
  },
  methodsGrid: {
    gap: Spacing.s4,
  },
  twoUpGrid: {
    flexDirection: 'row',
  },
  countCard: {
    flex: 1,
    padding: Spacing.s4,
    gap: Spacing.s2,
  },
  countCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  methodName: {
    ...Typography.MdBold,
    color: Colors.Text,
  },
  inputWrapper: {
    marginTop: Spacing.s2,
  },
  summaryCard: {
    padding: Spacing.s4,
    gap: Spacing.s2,
    backgroundColor: Colors.SurfaceAlt,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.Border,
    marginVertical: Spacing.s2,
  },
  dividerSolid: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.Border,
    marginVertical: Spacing.s2,
  },
  actionFooter: {
    marginTop: Spacing.s2,
  },
});
