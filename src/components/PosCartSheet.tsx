import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Pressable, Dimensions, type StyleProp, type ViewStyle } from 'react-native';
import type { CartLine as CartLineType, Customer, Promo } from '../types';
import { Colors, Radius, Typography, Sizes, Spacing } from '../theme/tokens';
import { PosCard, SectionTitle, SpreadRow } from './PosCard';
import { PosButton } from './PosButton';
import { PosBadge } from './PosBadge';
import { PosIcon } from './PosIcon';
import { CartLine } from '../features/cashier/CartLine';
import { formatRupiah } from '../utils/money';
import { calculateCart } from '../utils/cart';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_HEIGHT_COLLAPSED = 120;
const SHEET_HEIGHT_EXPANDED = SCREEN_HEIGHT * 0.75;

export interface PosCartSheetProps {
  visible: boolean;
  cart: CartLineType[];
  customer: Customer;
  promo: Promo;
  couponCode: string;
  onSelectCustomerClick: () => void;
  onSelectOfferClick: () => void;
  onIncrement: (productId: string) => void;
  onDecrement: (productId: string) => void;
  onRemove: (productId: string) => void;
  onCheckout: () => void;
  onClose: () => void;
  style?: StyleProp<ViewStyle>;
}

export function PosCartSheet({
  visible,
  cart,
  customer,
  promo,
  couponCode,
  onSelectCustomerClick,
  onSelectOfferClick,
  onIncrement,
  onDecrement,
  onRemove,
  onCheckout,
  onClose,
  style,
}: PosCartSheetProps) {
  const sheetY = useMemo(() => new Animated.Value(SHEET_HEIGHT_COLLAPSED), []);
  const [dragging, setDragging] = useState(false);

  const toggleExpand = () => {
    const targetValue = dragging ? SHEET_HEIGHT_COLLAPSED : SHEET_HEIGHT_EXPANDED;
    Animated.spring(sheetY, {
      toValue: targetValue,
      useNativeDriver: false,
      bounciness: 0,
      stiffness: 300,
    }).start();
    if (targetValue === SHEET_HEIGHT_COLLAPSED) setDragging(false);
  };

  const handleDragStart = () => {
    sheetY.stopAnimation();
  };

  const handleDragMove = (_: unknown, gesture: { dy: number }) => {
    let newY = SHEET_HEIGHT_COLLAPSED + gesture.dy;
    newY = Math.min(Math.max(newY, SHEET_HEIGHT_COLLAPSED - 80), SHEET_HEIGHT_EXPANDED);
    sheetY.setValue(newY);
  };

  const handleDragEnd = (_: unknown, gesture: { dy: number; vy: number }) => {
    const shouldExpand = gesture.dy < -50 || gesture.dy > 50;
    const targetValue = shouldExpand ? (gesture.dy < 0 ? SHEET_HEIGHT_EXPANDED : SHEET_HEIGHT_COLLAPSED) :
                        dragging ? SHEET_HEIGHT_COLLAPSED : SHEET_HEIGHT_EXPANDED;
    Animated.spring(sheetY, {
      toValue: targetValue,
      useNativeDriver: false,
      velocity: gesture.vy * -1,
      bounciness: 0,
      stiffness: 300,
    }).start(() => setDragging(!shouldExpand));
  };

  const panHandlers = useMemo(
    () => ({
      onStartShouldSetPanResponder: () => !dragging,
      onMoveShouldSetPanResponder: (_: unknown, gesture: { dy: number }) => Math.abs(gesture.dy) > 10,
      onPanResponderGrant: handleDragStart,
      onPanResponderMove: handleDragMove,
      onPanResponderRelease: handleDragEnd,
    }),
    [dragging]
  );

  const totals = useMemo(() => calculateCart(cart, promo, couponCode), [cart, promo, couponCode]);
  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (!visible) return null;

  return (
    <Pressable onPress={toggleExpand} {...panHandlers}>
      <Animated.View style={[styles.sheetContainer, { height: sheetY }, style]}>
        {/* Drag Handle */}
        <Pressable onPress={onClose} style={styles.dragHandleWrapper}>
          <Animated.View
            style={[
              styles.dragHandle,
              {
                transform: [
                  {
                    translateY: sheetY.interpolate({
                      inputRange: [SHEET_HEIGHT_COLLAPSED, SHEET_HEIGHT_EXPANDED],
                      outputRange: [0, SCREEN_HEIGHT / 2],
                    }),
                  },
                ],
              },
            ]}
          />
        </Pressable>

        {/* Cart Content */}
        <View style={styles.contentArea}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Customer Selector Card */}
            <PosCard style={styles.customerCard} onPress={onSelectCustomerClick}>
              <View style={styles.customerRow}>
                <View style={styles.customerAvatar}>
                  <PosIcon name="person" size={20} color={Colors.BrandInk} />
                </View>
                <View style={styles.customerInfo}>
                  <Text style={styles.customerName} numberOfLines={1}>{customer.name}</Text>
                  <Text style={styles.customerPhone} numberOfLines={1}>
                    {customer.detail || 'Pelanggan Umum'}
                  </Text>
                </View>
                <Pressable
                  onPress={onSelectCustomerClick}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Ubah pelanggan"
                  style={({ pressed }) => [styles.changeTextBtn, pressed && styles.pressed]}
                >
                  <Text style={styles.changeActionText}>Ubah</Text>
                </Pressable>
              </View>
            </PosCard>

            {/* Section: Item */}
            <SectionTitle
              title="Item"
              trailing={totalItemCount > 0 ? <PosBadge label={`${totalItemCount} item`} variant="Neutral" /> : null}
              style={styles.itemSectionTitle}
            />

            {/* Cart Items or Empty State */}
            {cart.length === 0 ? (
              <View style={styles.emptyCartCard}>
                <PosIcon name="cart" size={32} color={Colors.Text2} />
                <Text style={styles.emptyCartTitle}>Keranjang masih kosong</Text>
                <Text style={styles.emptyCartBody}>Pilih produk di katalog untuk mulai transaksi.</Text>
              </View>
            ) : (
              <View style={styles.cartListContainer}>
                {cart.map((line) => (
                  <CartLine
                    key={line.product.id}
                    productId={line.product.id}
                    name={line.product.name}
                    price={line.product.price}
                    quantity={line.quantity}
                    tone={line.product.tone}
                    onIncrement={onIncrement}
                    onDecrement={onDecrement}
                    onRemove={onRemove}
                  />
                ))}
              </View>
            )}

            {/* Offers Card */}
            <PosCard style={styles.offerCard} onPress={onSelectOfferClick}>
              <View style={styles.offerHeader}>
                <View style={styles.offerTitleRow}>
                  <PosIcon name="offer" size={18} color={Colors.BrandInk} />
                  <Text style={styles.offerTitleText}>Penawaran</Text>
                </View>
                {(totals.promoDiscount > 0 || totals.couponDiscount > 0) ? (
                  <PosBadge label="Hemat terbaik" variant="Success" />
                ) : null}
              </View>
              <View style={styles.offerDivider} />
              <View style={styles.offerRow}>
                <View style={styles.offerCol}>
                  <Text style={styles.offerSubLabel}>Promo</Text>
                  <Text style={styles.offerValueText}>{promo.name}</Text>
                </View>
                <Pressable onPress={onSelectOfferClick} accessible={true} accessibilityRole="button" accessibilityLabel="Ubah promo" style={({ pressed }) => [styles.changeTextBtn, pressed && styles.pressed]}>
                  <Text style={styles.changeActionText}>Ubah</Text>
                </Pressable>
              </View>
              <View style={styles.offerRow}>
                <View style={styles.offerCol}>
                  <Text style={styles.offerSubLabel}>Kupon</Text>
                  <Text style={styles.offerValueText}>
                    {couponCode ? `${couponCode} · ${formatRupiah(totals.couponDiscount)} off` : 'Belum ada kupon'}
                  </Text>
                </View>
                <Pressable
                  onPress={onSelectOfferClick}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={couponCode ? 'Ubah kupon' : 'Tambah kupon'}
                  style={({ pressed }) => [styles.changeTextBtn, pressed && styles.pressed]}
                >
                  <Text style={styles.changeActionText}>{couponCode ? 'Ubah' : 'Tambah'}</Text>
                </Pressable>
              </View>
            </PosCard>

            {/* Summary Card */}
            <PosCard style={styles.summaryCard} backgroundColor={Colors.SurfaceAlt}>
              <SpreadRow label="Subtotal" value={formatRupiah(totals.subtotal)} />
              {totals.promoDiscount > 0 ? (
                <SpreadRow label="Promosi" value={`−${formatRupiah(totals.promoDiscount)}`} valueColor={Colors.SuccessInk} />
              ) : null}
              {totals.couponDiscount > 0 ? (
                <SpreadRow label="Kupon" value={`−${formatRupiah(totals.couponDiscount)}`} valueColor={Colors.SuccessInk} />
              ) : null}
              <SpreadRow label="Pajak (PB1 10%)" value={formatRupiah(totals.tax)} />
              <View style={styles.summaryDivider} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{formatRupiah(totals.total)}</Text>
              </View>
            </PosCard>
          </ScrollView>

          {/* Sticky Bottom Actions */}
          <View style={styles.actionFooter}>
            <PosButton
              label="Lanjut ke Pembayaran"
              variant="Primary"
              onPress={onCheckout}
              disabled={cart.length === 0}
              fullWidth
            />
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    backgroundColor: Colors.Surface,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  dragHandleWrapper: {
    alignItems: 'center',
    paddingTop: Spacing.s2,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.Border,
  },
  contentArea: {
    flex: 1,
    padding: Spacing.s4,
    paddingBottom: Spacing.s6,
  },
  customerCard: {
    padding: Spacing.s3,
    marginBottom: Spacing.s3,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.BrandSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.s3,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    ...Typography.MdSemi,
    color: Colors.Text,
  },
  customerPhone: {
    ...Typography.Xs,
    color: Colors.Text2,
    marginTop: 2,
  },
  changeTextBtn: {
    minHeight: Sizes.touch,
    justifyContent: 'center',
    paddingHorizontal: Spacing.s2,
  },
  changeActionText: {
    ...Typography.SmMedium,
    color: Colors.BrandInk,
  },
  itemSectionTitle: {
    marginTop: Spacing.s1,
    marginBottom: Spacing.s1,
  },
  emptyCartCard: {
    backgroundColor: Colors.Surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.Border,
    padding: Spacing.s6,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.s2,
  },
  emptyCartIcon: {
    fontSize: 32,
    marginBottom: Spacing.s2,
  },
  emptyCartTitle: {
    ...Typography.MdSemi,
    color: Colors.Text,
    marginBottom: 4,
  },
  emptyCartBody: {
    ...Typography.Sm,
    color: Colors.Text2,
    textAlign: 'center',
  },
  cartListContainer: {
    gap: Spacing.s2,
  },
  offerCard: {
    padding: Spacing.s4,
    gap: Spacing.s2,
    marginBottom: Spacing.s3,
  },
  offerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  offerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s2,
  },
  offerTitleText: {
    ...Typography.MdSemi,
    color: Colors.Text,
  },
  offerDivider: {
    height: 1,
    backgroundColor: Colors.Border,
    marginVertical: 4,
  },
  offerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  offerCol: {
    flex: 1,
  },
  offerSubLabel: {
    ...Typography.Xs,
    color: Colors.Text2,
  },
  offerValueText: {
    ...Typography.SmSemi,
    color: Colors.Text,
    marginTop: 2,
  },
  summaryCard: {
    padding: Spacing.s4,
    gap: Spacing.s2,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: Colors.Border,
    marginVertical: Spacing.s1,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  totalLabel: {
    ...Typography.LgBold,
    color: Colors.Text,
  },
  totalValue: {
    ...Typography.LgBold,
    color: Colors.BrandInk,
  },
  actionFooter: {
    backgroundColor: Colors.Surface,
    borderTopWidth: 1,
    borderTopColor: Colors.Border,
    padding: Spacing.s3,
    gap: Spacing.s2,
  },
  pressed: {
    opacity: 0.6,
  },
});
