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

export interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  stock: number;
  unit?: string;
  category: string;
  tone?: ToneName;
  cartQty?: number;
  onAdd: (id: string) => void;
  style?: StyleProp<ViewStyle>;
}

export const ProductCard = React.memo(function ProductCard({
  id,
  name,
  price,
  stock,
  unit = 'pcs',
  category,
  tone = 'Bread',
  cartQty = 0,
  onAdd,
  style,
}: ProductCardProps) {
  const toneBg = Tone[tone]?.bg || Tone.Bread.bg;
  const toneInk = Tone[tone]?.ink || Tone.Bread.ink;

  // Extract initials (e.g. "Roti Manis" -> "RM")
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');

  return (
    <Pressable
      onPress={() => onAdd(id)}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Tambah ${name} ke keranjang`}
      style={({ pressed }) => [
        styles.card,
        cartQty > 0 && styles.cardActive,
        pressed && styles.pressed,
        style,
      ]}
    >
      {/* Visual Tone Container */}
      <View style={[styles.visualContainer, { backgroundColor: toneBg }]}>
        {/* Stock pill top-left */}
        <View style={styles.stockPill}>
          <Text style={styles.stockText}>{`${stock} ${unit}`}</Text>
        </View>

        {/* Quantity pill top-right if in cart */}
        {cartQty > 0 ? (
          <View style={styles.qtyPill}>
            <Text style={styles.qtyText}>{cartQty}</Text>
          </View>
        ) : null}

        {/* Product Initials Avatar */}
        <Text style={[styles.initialsText, { color: toneInk }]}>{initials}</Text>
      </View>

      {/* Product Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.nameText} numberOfLines={2} ellipsizeMode="tail">
          {name}
        </Text>
        <Text style={styles.subText} numberOfLines={1}>
          {`${unit} · ${category}`}
        </Text>
        <Text style={styles.priceText} numberOfLines={1}>
          {formatRupiah(price)}
        </Text>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.Surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.Border,
    overflow: 'hidden',
    minHeight: Sizes.touch,
  },
  cardActive: {
    borderColor: Colors.Brand,
    borderWidth: 1.5,
  },
  pressed: {
    opacity: 0.85,
  },
  visualContainer: {
    width: '100%',
    aspectRatio: 1.35,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  stockPill: {
    position: 'absolute',
    top: Spacing.s2,
    left: Spacing.s2,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: Spacing.s2,
    paddingVertical: 2,
    borderRadius: Radius.full,
    borderWidth: 0.5,
    borderColor: Colors.Border,
  },
  stockText: {
    ...Typography.XsSemi,
    color: Colors.Text2,
  },
  qtyPill: {
    position: 'absolute',
    top: Spacing.s2,
    right: Spacing.s2,
    backgroundColor: Colors.BrandFill,
    minWidth: 22,
    height: 22,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  qtyText: {
    ...Typography.XsSemi,
    color: Colors.OnFill,
  },
  initialsText: {
    fontSize: 26,
    fontWeight: '700',
  },
  detailsContainer: {
    padding: Spacing.s3,
    gap: 2,
  },
  nameText: {
    ...Typography.MdSemi,
    color: Colors.Text,
    minHeight: 38,
  },
  subText: {
    ...Typography.Xs,
    color: Colors.Text2,
  },
  priceText: {
    ...Typography.MdBold,
    color: Colors.BrandInk,
    marginTop: 2,
  },
});
