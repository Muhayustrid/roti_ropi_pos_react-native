import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../../theme/tokens';
import { PosTopBar, PosActionFooter } from '../../components/PosBars';
import { PosCard, SectionTitle, LabelledValue, ToneIcon } from '../../components/PosCard';
import { PosButton } from '../../components/PosButton';
import { MoneyField } from '../../components/PosField';
import { ResponsiveModal } from '../../components/ResponsiveModal';
import { PosIcon } from '../../components/PosIcon';
import { usePosState, usePosActions } from '../../state/PosContext';
import { sampleSession } from '../../mock/data';
import { formatRupiah } from '../../utils/money';

export interface OpeningScreenProps {
  onContinueToConfirm?: () => void;
  onBack?: () => void;
}

export function OpeningScreen({ onContinueToConfirm, onBack }: OpeningScreenProps) {
  const { openingCash, openingQris } = usePosState();
  const { setOpeningBalances } = usePosActions();

  const [cashVal, setCashVal] = useState(openingCash);
  const [qrisVal, setQrisVal] = useState(openingQris);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const totalOpening = cashVal + qrisVal;

  const handleOpenConfirm = () => {
    setOpeningBalances(cashVal, qrisVal);
    setShowConfirmModal(true);
  };

  const handleConfirmAndStart = () => {
    setShowConfirmModal(false);
    onContinueToConfirm?.();
  };

  return (
    <View style={styles.container}>
      <PosTopBar
        title="Saldo Pembukaan"
        onBack={onBack}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.contentWrapper}>
          {/* Centered Hero */}
          <View style={styles.heroSection}>
            <ToneIcon tone="Bread" size={56} style={styles.heroIcon}>
              <PosIcon name="wallet" size={28} color={Colors.BrandInk} />
            </ToneIcon>
            <Text style={styles.heroTitle}>Mulai shift Anda</Text>
            <Text style={styles.heroBody}>
              Masukkan saldo awal setiap metode pembayaran sebelum kasir aktif.
            </Text>
          </View>

          {/* Detail Sesi Card */}
          <PosCard style={styles.sectionCard}>
            <SectionTitle title="Detail Sesi" />
            <View style={styles.sessionGrid}>
              <LabelledValue label="Kasir" value={sampleSession.cashier} style={styles.gridItem} />
              <LabelledValue label="Outlet" value={sampleSession.outlet} style={styles.gridItem} />
              <LabelledValue
                label="Profil POS"
                value={sampleSession.posProfile}
                style={styles.gridItem}
              />
              <LabelledValue
                label="Mata Uang"
                value={sampleSession.currency}
                style={styles.gridItem}
              />
            </View>
          </PosCard>

          {/* Dana Pembukaan Card */}
          <PosCard style={styles.sectionCard}>
            <SectionTitle title="Dana Pembukaan" />
            <MoneyField
              label="Tunai"
              value={cashVal}
              onChangeValue={setCashVal}
              placeholder="0"
            />
            <MoneyField
              label="QRIS"
              value={qrisVal}
              onChangeValue={setQrisVal}
              placeholder="0"
            />
          </PosCard>

          {/* Total Pembukaan Card */}
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total Pembukaan</Text>
            <Text style={styles.totalAmount}>{formatRupiah(totalOpening)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Action Footer */}
      <PosActionFooter>
        <PosButton
          label="Mulai Shift"
          variant="Primary"
          fullWidth
          onPress={handleOpenConfirm}
        />
      </PosActionFooter>

      {/* Confirm Opening Modal */}
      <ResponsiveModal
        visible={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Konfirmasi Pembukaan"
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeroCenter}>
            <ToneIcon tone="Bread" size={48} style={styles.modalHeroIcon}>
              <PosIcon name="pos-terminal" size={24} color={Colors.BrandInk} />
            </ToneIcon>
            <Text style={styles.modalWarningText}>
              Cek sekali lagi. Saldo pembukaan tidak dapat diubah setelah shift dimulai.
            </Text>
          </View>

          <View style={styles.confirmAmountsBox}>
            <View style={styles.confirmRow}>
              <Text style={styles.confirmRowLabel}>Tunai</Text>
              <Text style={styles.confirmRowValue}>{formatRupiah(cashVal)}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={styles.confirmRowLabel}>QRIS</Text>
              <Text style={styles.confirmRowValue}>{formatRupiah(qrisVal)}</Text>
            </View>
            <View style={styles.confirmDivider} />
            <View style={styles.confirmRow}>
              <Text style={styles.confirmTotalLabel}>Total</Text>
              <Text style={styles.confirmTotalValue}>{formatRupiah(totalOpening)}</Text>
            </View>
          </View>

          <View style={styles.modalButtonStack}>
            <PosButton
              label="Konfirmasi & Mulai"
              variant="Primary"
              fullWidth
              onPress={handleConfirmAndStart}
              style={styles.modalPrimaryBtn}
            />
            <PosButton
              label="Ubah Saldo"
              variant="Outline"
              fullWidth
              onPress={() => setShowConfirmModal(false)}
            />
          </View>
        </View>
      </ResponsiveModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.Bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.s4,
    alignItems: 'center',
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 420,
    gap: Spacing.s4,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: Spacing.s2,
  },
  heroIcon: {
    marginBottom: Spacing.s2,
  },
  walletEmoji: {
    fontSize: 24,
  },
  heroTitle: {
    ...Typography.Lg,
    color: Colors.Text,
    textAlign: 'center',
    marginBottom: 4,
  },
  heroBody: {
    ...Typography.Sm,
    color: Colors.Text2,
    textAlign: 'center',
    maxWidth: 320,
  },
  sectionCard: {
    padding: Spacing.s4,
    backgroundColor: Colors.Surface,
  },
  sessionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: Spacing.s3,
    columnGap: Spacing.s2,
  },
  gridItem: {
    width: '47%',
  },
  totalCard: {
    backgroundColor: Colors.BrandSoft,
    borderRadius: Radius.lg,
    padding: Spacing.s4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.Brand,
  },
  totalLabel: {
    ...Typography.MdSemi,
    color: Colors.BrandInk,
  },
  totalAmount: {
    ...Typography.LgBold,
    color: Colors.BrandInk,
  },
  modalContent: {
    gap: Spacing.s4,
  },
  modalHeroCenter: {
    alignItems: 'center',
  },
  modalHeroIcon: {
    marginBottom: Spacing.s2,
  },
  posMachineEmoji: {
    fontSize: 20,
  },
  modalWarningText: {
    ...Typography.Sm,
    color: Colors.Text2,
    textAlign: 'center',
  },
  confirmAmountsBox: {
    backgroundColor: Colors.SurfaceAlt,
    borderRadius: Radius.md,
    padding: Spacing.s3,
    borderWidth: 1,
    borderColor: Colors.Border,
    gap: 8,
  },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confirmRowLabel: {
    ...Typography.Sm,
    color: Colors.Text2,
  },
  confirmRowValue: {
    ...Typography.SmSemi,
    color: Colors.Text,
  },
  confirmDivider: {
    height: 1,
    backgroundColor: Colors.Border,
    marginVertical: 4,
  },
  confirmTotalLabel: {
    ...Typography.MdSemi,
    color: Colors.Text,
  },
  confirmTotalValue: {
    ...Typography.MdBold,
    color: Colors.BrandInk,
  },
  modalButtonStack: {
    gap: Spacing.s2,
  },
  modalPrimaryBtn: {
    marginBottom: Spacing.s2,
  },
});
