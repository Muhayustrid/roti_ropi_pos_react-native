import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Pressable,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Colors, Typography, Spacing } from '../../theme/tokens';
import { PosCard, SpreadRow, SectionTitle, ToneIcon } from '../../components/PosCard';
import { PosBadge } from '../../components/PosBadge';
import { PosButton } from '../../components/PosButton';
import { PosIcon } from '../../components/PosIcon';
import { PosBanner } from '../../components/PosBanner';
import { StateView } from '../../components/StateView';
import { getWindowClass } from '../../utils/layout';
import { usePosState, usePosActions } from '../../state/PosContext';
import { sampleSession } from '../../mock/data';

export interface MoreScreenProps {
  onCloseShift?: () => void;
  onOpenPrinter?: () => void;
  onOpenReport?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function MoreScreen({
  onCloseShift,
  onOpenPrinter,
  onOpenReport,
  style,
}: MoreScreenProps) {
  const { width, height } = useWindowDimensions();
  const windowClass = getWindowClass(width, height);
  const state = usePosState();
  const actions = usePosActions();
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);
  const loadingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isTwoColumn = windowClass.isExpanded || (windowClass.isMedium && width >= 750);

  useEffect(() => {
    return () => {
      if (loadingTimer.current) clearTimeout(loadingTimer.current);
    };
  }, []);

  const runLoadingDemo = () => {
    if (loadingTimer.current) clearTimeout(loadingTimer.current);
    setIsLoadingDemo(true);
    loadingTimer.current = setTimeout(() => {
      setIsLoadingDemo(false);
      loadingTimer.current = null;
    }, 1200);
  };

