import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Colors, Radius, Typography, Spacing } from '../../theme/tokens';
import { PosTopBar, PosActionFooter } from '../../components/PosBars';
import { PosCard, PosPaddedCard, ToneIcon, SpreadRow } from '../../components/PosCard';
import { PosButton } from '../../components/PosButton';
import { MoneyField } from '../../components/PosField';
import { usePosState, usePosDerived } from '../../state/PosContext';
import { samplePaymentMethods } from '../../mock/data';
import { formatRupiah } from '../../utils/money';
import { getWindowClass } from '../../utils/layout';
import { PosIcon } from '../../components/PosIcon';

export interface SplitPaymentScreenProps {
  onBack?: () => void;
  onComplete?: () => void;
  width?: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
}

export function SplitPaymentScreen({
  onBack,
  onComplete,
  width: customWidth,
  height: customHeight,
  style,
}: SplitPaymentScreenProps) {
  const windowDims = useWindowDimensions();
  const width = customWidth ?? windowDims.width;
  const height = customHeight ?? windowDims.height;
  const windowClass = getWindowClass(width, height);

  const _state = usePosState();
  const derived = usePosDerived();
  const payable = derived.totals.total;

  // Initialize every editable allocation to 0 per DESIGN.md 8.7
  const [allocations, setAllocations] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    samplePaymentMethods.forEach((m) => {
      initial[m.id] = 0;
    });
    return initial;
  });

  const handleUpdateAllocation = (methodId: string, amount: number) => {
    setAllocations((prev) => ({
      ...prev,
      [methodId]: Math.max(0, amount),
    }));
  };

  const totalAllocated = useMemo(() => {
    return Object.values(allocations).reduce((sum, val) => sum + (val || 0), 0);
  }, [allocations]);

  const remainder = payable - totalAllocated;
  const isSettled = remainder === 0;

  return (
    <View style={[styles.container, style]}>
      {/* Task TopBar */}
      <PosTopBar
        title="Pembayaran Terpisah"
        onBack={onBack}
        backIsClose
      />

      {/* Main Body */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.contentWrapper, { maxWidth: windowClass.isCompact ? 560 : 720 }]}>
          {/* Brand-soft Due Card */}
          <PosCard
            style={styles.dueCard}
            backgroundColor={Colors.BrandSoft}
          >
            <Text style={styles.dueOverline}>Total Tagihan</Text>
            <Text style={styles.dueTotal}>{formatRupiah(payable)}</Text>
            <Text style={styles.dueMeta}>
              {derived.totals.itemCount} item · termasuk pajak
            </Text>
          </PosCard>

          {/* Allocation Cards */}
          <Text style={styles.sectionHeading}>Alokasi Metode Pembayaran</Text>
          <View style={styles.allocationList}>
            {samplePaymentMethods.map((method) => {
              const currentVal = allocations[method.id] || 0;

              return (
                <PosCard key={method.id} style={styles.allocationCard}>
                  <View style={styles.cardHeader}>
                    <ToneIcon tone={method.tone} size={36} style={styles.methodIcon}>
                      <PosIcon
                        name={method.id === 'Cash' ? 'cash' : method.id === 'Qris' ? 'qris' : 'card'}
                        size={20}
                        color={Colors.BrandInk}
                      />
                    </ToneIcon>
                    <View style={styles.methodDetails}>
                      <Text style={styles.methodLabel}>{method.label}</Text>
                      <Text style={styles.methodDetail}>{method.detail}</Text>
                    </View>
                  </View>

                  <View style={styles.fieldWrapper}>
                    <MoneyField
                      label="Nominal Alokasi"
                      value={currentVal}
                      onChangeValue={(val) => handleUpdateAllocation(method.id, val)}
                    />
                  </View>
                </PosCard>
              );
            })}
          </View>

          {/* Summary Box */}
          <PosPaddedCard style={styles.summaryCard} backgroundColor={Colors.SurfaceAlt}>
            <SpreadRow
              label="Total Tagihan"
              value={formatRupiah(payable)}
            />
            <SpreadRow
              label="Total Dialokasikan"
              value={formatRupiah(totalAllocated)}
              boldValue
              valueColor={Colors.BrandInk}
            />
            <SpreadRow
              label="Sisa Pembayaran"
              value={formatRupiah(Math.abs(remainder))}
              boldValue
              valueColor={remainder === 0 ? Colors.SuccessInk : Colors.DangerInk}
            />
            {remainder !== 0 ? (
              <Text style={styles.remainderNotice}>
                {remainder > 0
                  ? `Kurang alokasi ${formatRupiah(remainder)}`
                  : `Kelebihan alokasi ${formatRupiah(Math.abs(remainder))}`}
              </Text>
            ) : null}
          </PosPaddedCard>
        </View>
      </ScrollView>

      {/* Sticky Action Footer */}
      <PosActionFooter width={width}>
        <PosButton
          label="Selesaikan Pembayaran"
          variant="Primary"
          disabled={!isSettled}
          onPress={() => onComplete?.()}
          style={styles.completeBtn}
          accessibilityLabel="Selesaikan pembayaran terpisah"
        />
      </PosActionFooter>
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
  },
  contentWrapper: {
    width: '100%',
  },
  dueCard: {
    padding: Spacing.s4,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.BrandSoft,
    alignItems: 'center',
    marginBottom: Spacing.s4,
  },
  dueOverline: {
    ...Typography.Sm,
    color: Colors.BrandInk,
    marginBottom: 4,
  },
  dueTotal: {
    ...Typography.Xxl,
    color: Colors.BrandInk,
    marginBottom: 4,
  },
  dueMeta: {
    ...Typography.Sm,
    color: Colors.Text2,
  },
  sectionHeading: {
    ...Typography.MdBold,
    color: Colors.Text,
    marginBottom: Spacing.s3,
  },
  allocationList: {
    gap: Spacing.s3,
    marginBottom: Spacing.s4,
  },
  allocationCard: {
    padding: Spacing.s4,
    backgroundColor: Colors.Surface,
    borderRadius: Radius.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.s3,
  },
  methodIcon: {
    marginRight: Spacing.s3,
  },
  iconEmoji: {
    fontSize: 18,
  },
  methodDetails: {
    flex: 1,
  },
  methodLabel: {
    ...Typography.MdSemi,
    color: Colors.Text,
  },
  methodDetail: {
    ...Typography.Xs,
    color: Colors.Text2,
  },
  fieldWrapper: {
    marginTop: 2,
  },
  summaryCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.Border,
    gap: Spacing.s2,
    marginBottom: Spacing.s4,
  },
  remainderNotice: {
    ...Typography.XsSemi,
    color: Colors.DangerInk,
    textAlign: 'right',
    marginTop: 2,
  },
  completeBtn: {
    width: '100%',
  },
});
