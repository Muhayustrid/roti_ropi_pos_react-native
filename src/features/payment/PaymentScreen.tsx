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
import { ResponsiveModal } from '../../components/ResponsiveModal';
import { usePosState, usePosDerived, usePosActions } from '../../state/PosContext';
import { samplePaymentMethods } from '../../mock/data';
import { formatRupiah } from '../../utils/money';
import { getWindowClass } from '../../utils/layout';
import type { PaymentMethodOption, PaymentMethodType } from '../../types';
import { PosIcon } from '../../components/PosIcon';

export interface PaymentScreenProps {
  onBack?: () => void;
  onProceedToCash?: () => void;
  onProceedToSplit?: () => void;
  onProceedToChecking?: () => void;
  width?: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
}

export function PaymentScreen({
  onBack,
  onProceedToCash,
  onProceedToSplit,
  onProceedToChecking,
  width: customWidth,
  height: customHeight,
  style,
}: PaymentScreenProps) {
  const windowDims = useWindowDimensions();
  const width = customWidth ?? windowDims.width;
  const height = customHeight ?? windowDims.height;
  const windowClass = getWindowClass(width, height);

  const state = usePosState();
  const derived = usePosDerived();
  const actions = usePosActions();

  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  const selectedMethod = state.paymentMethod;
  const totals = derived.totals;
  const customer = state.customer;

  // Grid column count based on DESIGN.md 6.2
  // Compact: 1 col, Medium: 2 cols, Expanded: 3 cols
  const columns = useMemo(() => {
    if (windowClass.isExpanded) return 3;
    if (windowClass.isMedium) return 2;
    return 1;
  }, [windowClass.isExpanded, windowClass.isMedium]);

  const handleSelectMethod = (id: PaymentMethodType) => {
    actions.setPaymentMethod(id);
  };

  const handlePrimaryProceed = () => {
    if (selectedMethod === 'Cash') {
      onProceedToCash?.();
    } else {
      setConfirmModalVisible(true);
    }
  };

  const handleConfirmPayment = () => {
    setConfirmModalVisible(false);
    onProceedToChecking?.();
  };

  const currentMethodOption =
    samplePaymentMethods.find((m) => m.id === selectedMethod) || samplePaymentMethods[0];

  return (
    <View style={[styles.container, style]}>
      {/* Task TopBar */}
      <PosTopBar
        title="Pilih Pembayaran"
        onBack={onBack}
        backIsClose
      />

      {/* Main Body */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.contentWrapper, { maxWidth: windowClass.isCompact ? 560 : 980 }]}>
          {/* Brand-soft Due Card */}
          <PosCard
            style={styles.dueCard}
            backgroundColor={Colors.BrandSoft}
          >
            <Text style={styles.dueOverline}>Total Tagihan</Text>
            <Text style={styles.dueTotal}>{formatRupiah(totals.total)}</Text>
            <Text style={styles.dueMeta}>
              {totals.itemCount} item · termasuk pajak
            </Text>
          </PosCard>

          {/* Method Cards Grid */}
          <Text style={styles.sectionHeading}>Metode Pembayaran</Text>
          <View style={styles.gridContainer}>
            {samplePaymentMethods.map((method: PaymentMethodOption) => {
              const isSelected = selectedMethod === method.id;
              const cardWidth =
                columns === 1
                  ? '100%'
                  : columns === 2
                  ? '48.5%'
                  : '31.8%';

              return (
                <PosCard
                  key={method.id}
                  selected={isSelected}
                  selectedBorderColor={Colors.Brand}
                  onPress={() => handleSelectMethod(method.id)}
                  style={[styles.methodCard, { width: cardWidth }]}
                  accessibilityLabel={`Pilih pembayaran ${method.label}`}
                >
                  <View style={styles.methodCardContent}>
                    <ToneIcon tone={method.tone} size={40} style={styles.methodIcon}>
                      <PosIcon
                        name={method.id === 'Cash' ? 'cash' : method.id === 'Qris' ? 'qris' : 'card'}
                        size={22}
                        color={Colors.BrandInk}
                      />
                    </ToneIcon>

                    <View style={styles.methodInfo}>
                      <Text style={styles.methodLabel}>{method.label}</Text>
                      <Text style={styles.methodDetail}>{method.detail}</Text>
                    </View>

                    {/* Fixed 20dp selection indicator slot to prevent text jump */}
                    <View style={styles.selectionSlot}>
                      {isSelected ? (
                        <View style={styles.selectedCircle}>
                          <PosIcon name="check" size={14} color={Colors.Surface} />
                        </View>
                      ) : (
                        <View style={styles.unselectedCircle} />
                      )}
                    </View>
                  </View>
                </PosCard>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Sticky Action Footer */}
      <PosActionFooter width={width}>
        <View style={[styles.footerActions, !windowClass.isCompact && styles.footerActionsWide]}>
          <PosButton
            label="Pembayaran Terpisah"
            variant="Outline"
            onPress={() => onProceedToSplit?.()}
            style={styles.actionBtn}
            accessibilityLabel="Buka pembayaran terpisah"
          />
          <PosButton
            label="Lanjut"
            variant="Primary"
            onPress={handlePrimaryProceed}
            style={styles.actionBtn}
            accessibilityLabel="Lanjut pembayaran"
          />
        </View>
      </PosActionFooter>

      {/* Confirmation Modal for QRIS / Card */}
      <ResponsiveModal
        visible={confirmModalVisible}
        onClose={() => setConfirmModalVisible(false)}
        title="Selesaikan pembayaran ini?"
        maxWidth={440}
        footer={
          <View style={styles.modalFooter}>
            <PosButton
              label="Kembali"
              variant="Outline"
              onPress={() => setConfirmModalVisible(false)}
              style={styles.modalBtn}
              accessibilityLabel="Kembali ke pilihan pembayaran"
            />
            <PosButton
              label="Konfirmasi Pembayaran"
              variant="Primary"
              onPress={handleConfirmPayment}
              style={styles.modalBtn}
              accessibilityLabel="Konfirmasi dan proses pembayaran"
            />
          </View>
        }
      >
        <ScrollView style={styles.modalScrollBody} showsVerticalScrollIndicator={false}>
          <Text style={styles.modalSubtitle}>
            Periksa detail sebelum mengonfirmasi transaksi.
          </Text>

          <PosPaddedCard style={styles.modalSummaryCard}>
            <SpreadRow
              label="Total Tagihan"
              value={formatRupiah(totals.total)}
              boldValue
              valueColor={Colors.BrandInk}
            />
            <SpreadRow label="Pelanggan" value={customer.name} />
            <SpreadRow label="Metode" value={currentMethodOption.label} />
            <SpreadRow label="Jumlah Item" value={`${totals.itemCount} item`} />
          </PosPaddedCard>
        </ScrollView>
      </ResponsiveModal>
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
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.s3,
    marginBottom: Spacing.s4,
  },
  methodCard: {
    minHeight: 76,
    borderRadius: Radius.lg,
  },
  methodCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.s3,
  },
  methodIcon: {
    marginRight: Spacing.s3,
  },
  methodIconEmoji: {
    fontSize: 20,
  },
  methodInfo: {
    flex: 1,
  },
  methodLabel: {
    ...Typography.MdSemi,
    color: Colors.Text,
    marginBottom: 2,
  },
  methodDetail: {
    ...Typography.Xs,
    color: Colors.Text2,
  },
  selectionSlot: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.s2,
  },
  selectedCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.Brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCheck: {
    fontSize: 12,
    color: Colors.OnFill,
    fontWeight: '700',
  },
  unselectedCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.InputBorder,
  },
  footerActions: {
    flexDirection: 'column',
    gap: Spacing.s2,
    width: '100%',
  },
  footerActionsWide: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  actionBtn: {
    flex: 1,
  },
  modalSubtitle: {
    ...Typography.Sm,
    color: Colors.Text2,
    marginBottom: Spacing.s3,
  },
  modalScrollBody: {
    maxHeight: 280,
  },
  modalSummaryCard: {
    backgroundColor: Colors.SurfaceAlt,
    borderWidth: 1,
    borderColor: Colors.Border,
    gap: Spacing.s2,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.s2,
  },
  modalBtn: {
    flex: 1,
  },
});