  return (
    <View style={[styles.container, style]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {state.isOfflineDemo ? (
          <PosBanner
            title="Anda sedang offline"
            body="Data transaksi memakai simulasi lokal. Tidak ada sinkronisasi ke server."
            variant="Warning"
            icon={<PosIcon name="offline" size={20} color={Colors.WarningInk} />}
            style={styles.stateBanner}
          />
        ) : null}
        {state.isErrorDemo ? (
          <PosBanner
            title="Simulasi error aktif"
            body="Respons kegagalan sistem sedang disimulasikan untuk pengujian."
            variant="Danger"
            icon={<PosIcon name="warning" size={20} color={Colors.DangerInk} />}
            style={styles.stateBanner}
          />
        ) : null}
        {isLoadingDemo ? (
          <StateView
            type="loading"
            title="Memuat simulasi POS"
            description="Transisi singkat untuk memeriksa tampilan loading."
            style={styles.loadingState}
          />
        ) : null}

        <View style={[styles.mainLayout, isTwoColumn && styles.twoColumnLayout]}>
          {/* Column 1: Session Info & Shift Closing */}
          <View style={styles.column}>
            {/* Cashier & Session Card */}
            <PosCard style={styles.sessionCard}>
              <View style={styles.cashierHeader}>
                <ToneIcon tone="Bread" size={48} style={styles.avatar}>
                  <PosIcon name="person" size={24} color={Colors.BrandInk} />
                </ToneIcon>
                <View style={styles.cashierMeta}>
                  <Text style={styles.cashierName}>{sampleSession.cashier}</Text>
                  <Text style={styles.cashierRole}>Kasir · {sampleSession.posProfile}</Text>
                </View>
                <PosBadge label="Aktif" variant="Success" />
              </View>

              <View style={styles.divider} />

              <View style={styles.sessionDetails}>
                <SpreadRow label="Outlet" value={sampleSession.outlet} />
                <SpreadRow label="Mata Uang" value={sampleSession.currency} />
                <SpreadRow label="Ref Pembukaan" value={sampleSession.openingRef} />
                <SpreadRow label="Durasi Sesi" value={sampleSession.duration} />
              </View>

              <View style={styles.divider} />

              <PosButton
                label="Tutup Shift"
                variant="Tonal"
                onPress={() => onCloseShift?.()}
                fullWidth
                accessibilityLabel="Tutup shift kasir sekarang"
              />
            </PosCard>

            {/* Demo Controls Card */}
            <PosCard style={styles.card}>
              <SectionTitle title="Kontrol Demo & Pengujian" />
              <View style={styles.demoRow}>
                <View style={styles.demoInfo}>
                  <Text style={styles.demoLabel}>Mode Offline Demo</Text>
                  <Text style={styles.demoDesc}>Simulasikan transaksi tanpa koneksi internet</Text>
                </View>
                <Switch
                  testID="offline-demo-switch"
                  value={state.isOfflineDemo}
                  onValueChange={actions.toggleOfflineDemo}
                  trackColor={{ false: Colors.Border, true: Colors.Brand }}
                  thumbColor={state.isOfflineDemo ? Colors.Surface : Colors.SurfaceAlt}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.demoRow}>
                <View style={styles.demoInfo}>
                  <Text style={styles.demoLabel}>Simulasi Error Demo</Text>
                  <Text style={styles.demoDesc}>Simulasikan respon kegagalan sistem</Text>
                </View>
                <Switch
                  testID="error-demo-switch"
                  value={state.isErrorDemo}
                  onValueChange={actions.toggleErrorDemo}
                  trackColor={{ false: Colors.Border, true: Colors.Danger }}
                  thumbColor={state.isErrorDemo ? Colors.Surface : Colors.SurfaceAlt}
                />
              </View>

              <View style={styles.divider} />

              <PosButton
                label="Jalankan Simulasi Loading"
                variant="Tonal"
                onPress={runLoadingDemo}
                loading={isLoadingDemo}
                disabled={isLoadingDemo}
                fullWidth
                accessibilityLabel="Jalankan simulasi loading singkat"
              />

              <PosButton
                label="Reset Sesi POS"
                variant="Outline"
                onPress={actions.resetSession}
                fullWidth
                accessibilityLabel="Reset semua data mock sesi"
              />
            </PosCard>
          </View>

          {/* Column 2: App Settings */}
          <View style={styles.column}>
            {/* Appearance Settings */}
            <PosCard style={styles.card}>
              <SectionTitle title="Tampilan" />
              <SpreadRow label="Tema" value="Terang (Sistem)" />
              <SpreadRow
                label="Warna Aksen"
                value="Cokelat Roti"
                valueColor={Colors.BrandInk}
                boldValue
              />
            </PosCard>

            {/* General Settings */}
            <PosCard style={styles.card}>
              <SectionTitle title="Umum" />
              <SpreadRow label="Bahasa" value="Bahasa Indonesia" />
              <Pressable
                onPress={onOpenReport}
                accessibilityRole="button"
                accessibilityLabel="Buka laporan penjualan"
                style={({ pressed }) => [
                  styles.settingsLink,
                  pressed && styles.settingsLinkPressed,
                ]}
              >
                <View>
                  <Text style={styles.settingsLabel}>Laporan</Text>
                  <Text style={styles.reportValue}>
                    Ringkasan penjualan dan closing
                  </Text>
                </View>
                <PosIcon
                  name="back"
                  size={20}
                  color={Colors.Text2}
                  style={styles.chevron}
                />
              </Pressable>
              <Pressable
                onPress={onOpenPrinter}
                accessibilityRole="button"
                accessibilityLabel="Buka pengaturan printer"
                style={({ pressed }) => [
                  styles.settingsLink,
                  pressed && styles.settingsLinkPressed,
                ]}
              >
                <View>
                  <Text style={styles.settingsLabel}>Printer Struk</Text>
                  <Text style={styles.settingsValue}>Terhubung (Mock)</Text>
                </View>
                <PosIcon name="back" size={20} color={Colors.Text2} style={styles.chevron} />
              </Pressable>
              <SpreadRow label="Versi Aplikasi" value="v1.2.0 (Staging)" valueColor={Colors.Text3} />
              <SpreadRow label="Sinkronisasi" value="Otomatis" valueColor={Colors.SuccessInk} />
            </PosCard>
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
  stateBanner: {
    maxWidth: 980,
    alignSelf: 'center',
    marginBottom: Spacing.s3,
  },
  loadingState: {
    maxWidth: 980,
    alignSelf: 'center',
    backgroundColor: Colors.Surface,
    marginBottom: Spacing.s3,
  },
  mainLayout: {
    gap: Spacing.s4,
    maxWidth: 980,
    width: '100%',
    alignSelf: 'center',
  },
  twoColumnLayout: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  column: {
    flex: 1,
    gap: Spacing.s4,
  },
  sessionCard: {
    padding: Spacing.s4,
    gap: Spacing.s3,
  },
  cashierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: Spacing.s3,
  },
  avatarText: {
    fontSize: 24,
  },
  cashierMeta: {
    flex: 1,
  },
  cashierName: {
    ...Typography.MdBold,
    color: Colors.Text,
  },
  cashierRole: {
    ...Typography.Sm,
    color: Colors.Text2,
  },
  sessionDetails: {
    gap: Spacing.s2,
  },
  card: {
    padding: Spacing.s4,
    gap: Spacing.s3,
  },
  demoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  demoInfo: {
    flex: 1,
    marginRight: Spacing.s2,
  },
  demoLabel: {
    ...Typography.SmMedium,
    color: Colors.Text,
  },
  demoDesc: {
    ...Typography.Xs,
    color: Colors.Text2,
    marginTop: 2,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.Border,
    marginVertical: Spacing.s1,
  },
  settingsLink: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingsLinkPressed: {
    opacity: 0.75,
  },
  settingsLabel: {
    ...Typography.Sm,
    color: Colors.Text2,
  },
  settingsValue: {
    ...Typography.SmSemi,
    color: Colors.SuccessInk,
    marginTop: 2,
  },
  reportValue: {
    ...Typography.SmSemi,
    color: Colors.BrandInk,
    marginTop: 2,
  },
  chevron: {
    transform: [{ rotate: '180deg' }],
  },
});
