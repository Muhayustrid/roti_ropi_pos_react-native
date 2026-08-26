import React from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { PosButton } from '../../components/PosButton';
import { PosCard } from '../../components/PosCard';
import { Colors, Spacing, Typography } from '../../theme/tokens';
import type { RefundReasonCode } from './refundFlow';
import { resolveRefundReason } from './refundFlow';

const reasons: Array<{ code: RefundReasonCode; label: string }> = [
  { code: 'WrongOrder', label: 'Salah pesanan' },
  { code: 'DamagedProduct', label: 'Produk rusak' },
  { code: 'CustomerChangedMind', label: 'Pelanggan berubah pikiran' },
  { code: 'Other', label: 'Lainnya' },
];

export interface RefundReasonScreenProps {
  reasonCode: RefundReasonCode | null;
  note: string;
  onSelect: (reasonCode: RefundReasonCode) => void;
  onChangeNote: (note: string) => void;
  onContinue: () => void;
}

export function RefundReasonScreen({
  reasonCode,
  note,
  onSelect,
  onChangeNote,
  onContinue,
}: RefundReasonScreenProps) {
  const validReason = resolveRefundReason(reasonCode, note);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.helper}>Pilih alasan untuk pencatatan pengembalian.</Text>
        {reasons.map((reason) => (
          <PosCard
            key={reason.code}
            onPress={() => onSelect(reason.code)}
            selected={reasonCode === reason.code}
            accessibilityLabel={`Alasan ${reason.label}`}
            style={styles.reasonCard}
          >
            <Text style={styles.reasonLabel}>{reason.label}</Text>
          </PosCard>
        ))}
        {reasonCode === 'Other' ? (
          <TextInput
            value={note}
            onChangeText={onChangeNote}
            placeholder="Tulis alasan pengembalian"
            accessibilityLabel="Catatan alasan pengembalian"
            multiline
            style={styles.input}
          />
        ) : null}
      </ScrollView>
      <View style={styles.footer}>
        <PosButton
          label="Lanjutkan"
          onPress={onContinue}
          disabled={!validReason}
          fullWidth
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.s4, gap: Spacing.s3 },
  helper: { ...Typography.Sm, color: Colors.Text2 },
  reasonCard: { padding: Spacing.s4, minHeight: 56, justifyContent: 'center' },
  reasonLabel: { ...Typography.MdSemi, color: Colors.Text },
  input: {
    minHeight: 96,
    borderWidth: 1,
    borderColor: Colors.InputBorder,
    backgroundColor: Colors.Surface,
    color: Colors.Text,
    padding: Spacing.s3,
    textAlignVertical: 'top',
  },
  footer: {
    padding: Spacing.s4,
    backgroundColor: Colors.Surface,
    borderTopWidth: 1,
    borderTopColor: Colors.Border,
  },
});
