import React, { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { PosBadge } from '../../components/PosBadge';
import { PosButton } from '../../components/PosButton';
import { PosCard, SectionTitle } from '../../components/PosCard';
import { PosTopBar } from '../../components/PosBars';
import { usePosActions, usePosState } from '../../state/PosContext';
import { Colors, Radius, Sizes, Spacing, Typography } from '../../theme/tokens';
import type { PaperWidth, PrintCopies } from '../../types';

export interface PrinterSettingsScreenProps {
  onBack?: () => void;
}

export function PrinterSettingsScreen({ onBack }: PrinterSettingsScreenProps) {
  const { printerSettings } = usePosState();
  const actions = usePosActions();
  const [isTesting, setIsTesting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const runTestPrint = () => {
    if (timer.current) clearTimeout(timer.current);
    setFeedback(null);
    setIsTesting(true);
    timer.current = setTimeout(() => {
      setIsTesting(false);
      setFeedback(
        `Test print berhasil (${printerSettings.copies}x, ${printerSettings.paperWidth})`
      );
      timer.current = null;
    }, 1200);
  };

  return (
    <View style={styles.container}>
      <PosTopBar title="Pengaturan Printer" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <PosCard style={styles.card}>
            <View style={styles.printerHeader}>
              <View style={styles.printerInfo}>
                <Text style={styles.printerName}>Printer Kasir Utama</Text>
                <Text style={styles.description}>Printer struk simulasi Phase 1</Text>
              </View>
              <PosBadge label="Terhubung (Mock)" variant="Success" />
            </View>
          </PosCard>

          <PosCard style={styles.card}>
            <SectionTitle title="Ukuran Kertas" />
            <View style={styles.optionsRow}>
              {(['58 mm', '80 mm'] as PaperWidth[]).map((paperWidth) => (
                <OptionButton
                  key={paperWidth}
                  label={paperWidth}
                  selected={printerSettings.paperWidth === paperWidth}
                  onPress={() => actions.setPaperWidth(paperWidth)}
                />
              ))}
            </View>
          </PosCard>

          <PosCard style={styles.card}>
            <SectionTitle title="Jumlah Salinan" />
            <View style={styles.optionsRow}>
              {([1, 2, 3] as PrintCopies[]).map((copies) => (
                <OptionButton
                  key={copies}
                  label={`${copies}`}
                  selected={printerSettings.copies === copies}
                  onPress={() => actions.setCopies(copies)}
                />
              ))}
            </View>
          </PosCard>

          <PosCard style={styles.card}>
            <View style={styles.switchRow}>
              <View style={styles.switchInfo}>
                <Text style={styles.settingLabel}>Auto-print</Text>
                <Text style={styles.description}>
                  Cetak otomatis setelah pembayaran berhasil
                </Text>
              </View>
              <Switch
                testID="printer-auto-print-switch"
                value={printerSettings.autoPrint}
                onValueChange={actions.setAutoPrint}
                trackColor={{ false: Colors.Border, true: Colors.Brand }}
                thumbColor={
                  printerSettings.autoPrint ? Colors.Surface : Colors.SurfaceAlt
                }
              />
            </View>
          </PosCard>

          <PosButton
            label="Test Print"
            onPress={runTestPrint}
            loading={isTesting}
            disabled={isTesting}
            fullWidth
            accessibilityLabel="Jalankan test print mock"
          />
          {feedback ? (
            <View style={styles.feedback} accessibilityLiveRegion="polite">
              <Text style={styles.feedbackText}>{feedback}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

interface OptionButtonProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

function OptionButton({ label, selected, onPress }: OptionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.option,
        selected && styles.optionSelected,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
        {label}
      </Text>
    </Pressable>
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
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 720,
    gap: Spacing.s4,
  },
  card: {
    padding: Spacing.s4,
  },
  printerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s3,
  },
  printerInfo: {
    flex: 1,
  },
  printerName: {
    ...Typography.MdBold,
    color: Colors.Text,
  },
  settingLabel: {
    ...Typography.MdSemi,
    color: Colors.Text,
  },
  description: {
    ...Typography.Sm,
    color: Colors.Text2,
    marginTop: 2,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: Spacing.s2,
  },
  option: {
    minWidth: Sizes.touch,
    minHeight: Sizes.touch,
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.Border,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.s3,
  },
  optionSelected: {
    borderColor: Colors.Brand,
    backgroundColor: Colors.BrandSoft,
    borderWidth: 2,
  },
  optionText: {
    ...Typography.SmSemi,
    color: Colors.Text,
  },
  optionTextSelected: {
    color: Colors.BrandInk,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchInfo: {
    flex: 1,
    marginRight: Spacing.s3,
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
    opacity: 0.8,
  },
});
