import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  PanResponder,
  Pressable,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type { CartLine as CartLineType, Customer, Promo } from '../types';
import { Colors, Radius, Typography, Sizes, Spacing } from '../theme/tokens';
import { PosCard, SectionTitle, SpreadRow } from './PosCard';
import { PosButton } from './PosButton';
import { PosBadge } from './PosBadge';
import { PosIcon } from './PosIcon';
import { CartLine } from '../features/cashier/CartLine';
import { formatRupiah } from '../utils/money';
import { calculateCart } from '../utils/cart';

export const SHEET_HEIGHT_COLLAPSED = 120;
export const SPRING_CONFIG = {
  stiffness: 300,
  damping: 30,
  mass: 1,
};

export type SheetSnapState = 'collapsed' | 'expanded';
export type SnapAction = 'collapsed' | 'expanded' | 'dismiss';

export function resolveCartSheetSnap(
  currentState: SheetSnapState,
  gesture: { dy: number; vy?: number }
): SnapAction {
  const dy = gesture.dy;
  const vy = gesture.vy ?? 0;

  if (currentState === 'collapsed') {
    // Swipe down past threshold from collapsed -> dismiss
    if (dy > 60 || vy > 0.8) {
      return 'dismiss';
    }
    // Swipe up past threshold from collapsed -> expand
    if (dy < -50 || vy < -0.5) {
      return 'expanded';
    }
    // Small gesture -> stay collapsed
    return 'collapsed';
  } else {
    // currentState === 'expanded'
    // Swipe down past threshold from expanded -> collapse
    if (dy > 50 || vy > 0.5) {
      return 'collapsed';
    }
    // Small gesture / swipe up -> stay expanded
    return 'expanded';
  }
}

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
  const { height: windowHeight } = useWindowDimensions();
  const expandedHeight = windowHeight;

  const [snapState, setSnapState] = useState<SheetSnapState>('collapsed');
  const snapStateRef = useRef<SheetSnapState>('collapsed');
  snapStateRef.current = snapState;

  const heightAnim = useRef(new Animated.Value(SHEET_HEIGHT_COLLAPSED)).current;
  const startDragHeight = useRef(SHEET_HEIGHT_COLLAPSED);

  useEffect(() => {
    if (visible && snapState === 'expanded') {
      Animated.spring(heightAnim, {
        toValue: expandedHeight,
        useNativeDriver: false,
        ...SPRING_CONFIG,
      }).start();
    }
  }, [expandedHeight, visible, snapState, heightAnim]);

  const animateToState = (nextState: SheetSnapState) => {
    const targetHeight = nextState === 'expanded' ? expandedHeight : SHEET_HEIGHT_COLLAPSED;
    setSnapState(nextState);
    Animated.spring(heightAnim, {
      toValue: targetHeight,
      useNativeDriver: false,
      ...SPRING_CONFIG,
    }).start();
  };

  const toggleExpand = () => {
    const nextState: SheetSnapState = snapStateRef.current === 'expanded' ? 'collapsed' : 'expanded';
    animateToState(nextState);
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_: unknown, gesture) => Math.abs(gesture.dy) > 5,
        onPanResponderGrant: () => {
          heightAnim.stopAnimation();
          startDragHeight.current =
            snapStateRef.current === 'expanded' ? expandedHeight : SHEET_HEIGHT_COLLAPSED;
        },
        onPanResponderMove: (_: unknown, gesture) => {
          // Drag up (negative dy) increases height; drag down (positive dy) decreases height
          const newHeight = startDragHeight.current - gesture.dy;
          const minH = SHEET_HEIGHT_COLLAPSED - 60;
          const maxH = expandedHeight + 40;
          const clampedHeight = Math.min(Math.max(newHeight, minH), maxH);
          heightAnim.setValue(clampedHeight);
        },
        onPanResponderRelease: (_: unknown, gesture) => {
          const action = resolveCartSheetSnap(snapStateRef.current, gesture);
          if (action === 'dismiss') {
            Animated.timing(heightAnim, {
              toValue: 0,
              duration: 200,
              useNativeDriver: false,
            }).start(() => {
              onClose();
            });
          } else {
            animateToState(action);
          }
        },
      }),
    [expandedHeight, heightAnim, onClose]
  );

  const totals = useMemo(() => calculateCart(cart, promo, couponCode), [cart, promo, couponCode]);
  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.sheetContainer, { height: heightAnim }, style]}>
      {/* Drag & Header Zone */}
      <View {...panResponder.panHandlers} style={styles.dragZone}>
        <Pressable
          onPress={toggleExpand}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={snapState === 'expanded' ? 'Kecilkan keranjang' : 'Buka keranjang'}
          style={styles.dragHandleWrapper}
        >
          <View style={styles.dragHandle} />
        </Pressable>
        {snapState === 'collapsed' ? (
          <Pressable
            onPress={toggleExpand}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Keranjang belanja, ${totalItemCount} item, total ${formatRupiah(totals.total)}`}
            style={styles.collapsedHeaderRow}
          >
            <View style={styles.collapsedHeaderLeft}>
              <View style={styles.collapsedBadge}>
                <PosIcon name="cart" size={16} color={Colors.BrandInk} />
                <Text style={styles.collapsedBadgeText}>{totalItemCount} item</Text>
              </View>
              <Text style={styles.collapsedTotalText}>{formatRupiah(totals.total)}</Text>
            </View>
            <Pressable
              onPress={onClose}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Tutup keranjang"
              hitSlop={8}
              style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
            >
              <PosIcon name="close" size={18} color={Colors.Text2} />
            </Pressable>
          </Pressable>
        ) : (
          <View style={styles.expandedHeaderRow}>
            <Text style={styles.expandedTitle}>Keranjang Belanja</Text>
            <Pressable
              onPress={onClose}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Tutup keranjang"
              hitSlop={8}
              style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
            >
              <PosIcon name="close" size={20} color={Colors.Text2} />
            </Pressable>
          </View>
        )}
      </View>

      {/* Cart Content Area */}
      <View style={styles.contentArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
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
              <Pressable
                onPress={onSelectOfferClick}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Ubah promo"
                style={({ pressed }) => [styles.changeTextBtn, pressed && styles.pressed]}
              >
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
    overflow: 'hidden',
  },
  dragZone: {
    backgroundColor: Colors.Surface,
    paddingTop: Spacing.s2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.Border,
  },
  dragHandleWrapper: {
    alignItems: 'center',
    paddingVertical: Spacing.s1,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.Border,
  },
  collapsedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.s4,
    paddingBottom: Spacing.s2,
  },
  collapsedHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s2,
  },
  collapsedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.BrandSoft,
    paddingHorizontal: Spacing.s2,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  collapsedBadgeText: {
    ...Typography.SmSemi,
    color: Colors.BrandInk,
  },
  collapsedTotalText: {
    ...Typography.MdBold,
    color: Colors.Text,
  },
  expandedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.s4,
    paddingBottom: Spacing.s2,
  },
  expandedTitle: {
    ...Typography.MdBold,
    color: Colors.Text,
  },
  closeButton: {
    padding: Spacing.s1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  scrollContent: {
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
