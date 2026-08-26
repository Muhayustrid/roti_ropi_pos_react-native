import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PosButton } from '../../components/PosButton';
import { PosCard } from '../../components/PosCard';
import { Colors, Radius, Sizes, Spacing, Typography } from '../../theme/tokens';
import { formatRupiah } from '../../utils/money';
import type { Transaction } from '../../types';
import { getRemainingQuantity } from './refundFlow';

export interface RefundItemSelectionProps {
  transaction: Transaction;
  quantities: Record<number, number>;
  onSelectAll: () => void;
  onChangeQuantity: (lineIndex: number, quantity: number) => void;
  onContinue: () => void;
}

export function RefundItemSelection({
  transaction,
  quantities,
  onSelectAll,
  onChangeQuantity,
  onContinue,
}: RefundItemSelectionProps) {
  const selectedQuantity = Object.values(quantities).reduce(
    (sum, quantity) => sum + quantity,
    0
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.helper}>Pilih semua item tersisa atau atur jumlah per item.</Text>
        <PosButton
          label="Semua Item Tersisa"
          variant="Tonal"
          onPress={onSelectAll}
          fullWidth
        />
        {transaction.lines.map((line, lineIndex) => {
          const remaining = getRemainingQuantity(transaction, lineIndex);
          const quantity = quantities[lineIndex] ?? 0;
          return (
            <PosCard key={`${line.productName}-${lineIndex}`} style={styles.itemCard}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{line.productName}</Text>
                <Text style={styles.itemMeta}>
                  {formatRupiah(line.price)} · Sisa {remaining}
                </Text>
              </View>
              <View style={styles.quantityRow}>
                <QuantityButton
                  label={`Kurangi ${line.productName}, jumlah ${quantity}`}
                  symbol="−"
                  disabled={quantity === 0}
                  onPress={() => onChangeQuantity(lineIndex, quantity - 1)}
                />
                <Text style={styles.quantity}>{quantity}</Text>
                <QuantityButton
                  label={`Tambah ${line.productName}, jumlah ${quantity}`}
                  symbol="+"
                  disabled={quantity >= remaining}
                  onPress={() => onChangeQuantity(lineIndex, quantity + 1)}
                />
              </View>
            </PosCard>
          );
        })}
      </ScrollView>
      <View style={styles.footer}>
        <PosButton
          label={`Lanjutkan · ${selectedQuantity} item`}
          onPress={onContinue}
          disabled={selectedQuantity === 0}
          fullWidth
        />
      </View>
    </View>
  );
}

function QuantityButton({
  label,
  symbol,
  disabled,
  onPress,
}: {
  label: string;
  symbol: string;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.quantityButton,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={styles.quantityButtonText}>{symbol}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.s4, gap: Spacing.s3 },
  helper: { ...Typography.Sm, color: Colors.Text2 },
  itemCard: {
    padding: Spacing.s4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemInfo: { flex: 1, marginRight: Spacing.s3 },
  itemName: { ...Typography.MdSemi, color: Colors.Text },
  itemMeta: { ...Typography.Xs, color: Colors.Text2, marginTop: Spacing.s1 },
  quantityRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.s2 },
  quantityButton: {
    width: Sizes.touch,
    height: Sizes.touch,
    borderRadius: Radius.full,
    backgroundColor: Colors.BrandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: { ...Typography.Xl, color: Colors.BrandInk },
  quantity: { ...Typography.MdBold, color: Colors.Text, minWidth: 24, textAlign: 'center' },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.7 },
  footer: {
    padding: Spacing.s4,
    backgroundColor: Colors.Surface,
    borderTopWidth: 1,
    borderTopColor: Colors.Border,
  },
});
