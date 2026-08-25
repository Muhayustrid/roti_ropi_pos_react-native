import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Colors, Radius, Typography, Sizes, Spacing, Tone, type ToneName } from '../../theme/tokens';
import { formatRupiah } from '../../utils/money';

export interface CartLineProps {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  tone?: ToneName;
  onIncrement: (productId: string) => void;
  onDecrement: (productId: string) => void;
  onRemove: (productId: string) => void;
  style?: StyleProp<ViewStyle>;
}

export const CartLine = React.memo(function CartLine({
  productId,
  name,
  price,
  quantity,
  tone = 'Bread',
  onIncrement,
  onDecrement,
  onRemove,
  style,
}: CartLineProps) {
  const toneBg = Tone[tone]?.bg || Tone.Bread.bg;
  const toneInk = Tone[tone]?.ink || Tone.Bread.ink;

  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');

  const lineTotal = price * quantity;

  return (
    <View style={[styles.container, style]}>
      {/* Top row: Avatar + Details + Hapus button */}
      <View style={styles.topRow}>
        <View style={[styles.avatar, { backgroundColor: toneBg }]}>
          <Text style={[styles.avatarText, { color: toneInk }]}>{initials}</Text>
        </View>

        <View style={styles.infoCol}>
          <Text style={styles.nameText} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.priceCalcText}>
            {`${quantity} × ${formatRupiah(price)}`}
          </Text>
        </View>

        <Pressable
          onPress={() => onRemove(productId)}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Hapus ${name}`}
          style={({ pressed }) => [styles.removeButton, pressed && styles.pressed]}
        >
          <Text style={styles.removeText}>Hapus</Text>
        </Pressable>
      </View>

      {/* Bottom row: Line total + Stepper */}
      <View style={styles.bottomRow}>
        <Text style={styles.totalText}>{formatRupiah(lineTotal)}</Text>

        {/* Stepper controls */}
        <View style={styles.stepperPill}>
          <Pressable
            onPress={() => onDecrement(productId)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Kurangi ${name}`}
            style={({ pressed }) => [styles.stepperButton, pressed && styles.stepperPressed]}
          >
            <Text style={styles.stepperButtonText}>−</Text>
          </Pressable>

          <View style={styles.qtyContainer}>
            <Text style={styles.qtyNumberText}>{quantity}</Text>
          </View>

          <Pressable
            onPress={() => onIncrement(productId)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Tambah ${name}`}
            style={({ pressed }) => [styles.stepperButton, pressed && styles.stepperPressed]}
          >
            <Text style={styles.stepperButtonText}>+</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.Surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.Border,
    padding: Spacing.s3,
    marginBottom: Spacing.s2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.s2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.s3,
  },
  avatarText: {
    ...Typography.MdBold,
  },
  infoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  nameText: {
    ...Typography.MdSemi,
    color: Colors.Text,
  },
  priceCalcText: {
    ...Typography.Sm,
    color: Colors.Text2,
    marginTop: 2,
  },
  removeButton: {
    minHeight: Sizes.touch,
    justifyContent: 'center',
    paddingHorizontal: Spacing.s2,
  },
  removeText: {
    ...Typography.SmMedium,
    color: Colors.DangerInk,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.s1,
  },
  totalText: {
    ...Typography.MdBold,
    color: Colors.BrandInk,
  },
  stepperPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.SurfaceAlt,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.Border,
    height: Sizes.touch,
  },
  stepperButton: {
    width: Sizes.touch,
    height: Sizes.touch,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.Text,
  },
  qtyContainer: {
    minWidth: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  qtyNumberText: {
    ...Typography.SmSemi,
    color: Colors.Text,
  },
  pressed: {
    opacity: 0.6,
  },
  stepperPressed: {
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    borderRadius: Radius.full,
  },
});
