import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Colors, Radius, Typography, Sizes, Spacing } from '../../theme/tokens';
import { PosTopBar, PosActionFooter } from '../../components/PosBars';
import { PosCard, PosPaddedCard, SpreadRow } from '../../components/PosCard';
import { PosButton } from '../../components/PosButton';
import { usePosState, usePosDerived, usePosActions } from '../../state/PosContext';
import { formatRupiah } from '../../utils/money';
import { getWindowClass } from '../../utils/layout';

export interface CashEntryScreenProps {
  onBack?: () => void;
  onComplete?: () => void;
  width?: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
}

export function CashEntryScreen({
  onBack,
  onComplete,
  width: customWidth,
  height: customHeight,
  style,
}: CashEntryScreenProps) {
  const windowDims = useWindowDimensions();
  const width = customWidth ?? windowDims.width;
  const height = customHeight ?? windowDims.height;
  const windowClass = getWindowClass(width, height);

  const state = usePosState();
  const derived = usePosDerived();
  const actions = usePosActions();

  const total = derived.totals.total;
  const cashReceived = state.cashReceived;
  const change = derived.change;
  const remaining = derived.remaining;
  const isPaidEnough = cashReceived >= total && total > 0;

  // Quick preset amounts
  const quickAmounts = useMemo(() => {
    return [
      { label: 'Uang Pas', amount: total },
      { label: 'Rp 50.000', amount: 50000 },
      { label: 'Rp 100.000', amount: 100000 },
      { label: 'Rp 200.000', amount: 200000 },
    ];
  }, [total]);

  const handleKeypadPress = (key: string) => {
    if (key === 'backspace') {
      actions.backspaceCash();
    } else {
      actions.appendCashDigits(key);
    }
  };

  const handleQuickAmount = (amount: number) => {
    actions.setCashExact(amount);
  };

  const isTwoPane = windowClass.hasSidePane;

  // Figures Column Component
  const figuresColumn = (
    <View style={styles.figuresSection}>
      {/* Dominant Jumlah Diterima Card */}
      <PosCard style={styles.receivedCard} backgroundColor={Colors.Surface}>
        <Text style={styles.receivedLabel}>Jumlah Diterima</Text>
        <Text
          style={[
            styles.receivedAmount,
            cashReceived > 0 ? styles.receivedAmountActive : styles.receivedAmountZero,
          ]}
        >
          {formatRupiah(cashReceived)}
        </Text>
      </PosCard>

      {/* Figures Summary Card */}
      <PosPaddedCard style={styles.figuresCard} backgroundColor={Colors.SurfaceAlt}>
        <SpreadRow label="Total Tagihan" value={formatRupiah(total)} />
        {remaining > 0 ? (
          <SpreadRow
            label="Sisa Kurang"
            value={formatRupiah(remaining)}
            boldValue
            valueColor={Colors.DangerInk}
          />
        ) : (
          <SpreadRow
            label="Kembalian"
            value={formatRupiah(change)}
            boldValue
            valueColor={Colors.Text}
          />
        )}
      </PosPaddedCard>

      {/* Quick Amount Buttons */}
      <View style={styles.quickAmountsRow}>
        {quickAmounts.map((qa, idx) => (
          <Pressable
            key={`qa-${idx}`}
            onPress={() => handleQuickAmount(qa.amount)}
            style={({ pressed }) => [
              styles.quickAmountBtn,
              pressed && styles.quickAmountBtnPressed,
            ]}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Set nominal ${qa.label}`}
          >
            <Text style={styles.quickAmountText}>{qa.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  // Keypad Component
  const keypad = (
    <View style={styles.keypadContainer}>
      <View style={styles.keypadGrid}>
        {[
          ['1', '2', '3'],
          ['4', '5', '6'],
          ['7', '8', '9'],
          ['000', '0', 'backspace'],
        ].map((row, rowIdx) => (
          <View key={`row-${rowIdx}`} style={styles.keypadRow}>
            {row.map((key) => {
              const isBksp = key === 'backspace';
              return (
                <Pressable
                  key={key}
                  onPress={() => handleKeypadPress(key)}
                  style={({ pressed }) => [
                    styles.keypadKey,
                    pressed && styles.keypadKeyPressed,
                  ]}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={isBksp ? 'Hapus satu angka' : `Angka ${key}`}
                >
                  <Text style={isBksp ? styles.keypadBackspaceText : styles.keypadText}>
                    {isBksp ? '⌫' : key}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      {/* Task TopBar */}
      <PosTopBar
        title="Pembayaran · Tunai"
        onBack={onBack}
        backIsClose
      />

      {/* Content Area */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.contentWrapper,
            isTwoPane ? styles.twoPaneContainer : styles.singleColumnContainer,
          ]}
        >
          {isTwoPane ? (
            <>
              <View style={styles.paneLeft}>{figuresColumn}</View>
              <View style={styles.paneRight}>{keypad}</View>
            </>
          ) : (
            <>
              {figuresColumn}
              {keypad}
            </>
          )}
        </View>
      </ScrollView>

      {/* Sticky Action Footer */}
      <PosActionFooter width={width}>
        <PosButton
          label="Selesaikan Pembayaran"
          variant="Primary"
          disabled={!isPaidEnough}
          onPress={() => onComplete?.()}
          style={styles.completeBtn}
          accessibilityLabel="Selesaikan pembayaran tunai"
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
  singleColumnContainer: {
    maxWidth: 560,
    gap: Spacing.s4,
  },
  twoPaneContainer: {
    maxWidth: 980,
    flexDirection: 'row',
    gap: Spacing.s4,
  },
  paneLeft: {
    flex: 1,
  },
  paneRight: {
    flex: 1,
  },
  figuresSection: {
    gap: Spacing.s3,
  },
  receivedCard: {
    padding: Spacing.s4,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.Border,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 96,
  },
  receivedLabel: {
    ...Typography.Sm,
    color: Colors.Text2,
    marginBottom: 4,
  },
  receivedAmount: {
    ...Typography.Xxl,
  },
  receivedAmountActive: {
    color: Colors.Text,
  },
  receivedAmountZero: {
    color: Colors.Text3,
  },
  figuresCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.Border,
    gap: Spacing.s2,
  },
  quickAmountsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.s2,
  },
  quickAmountBtn: {
    flex: 1,
    minWidth: '45%',
    height: 44,
    backgroundColor: Colors.Surface,
    borderWidth: 1,
    borderColor: Colors.Border,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.s2,
  },
  quickAmountBtnPressed: {
    backgroundColor: Colors.SurfaceAlt,
  },
  quickAmountText: {
    ...Typography.SmSemi,
    color: Colors.Text,
  },
  keypadContainer: {
    backgroundColor: Colors.Surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.Border,
    padding: Spacing.s3,
  },
  keypadGrid: {
    gap: Spacing.s2,
  },
  keypadRow: {
    flexDirection: 'row',
    gap: Spacing.s2,
  },
  keypadKey: {
    flex: 1,
    height: Sizes.keypadKey,
    backgroundColor: Colors.SurfaceAlt,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keypadKeyPressed: {
    backgroundColor: Colors.Border,
  },
  keypadText: {
    ...Typography.Xl,
    color: Colors.Text,
  },
  keypadBackspaceText: {
    fontSize: 22,
    color: Colors.Text,
  },
  completeBtn: {
    width: '100%',
  },
});
